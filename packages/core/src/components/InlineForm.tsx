import { IEntityData, SubEntityType, isEmpty } from "../utils";
import React from "react";
import { FormProvider, FormState, useForm } from "react-hook-form";
import { FormConstants } from "../constants";
import {
  CheckDefaultValues,
  CheckValidDropdownOptions,
  ExecuteComputedValue,
  GetConfirmInputModalProps,
  GetComputedValuesOnDirtyFields,
  InitOnCreateFormState,
  InitOnEditFormState,
  IsExpandVisible,
} from "../helpers/InlineFormHelper";
import { IRulesEngineState, IRuntimeFormState } from "../types/IRuntimeFieldState";
import { IConfirmInputModalProps } from "../types/IConfirmInputModalProps";
import { IFieldConfig } from "../types/IFieldConfig";
import { IFormConfig } from "../types/IFormConfig";
import { IFormosaicProps } from "../types/IFormosaicProps";
import { UseRulesEngineContext } from "../providers/RulesEngineProvider";
import { FormStrings } from "../strings";
import { useFormAnalytics } from "../hooks/useFormAnalytics";
import ConfirmInputsModal from "./ConfirmInputsModal";
import { FormFields } from "./InlineFormFields";

interface IFormosaicComponentProps extends IFormosaicProps {
  /** v2 form config (preferred). If provided, fieldConfigs is ignored. */
  formConfig?: IFormConfig;
  /** v1-style field configs (for migration). Use formConfig instead. */
  fieldConfigs?: Record<string, IFieldConfig>;
  defaultValues: IEntityData;
  saveData?: (entityData: IEntityData, dirtyFieldNames?: string[]) => Promise<IEntityData>;
  saveTimeoutMs?: number;
  maxSaveRetries?: number;
  renderExpandButton?: (props: { isExpanded: boolean; onToggle: () => void }) => React.JSX.Element;
  renderFilterInput?: (props: { onChange: (value: string) => void }) => React.JSX.Element;
  renderDialog?: (props: { isOpen: boolean; onSave: () => void; onCancel: () => void; children: React.ReactNode }) => React.JSX.Element;
  isManualSave?: boolean;
  renderSaveButton?: (props: { onSave: () => void; isDirty: boolean; isValid: boolean; isSubmitting: boolean }) => React.ReactNode;
  formErrors?: string[];
  /** Per-field server-side errors to inject (e.g. from a failed API save). Keys are field names, values are error messages. */
  fieldErrors?: Record<string, string>;
  renderLabel?: (props: { id: string; labelId: string; label?: string; required?: boolean }) => React.ReactNode;
  renderError?: (props: { id: string; error?: import("react-hook-form").FieldError; errorCount?: number }) => React.ReactNode;
  renderStatus?: (props: { id: string; saving?: boolean; savePending?: boolean; errorCount?: number; isManualSave?: boolean }) => React.ReactNode;
  /** Called with validated form values when the user submits. Works alongside auto-save. */
  onSubmit?: (values: IEntityData) => void | Promise<void>;
  /** Called with RHF FieldErrors when submit validation fails. */
  onSubmitError?: (errors: import("react-hook-form").FieldErrors) => void;
  /** Render prop for a custom submit button. If onSubmit is provided and this is omitted, a default submit button is rendered. */
  renderSubmitButton?: (props: { onSubmit: () => void; isDirty: boolean; isValid: boolean; isSubmitting: boolean }) => React.ReactNode;
}

