import { isEmpty, isNull } from "../utils";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { ComponentTypes } from "../constants";
import { CheckFieldValidationRules, CheckAsyncFieldValidationRules, ShowField } from "../helpers/FormosaicHelper";
import { IOption } from "../types/IOption";
import { IValidationRule } from "../types/IValidationRule";
import { IRuntimeFieldState } from "../types/IRuntimeFieldState";
import { UseInjectedFieldContext } from "../providers/InjectedFieldProvider";
import { FormStrings } from "../strings";
import { IFormAnalytics } from "../hooks/useFormAnalytics";
import { FieldWrapper } from "./FieldWrapper";
import { trackRender } from "../helpers/RenderTracker";

interface IRenderFieldProps {
  fieldName: string;
  testId?: string;
  type: string;
  hidden?: boolean;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  options?: IOption[];
  optionsLoading?: boolean;
  validate?: IValidationRule[];
  isManualSave?: boolean;
  setFieldValue: (fieldName: string, fieldValue: unknown, skipSave?: boolean) => void;
  isCreate?: boolean;
  filterText?: string;
  softHidden?: boolean;
  label?: string;
  skipLayoutReadOnly?: boolean;
  hideOnCreate?: boolean;
  config?: Record<string, unknown>;
  description?: string;
  placeholder?: string;
  helpText?: string;
  renderLabel?: (props: { id: string; labelId: string; label?: string; required?: boolean }) => React.ReactNode;
  renderError?: (props: { id: string; error?: import("react-hook-form").FieldError; errorCount?: number }) => React.ReactNode;
  renderStatus?: (props: { id: string; saving?: boolean; savePending?: boolean; errorCount?: number; isManualSave?: boolean }) => React.ReactNode;
  analytics?: IFormAnalytics;
}

