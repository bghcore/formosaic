import { isEmpty, isNull } from "../utils";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { ComponentTypes } from "../constants";
import { CheckFieldValidationRules, CheckAsyncFieldValidationRules, ShowField } from "../helpers/HookInlineFormHelper";
import { getAsyncValidation } from "../helpers/ValidationRegistry";
import { IDropdownOption } from "../types/IDropdownOption";
import { UseInjectedHookFieldContext } from "../providers/InjectedHookFieldProvider";
import { HookInlineFormStrings } from "../strings";
import { HookFieldWrapper } from "./HookFieldWrapper";

interface IRenderFieldProps {
  fieldName: string;
  entityId?: string;
  entityType?: string;
  programName?: string;
  component: string;
  hidden?: boolean;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  dropdownOptions?: IDropdownOption[];
  validations?: string[];
  asyncValidations?: string[];
  parentEntityId?: string;
  parentEntityType?: string;
  isManualSave?: boolean;
  setFieldValue: (fieldName: string, fieldValue: unknown, skipSave?: boolean) => void;
  isCreate?: boolean;
  filterText?: string;
  softHidden?: boolean;
  label?: string;
  skipLayoutReadOnly?: boolean;
  hideOnCreate?: boolean;
  meta?: object;
  /** Custom render function for the label area, passed through to HookFieldWrapper. */
  renderLabel?: (props: {
    id: string;
    labelId: string;
    label?: string;
    required?: boolean;
  }) => React.ReactNode;
  /** Custom render function for the error/warning/saving display, passed through to HookFieldWrapper. */
  renderError?: (props: {
    id: string;
    error?: import("react-hook-form").FieldError;
    errorCount?: number;
  }) => React.ReactNode;
  /** Custom render function for the status area, passed through to HookFieldWrapper. */
  renderStatus?: (props: {
    id: string;
    saving?: boolean;
    savePending?: boolean;
    errorCount?: number;
    isManualSave?: boolean;
  }) => React.ReactNode;
}

const HookRenderField = (props: IRenderFieldProps) => {
  const {
    component,
    fieldName,
    entityId,
    entityType,
    programName,
    hidden,
    required,
    readOnly,
    disabled,
    dropdownOptions,
    validations,
    asyncValidations,
    parentEntityId,
    parentEntityType,
    isManualSave,
    setFieldValue,
    isCreate,
    filterText,
    softHidden,
    label,
    skipLayoutReadOnly,
    hideOnCreate,
    meta,
    renderLabel,
    renderError,
    renderStatus,
  } = props;

  const { injectedFields } = UseInjectedHookFieldContext();
  const { control, getValues } = useFormContext();

  const isDisabled = disabled ?? false;

  const fieldNameConst = `${fieldName}` as const;

  const FieldComponent = React.useMemo(() => {
    const isReadOnly =
      readOnly || (isDisabled && (isNull(skipLayoutReadOnly) || (!isNull(skipLayoutReadOnly) && !skipLayoutReadOnly)));

    if ((isCreate && hideOnCreate) || hidden) {
      return <></>;
    }

    if (!isEmpty(injectedFields) && injectedFields[component]) {
      const Comp = injectedFields[component];
      return (
        <Controller
          name={fieldNameConst}
          control={control}
          rules={{
            required:
              required && component !== ComponentTypes.Toggle && !isReadOnly
                ? {
                    value: true,
                    message: HookInlineFormStrings.required
                  }
                : undefined,
            validate: async (value) => {
              // Sync first (fast fail)
              if (!isEmpty(validations) && validations!.length > 0 && !isReadOnly && value) {
                const syncError = CheckFieldValidationRules(value, getValues(), validations!);
                if (syncError) return syncError;
              }
              // Async only if sync passed
              if (!isEmpty(asyncValidations) && asyncValidations!.length > 0 && !isReadOnly && value) {
                return CheckAsyncFieldValidationRules(value, getValues(), asyncValidations!);
              }
              return undefined;
            }
          }}
          render={({
            field: { value },
            fieldState: { error, isDirty },
            formState: { isSubmitting, isSubmitSuccessful, errors }
          }) => {
            const errorCount = errors ? Object.keys(errors).length : 0;
            const saving = isDirty && (isSubmitting || isSubmitSuccessful);
            const savePending = isDirty && errorCount > 0 && !isSubmitting && !isSubmitSuccessful;
            return component === "DynamicFragment" ? (
              <>
                {React.cloneElement(Comp, {
                  value
                })}
              </>
            ) : ShowField(filterText, value, label) && !softHidden ? (
              <HookFieldWrapper
                id={fieldName}
                required={required}
                label={label}
                error={error}
                errorCount={errorCount}
                saving={saving}
                savePending={savePending}
                labelClassName="form-label"
                isManualSave={isManualSave}
                renderLabel={renderLabel}
                renderError={renderError}
                renderStatus={renderStatus}
              >
                {React.cloneElement(Comp, {
                  fieldName,
                  entityId,
                  entityType,
                  parentEntityId,
                  parentEntityType,
                  programName,
                  value,
                  readOnly: isReadOnly,
                  required,
                  error,
                  errorCount,
                  saving,
                  savePending,
                  meta,
                  dropdownOptions,
                  validations,
                  label,
                  component,
                  setFieldValue
                })}
              </HookFieldWrapper>
            ) : (
              <></>
            );
          }}
        />
      );
    }

    const available = !isEmpty(injectedFields) ? Object.keys(injectedFields).join(", ") : "none";
    return (
      <div style={{ color: "red", fontSize: "0.85em", padding: "4px" }}>
        Missing component &quot;{component}&quot; for field &quot;{fieldName}&quot;. Available: [{available}]
      </div>
    );
  }, [component, hidden, required, readOnly, disabled, dropdownOptions, softHidden, renderLabel, renderError, renderStatus]);

  return FieldComponent;
};

export default React.memo(HookRenderField);