export const Formosaic: React.FC<IFormosaicComponentProps> = (props: IFormosaicComponentProps): React.JSX.Element => {
  const {
    configName,
    testId,
    expandCutoffCount,
    formConfig,
    defaultValues,
    areAllFieldsReadonly,
    collapsedMaxHeight,
    isCreate,
    parentEntity,
    enableFilter,
    currentUserId,
    onSaveError,
    isManualSave = false,
    saveTimeoutMs = 30000,
    maxSaveRetries = 3,
    renderExpandButton,
    renderFilterInput,
    renderDialog,
    renderSaveButton,
    formErrors,
    fieldErrors,
    renderLabel,
    renderError,
    renderStatus,
    onSubmit: onSubmitProp,
    onSubmitError,
    renderSubmitButton,
  } = props;

  // Support both v2 formConfig and v1 fieldConfigs
  const fields = formConfig?.fields ?? props.fieldConfigs ?? {};
  const formSettings = formConfig?.settings;
  const effectiveManualSave = formSettings?.manualSave ?? isManualSave;
  const effectiveSaveTimeout = formSettings?.saveTimeoutMs ?? saveTimeoutMs;
  const effectiveMaxRetries = formSettings?.maxSaveRetries ?? maxSaveRetries;
  const effectiveExpandCutoff = formSettings?.expandCutoffCount ?? expandCutoffCount;
  const analytics = useFormAnalytics(formSettings?.analytics);

  const saveData = props.saveData
    ? props.saveData
    : (): Promise<IEntityData> => Promise.resolve({} as IEntityData);

  const { initFormState, processFieldChange, rulesState } = UseRulesEngineContext();

  const saveTimeoutDelay = React.useRef<number | undefined>(undefined);
  const saveTimeout = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const confirmInputModalProps = React.useRef<IConfirmInputModalProps | undefined>(undefined);
  const saveAbortControllerRef = React.useRef<AbortController | undefined>(undefined);
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const [expandEnabled, setExpandEnabled] = React.useState<boolean>();
  const [inputFieldsConfirmed, setInputFieldsConfirmed] = React.useState<boolean>(true);
  const [filterText, setFilterText] = React.useState<string>();
  const [statusMessage, setStatusMessage] = React.useState<string>("");

  const formMethods = useForm({ mode: "onChange", defaultValues });
  const { reset, resetField, handleSubmit, trigger, setValue, getValues, setError, clearErrors, formState } = formMethods;

  const rulesStateRef = React.useRef<IRulesEngineState>(rulesState);
  const formStateRef = React.useRef<FormState<IEntityData>>({ ...formState });
  const filterTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const validateAndSaveRef = React.useRef<(() => void) | undefined>(undefined);
  const { isDirty, isValid, dirtyFields, errors, isSubmitting, isSubmitSuccessful } = formState;

  React.useEffect(() => { rulesStateRef.current = rulesState; }, [rulesState]);
  React.useEffect(() => { formStateRef.current = formState; }, [formState]);
  React.useEffect(() => { initForm(defaultValues); }, [areAllFieldsReadonly]);

  // Inject server-side per-field errors into RHF error state
  React.useEffect(() => {
    if (!fieldErrors) return;
    Object.entries(fieldErrors).forEach(([fieldName, message]) => {
      setError(fieldName, { type: "server", message });
    });
  }, [fieldErrors]);

  const initForm = (entityData: IEntityData) => {
    const { formState: loadedState, initEntityData } = isCreate
      ? InitOnCreateFormState(configName, fields, entityData, parentEntity ?? {}, currentUserId ?? "", setValue, initFormState)
      : InitOnEditFormState(configName, fields, entityData, areAllFieldsReadonly ?? false, initFormState);

    setExpandEnabled(IsExpandVisible(loadedState.fieldStates, effectiveExpandCutoff));
    CheckValidDropdownOptions(loadedState.fieldStates, initEntityData, setValue);
  };

  React.useEffect(() => {
    if (rulesState.configs[configName]) {
      const cfg = rulesState.configs[configName];
      CheckValidDropdownOptions(cfg.fieldStates, getValues(), setValue);
      CheckDefaultValues(cfg.fieldStates, getValues(), setValue);
      handleComputedValues();
    }
  }, [rulesState]);

  const attemptSave = React.useCallback(() => {
    if (saveTimeout.current) { clearTimeout(saveTimeout.current); saveTimeout.current = undefined; }
    saveTimeout.current = setTimeout(() => {
      validateAndSaveRef.current?.();
      clearTimeout(saveTimeout.current);
      saveTimeout.current = undefined;
    }, saveTimeoutDelay?.current || 100);
  }, []);

  const setFieldValue = (fieldName: string, fieldValue: unknown, skipSave?: boolean, timeout?: number) => {
    saveTimeoutDelay.current = timeout;
    setValue(`${fieldName}` as const, fieldValue, { shouldDirty: !skipSave });
    trigger(fieldName);
    processFieldChange(getValues(), configName, fieldName, fields);
    if (!skipSave && !effectiveManualSave) { attemptSave(); }
  };

  const manualSave = React.useCallback(() => { validateAndSaveRef.current?.(); }, []);

  const saveConfirmInputFields = () => {
    trigger().then((valid: boolean) => {
      if (valid) { setInputFieldsConfirmed(true); attemptSave(); }
    });
  };

  const handleComputedValues = () => {
    const { dirtyFields } = formStateRef.current;
    const currentRulesState = rulesStateRef.current;
    const cfg = currentRulesState.configs[configName];
    if (!cfg) return;
    const computedValues = GetComputedValuesOnDirtyFields(Object.keys(dirtyFields), cfg.fieldStates);
    if (computedValues.length > 0) {
      computedValues.forEach(cv => {
        const result = ExecuteComputedValue(cv.expression, getValues(), cv.fieldName);
        setValue(`${cv.fieldName}` as const, result as unknown, { shouldDirty: true });
      });
    }
  };

  const focusFirstError = () => {
    if (typeof document === "undefined") return;
    const currentErrors = formStateRef.current.errors;
    const errorFieldNames = Object.keys(currentErrors);
    if (errorFieldNames.length > 0) {
      const element = document.getElementById(errorFieldNames[0]) || document.querySelector<HTMLElement>(`[name="${errorFieldNames[0]}"]`);
      if (element && typeof element.focus === "function") element.focus();
    }
  };

  const validateAndSave = () => {
    const { dirtyFields } = formStateRef.current;
    const currentRulesState = rulesStateRef.current;
    const cfg = currentRulesState.configs[configName];
    if (cfg?.fieldStates) {
      Object.keys(cfg.fieldStates).forEach(fieldName => {
        if (cfg.fieldStates[fieldName]?.hidden) clearErrors(fieldName);
      });
    }

    setStatusMessage(FormStrings.validating);
    trigger().then((valid: boolean) => {
      if (!valid) {
        setIsExpanded(true);
        setStatusMessage("");
        (typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : setTimeout)(() => focusFirstError());
      } else {
        const newConfirmInputModalProps = confirmInputModalProps.current === undefined
          ? GetConfirmInputModalProps(Object.keys(dirtyFields), cfg?.fieldStates ?? {})
          : undefined;

        if (newConfirmInputModalProps && !isEmpty(newConfirmInputModalProps.confirmInputsTriggeredBy) && (newConfirmInputModalProps.dependentFieldNames?.length ?? 0) > 0) {
          confirmInputModalProps.current = newConfirmInputModalProps;
          setInputFieldsConfirmed(false);
          setStatusMessage("");
        } else if (dirtyFields && Object.keys(dirtyFields).length > 0) {
          setStatusMessage(FormStrings.saving);
          handleSubmit(handleSave)();
          confirmInputModalProps.current = undefined;
        } else {
          setStatusMessage("");
        }
      }
    });
  };
  validateAndSaveRef.current = validateAndSave;

  const handleSave = (data: IEntityData) => {
    if (saveAbortControllerRef.current) saveAbortControllerRef.current.abort();
    const abortController = new AbortController();
    saveAbortControllerRef.current = abortController;
    const dirtyFieldNames = Object.keys(formStateRef.current.dirtyFields);

    const saveWithTimeoutAndRetry = async (attempt: number): Promise<void> => {
      if (abortController.signal.aborted) return;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(FormStrings.saveTimeout)), effectiveSaveTimeout);
      });
      try {
        const updatedEntity = await Promise.race([saveData(data, dirtyFieldNames), timeoutPromise]);
        if (abortController.signal.aborted) return;
        setStatusMessage(FormStrings.saved);
        analytics.trackFormSubmit(data as Record<string, unknown>);
        if (!isCreate) handleDirtyFields(updatedEntity, data);
      } catch (error) {
        if (abortController.signal.aborted) return;
        if (attempt < effectiveMaxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          if (abortController.signal.aborted) return;
          return saveWithTimeoutAndRetry(attempt + 1);
        }
        setStatusMessage(FormStrings.saveFailed);
        dirtyFieldNames.forEach(field => { setError(field, { type: "custom", message: FormStrings.saveError }); });
        onSaveError?.(`${FormStrings.saveError}${error ? `: ${error}` : ""}`);
      }
    };
    saveWithTimeoutAndRetry(0);
  };

  const handleDirtyFields = (entity: IEntityData, data: IEntityData) => {
    const { dirtyFields } = formStateRef.current;
    const stillDirtyFields: IEntityData = {};
    Object.keys(dirtyFields).forEach(field => { stillDirtyFields[field] = getValues(field); });
    const resetValue = entity;
    reset(resetValue);
    Object.keys(stillDirtyFields).forEach(field => {
      if (JSON.stringify(stillDirtyFields[field]) !== JSON.stringify(data[field])) {
        setFieldValue(field, stillDirtyFields[field], false, saveTimeoutDelay?.current);
      }
    });
  };

  // Feature 2: handleSubmit / Batch Submit Validation
  // Triggers full RHF validation, calls onSubmit if valid, onSubmitError if invalid,
  // and focuses the first invalid field.
  const handleFormSubmit = React.useCallback(() => {
    if (!onSubmitProp) return;
    const cfg = rulesStateRef.current.configs[configName];
    // Clear hidden-field errors before batch validation (mirrors validateAndSave behaviour)
    if (cfg?.fieldStates) {
      Object.keys(cfg.fieldStates).forEach(fieldName => {
        if (cfg.fieldStates[fieldName]?.hidden) clearErrors(fieldName);
      });
    }
    trigger().then((valid: boolean) => {
      if (!valid) {
        setIsExpanded(true);
        (typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : setTimeout)(() => focusFirstError());
        onSubmitError?.(formStateRef.current.errors);
      } else {
        const values = formMethods.getValues();
        Promise.resolve(onSubmitProp(values)).catch(() => { /* consumer handles errors */ });
      }
    });
  }, [onSubmitProp, onSubmitError, configName, trigger, clearErrors]);

  const onFilterChange = React.useCallback((value: string) => {
    if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
    filterTimeoutRef.current = setTimeout(() => setFilterText(value), 500);
  }, []);

  const cancelConfirmInputFields = () => {
    const current = confirmInputModalProps.current;
    if (current && current.otherDirtyFields && current.otherDirtyFields.length > 0) {
      if (current.confirmInputsTriggeredBy) resetField(current.confirmInputsTriggeredBy);
      if (current.dependentFieldNames) current.dependentFieldNames.forEach(n => resetField(n));
      saveData(getValues(), current.otherDirtyFields).then(updatedEntity => initForm(updatedEntity));
    } else {
      reset();
      initForm(getValues());
    }
    setInputFieldsConfirmed(true);
    confirmInputModalProps.current = undefined;
  };

  const cutoff = expandEnabled && !isExpanded
    ? (effectiveExpandCutoff ?? FormConstants.defaultExpandCutoffCount)
    : undefined;

  return (
    <FormProvider {...formMethods} formState={{ ...formMethods.formState, isDirty, isValid, dirtyFields, errors, isSubmitting, isSubmitSuccessful }}>
      <div role="status" aria-live="polite" className="sr-only" style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }} data-testid="form-status-live-region">
        {statusMessage}
      </div>
      {enableFilter && (
        <div className="fe-filter">
          {renderFilterInput ? renderFilterInput({ onChange: onFilterChange }) : (
            <input type="text" placeholder={FormStrings.filterFields} aria-label={FormStrings.filterFields} onChange={(e) => onFilterChange(e.target.value)} className="fe-filter-input" />
          )}
        </div>
      )}
      {formErrors && formErrors.length > 0 && (
        <div className="form-errors" role="alert" style={{ color: "var(--fe-error-color, #d13438)", padding: "8px", marginBottom: "8px" }}>
          {formErrors.map((err, i) => (<div key={i} className="form-error-item">{err}</div>))}
        </div>
      )}
      <div className="fe-form-wrapper">
        <FormFields
          testId={testId}
          isExpanded={isExpanded}
          expandEnabled={expandEnabled}
          fieldOrder={rulesState?.configs[configName]?.fieldOrder}
          collapsedMaxHeight={collapsedMaxHeight}
          formState={rulesState?.configs[configName]}
          fields={fields}
          setFieldValue={setFieldValue}
          isManualSave={effectiveManualSave}
          isCreate={isCreate}
          filterText={filterText}
          fieldRenderLimit={cutoff}
          renderLabel={renderLabel}
          renderError={renderError}
          renderStatus={renderStatus}
          analytics={analytics}
        />
        {expandEnabled && (
          renderExpandButton ? renderExpandButton({ isExpanded, onToggle: () => setIsExpanded(!isExpanded) }) : (
            <button className="expand-button" onClick={() => setIsExpanded(!isExpanded)} aria-expanded={isExpanded} data-testid={`${testId ? testId + "-" : ""}expand-form`}>
              {isExpanded ? FormStrings.seeLess : FormStrings.expand}
            </button>
          )
        )}
        {effectiveManualSave && (
          renderSaveButton ? renderSaveButton({ onSave: manualSave, isDirty, isValid, isSubmitting }) : (
            <div className="fe-save-actions" style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
              <button type="button" className="save-button" onClick={manualSave} disabled={!isDirty || isSubmitting}>
                {isCreate ? FormStrings.create : FormStrings.save}
              </button>
              <button type="button" className="cancel-button" onClick={() => { reset(); initForm(defaultValues); }} disabled={!isDirty || isSubmitting}>
                {FormStrings.cancel}
              </button>
            </div>
          )
        )}
        {onSubmitProp && (
          renderSubmitButton ? renderSubmitButton({ onSubmit: handleFormSubmit, isDirty, isValid, isSubmitting }) : (
            <div className="fe-submit-actions" style={{ marginTop: "16px" }}>
              <button type="button" className="submit-button" onClick={handleFormSubmit} disabled={isSubmitting}>
                {FormStrings.save}
              </button>
            </div>
          )
        )}
      </div>
      <ConfirmInputsModal
        isOpen={confirmInputModalProps !== undefined && !inputFieldsConfirmed}
        configName={configName}
        testId={testId}
        fields={fields}
        confirmInputFields={confirmInputModalProps?.current?.dependentFieldNames ?? []}
        cancelConfirmInputFields={cancelConfirmInputFields}
        saveConfirmInputFields={saveConfirmInputFields}
        renderDialog={renderDialog}
      />
    </FormProvider>
  );
};