const RenderField = (props: IRenderFieldProps) => {
  const {
    type, fieldName, testId,
    hidden, required, readOnly, disabled, options, optionsLoading, validate,
    isManualSave,
    setFieldValue, isCreate, filterText, softHidden,
    label, skipLayoutReadOnly, hideOnCreate, config,
    description, placeholder, helpText,
    renderLabel, renderError, renderStatus, analytics,
  } = props;

  const { injectedFields } = UseInjectedFieldContext();
  const { control, getValues } = useFormContext();
  const previousValueRef = React.useRef<unknown>(undefined);

  const isDisabled = disabled ?? false;

  // Animation: two-phase show/hide state machine
  const effectivelyHidden = hidden || (isCreate && hideOnCreate);
  const [shouldRender, setShouldRender] = React.useState(!effectivelyHidden);
  const [isExiting, setIsExiting] = React.useState(false);
  const isFirstRender = React.useRef(true);
  const fallbackTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animation: change detection refs (all initialized to undefined sentinel to skip initial render)
  const prevOptionsRef = React.useRef<IOption[] | undefined>(undefined);
  const prevLabelRef = React.useRef<string | undefined>(undefined);
  const prevReadOnlyRef = React.useRef<boolean | undefined>(undefined);
  const [optionsChanged, setOptionsChanged] = React.useState(false);
  const [labelChanging, setLabelChanging] = React.useState(false);
  const [readOnlyEntering, setReadOnlyEntering] = React.useState(false);

  // Effect: watch hidden prop for show/hide transitions
  // Intentionally omits shouldRender/isExiting from deps — adding them would cause
  // re-fire loops. The effect only needs to run when effectivelyHidden changes;
  // shouldRender/isExiting are always current at that point due to React batching.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (effectivelyHidden && shouldRender) {
      // Start exit animation
      setIsExiting(true);
      // Fallback: force unmount if transitionend doesn't fire
      fallbackTimerRef.current = setTimeout(() => {
        setShouldRender(false);
        setIsExiting(false);
      }, 300); // ~2x animation duration
    } else if (!effectivelyHidden && !shouldRender) {
      // Show: mount the field, CSS @starting-style handles entry
      setShouldRender(true);
      setIsExiting(false);
    } else if (!effectivelyHidden && isExiting) {
      // Rapid toggle: cancel exit
      setIsExiting(false);
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    }
  }, [effectivelyHidden]);

  // Cleanup fallback timer on unmount
  React.useEffect(() => {
    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
    };
  }, []);

  const handleTransitionEnd = React.useCallback((e: React.TransitionEvent) => {
    // Only respond to our own grid wrapper's transition, not bubbled child events
    if (e.target !== e.currentTarget) return;
    if (isExiting) {
      setShouldRender(false);
      setIsExiting(false);
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    }
  }, [isExiting]);

  // Effect: detect options changes
  React.useEffect(() => {
    const prev = prevOptionsRef.current;
    prevOptionsRef.current = options;
    if (prev === undefined) return; // skip initial
    const prevValues = prev?.map(o => o.value) ?? [];
    const currValues = options?.map(o => o.value) ?? [];
    if (prevValues.length !== currValues.length || prevValues.some((v, i) => v !== currValues[i])) {
      setOptionsChanged(true);
    }
  }, [options]);

  // Effect: detect label changes
  React.useEffect(() => {
    const prev = prevLabelRef.current;
    prevLabelRef.current = label;
    if (prev === undefined) return; // skip initial
    if (prev !== label) {
      setLabelChanging(true);
    }
  }, [label]);

  // Effect: detect readOnly changes (uses undefined sentinel to skip initial render, same as options/label)
  React.useEffect(() => {
    const isReadOnly = readOnly || (isDisabled && (isNull(skipLayoutReadOnly) || (!isNull(skipLayoutReadOnly) && !skipLayoutReadOnly)));
    const prev = prevReadOnlyRef.current;
    prevReadOnlyRef.current = isReadOnly;
    if (prev === undefined) return; // skip initial render
    if (prev !== isReadOnly) {
      setReadOnlyEntering(true);
    }
  }, [readOnly, isDisabled, skipLayoutReadOnly]);

  // Clear change-detection flags after the specific animation that ended
  const handleContainerAnimationEnd = React.useCallback((e: React.AnimationEvent) => {
    const name = e.animationName;
    if (name === "formosaic-options-flash") setOptionsChanged(false);
    else if (name === "formosaic-label-pulse") setLabelChanging(false);
    else if (name === "formosaic-readonly-fade") setReadOnlyEntering(false);
  }, []);

  React.useEffect(() => {
    trackRender(fieldName);
  });

  const fieldNameConst = `${fieldName}` as const;

  const FieldComponent = React.useMemo(() => {
    const isReadOnly = readOnly || (isDisabled && (isNull(skipLayoutReadOnly) || (!isNull(skipLayoutReadOnly) && !skipLayoutReadOnly)));

    if (!isEmpty(injectedFields) && injectedFields[type]) {
      const Comp = injectedFields[type];
      return (
        <Controller
          name={fieldNameConst}
          control={control}
          rules={{
            required: required && type !== ComponentTypes.Toggle && !isReadOnly
              ? { value: true, message: FormStrings.required }
              : undefined,
            validate: async (value) => {
              if (!validate || validate.length === 0 || isReadOnly || !value) return undefined;
              // Build a mock runtime state for validation
              const fieldState: IRuntimeFieldState = { validate };
              const syncError = CheckFieldValidationRules(value, fieldName, getValues(), fieldState);
              if (syncError) return syncError;
              return CheckAsyncFieldValidationRules(value, fieldName, getValues(), fieldState);
            },
          }}
          render={({
            field: { value },
            fieldState: { error, isDirty },
            formState: { isSubmitting, isSubmitSuccessful, errors },
          }) => {
            const errorCount = errors ? Object.keys(errors).length : 0;
            const saving = isDirty && (isSubmitting || isSubmitSuccessful);
            const savePending = isDirty && errorCount > 0 && !isSubmitting && !isSubmitSuccessful;
            if (error && analytics) {
              analytics.trackValidationError(fieldName, [error.message || "Error"]);
            }
            if (previousValueRef.current !== undefined && previousValueRef.current !== value && analytics) {
              analytics.trackFieldChange(fieldName, previousValueRef.current, value);
            }
            previousValueRef.current = value;
            return type === "DynamicFragment" ? (
              <>{React.cloneElement(Comp, { value })}</>
            ) : ShowField(filterText, value, label) && !softHidden ? (
              <FieldWrapper
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
                  testId,
                  value,
                  readOnly: isReadOnly,
                  required,
                  error,
                  errorCount,
                  saving,
                  savePending,
                  config,
                  options,
                  optionsLoading,
                  label,
                  type,
                  description,
                  placeholder,
                  helpText,
                  setFieldValue,
                  onFocus: analytics ? () => analytics.trackFieldFocus(fieldName) : undefined,
                  onBlur: analytics ? () => analytics.trackFieldBlur(fieldName) : undefined,
                })}
              </FieldWrapper>
            ) : <></>;
          }}
        />
      );
    }

    const available = !isEmpty(injectedFields) ? Object.keys(injectedFields).join(", ") : "none";
    return (
      <div style={{ color: "red", fontSize: "0.85em", padding: "4px" }}>
        Missing component &quot;{type}&quot; for field &quot;{fieldName}&quot;. Available: [{available}]
      </div>
    );
  }, [type, required, readOnly, disabled, options, optionsLoading, softHidden, renderLabel, renderError, renderStatus,
    fieldName, fieldNameConst, label, validate, config, description, placeholder, helpText,
    isManualSave, skipLayoutReadOnly,
    testId,
    injectedFields, analytics, control, getValues, setFieldValue]);

  if (!shouldRender) return <></>;

  return (
    <div
      className="formosaic-field-animate"
      data-exiting={isExiting || undefined}
      data-first-render={isFirstRender.current || undefined}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="formosaic-field-animate-inner">
        <div
          className="formosaic-field-container"
          data-options-changed={optionsChanged || undefined}
          data-label-changing={labelChanging || undefined}
          data-readonly-entering={readOnlyEntering || undefined}
          onAnimationEnd={handleContainerAnimationEnd}
        >
          {FieldComponent}
        </div>
      </div>
    </div>
  );
};

export default React.memo(RenderField);
