import React from "react";
import { useFormContext } from "react-hook-form";
import { GetFieldsToRender } from "../helpers/InlineFormHelper";
import { IRuntimeFormState } from "../types/IRuntimeFieldState";
import { IFieldConfig } from "../types/IFieldConfig";
import { IOption } from "../types/IOption";
import { IFormAnalytics } from "../hooks/useFormAnalytics";
import RenderField from "./RenderField";
import { FormErrorBoundary } from "./FormErrorBoundary";

interface IFormFieldsProps {
  testId?: string;
  isExpanded?: boolean;
  expandEnabled?: boolean;
  fieldOrder?: string[];
  inPanel?: boolean;
  collapsedMaxHeight?: number;
  formState?: IRuntimeFormState;
  fields?: Record<string, IFieldConfig>;
  setFieldValue: (fieldName: string, fieldValue: unknown, skipSave?: boolean) => void;
  isManualSave?: boolean;
  isCreate?: boolean;
  filterText?: string;
  fieldRenderLimit?: number;
  renderLabel?: (props: { id: string; labelId: string; label?: string; required?: boolean }) => React.ReactNode;
  renderError?: (props: { id: string; error?: import("react-hook-form").FieldError; errorCount?: number }) => React.ReactNode;
  renderStatus?: (props: { id: string; saving?: boolean; savePending?: boolean; errorCount?: number; isManualSave?: boolean }) => React.ReactNode;
  analytics?: IFormAnalytics;
}

export const FormFields = (props: IFormFieldsProps) => {
  const {
    testId,
    isExpanded, expandEnabled, fieldOrder, inPanel, collapsedMaxHeight,
    formState, fields, setFieldValue, isManualSave, isCreate, filterText,
    fieldRenderLimit, renderLabel, renderError, renderStatus, analytics,
  } = props;

  // Async options state: maps fieldId -> loaded IOption[] (undefined = not yet loaded)
  const [asyncOptions, setAsyncOptions] = React.useState<Record<string, IOption[]>>({});
  // Async options loading state: maps fieldId -> boolean
  const [asyncOptionsLoading, setAsyncOptionsLoading] = React.useState<Record<string, boolean>>({});
  // Cache key per field: JSON-serialised values of optionsDependsOn fields
  const asyncCacheKeyRef = React.useRef<Record<string, string>>({});

  const { getValues } = useFormContext();

  // Run loadOptions for each field that declares it, re-running when deps change.
  // useEffect runs after every render; we guard with a cache key to avoid redundant fetches.
  React.useEffect(() => {
    if (!fields) return;
    Object.entries(fields).forEach(([fieldId, fieldConfig]) => {
      if (!fieldConfig.loadOptions) return;
      const depValues = (fieldConfig.optionsDependsOn ?? []).reduce<Record<string, unknown>>(
        (acc, dep) => { acc[dep] = getValues(dep); return acc; },
        {}
      );
      const cacheKey = JSON.stringify(depValues);
      if (asyncCacheKeyRef.current[fieldId] === cacheKey) return; // deps unchanged, use cached result
      asyncCacheKeyRef.current[fieldId] = cacheKey;
      setAsyncOptionsLoading(prev => ({ ...prev, [fieldId]: true }));
      fieldConfig.loadOptions({ fieldId, values: getValues() })
        .then(options => {
          setAsyncOptions(prev => ({ ...prev, [fieldId]: options }));
        })
        .catch(() => {
          // On error, leave the previous options intact and clear loading state
        })
        .finally(() => {
          setAsyncOptionsLoading(prev => ({ ...prev, [fieldId]: false }));
        });
    });
  });

  const collapsedClass = !isExpanded && (expandEnabled || expandEnabled === undefined) ? "collapsed" : "";
  const fieldsToRender = GetFieldsToRender(fieldRenderLimit ?? 0, fieldOrder ?? [], formState?.fieldStates);
  const loadingKey = `${testId ? testId + "-" : ""}form-loaded`;

  return (
    <div className={`fe-form-container ${collapsedClass}`}>
      <form
        className={`fe-form ${collapsedClass} ${inPanel ? "in-panel" : ""}`}
        style={collapsedClass && collapsedMaxHeight ? { maxHeight: `${collapsedMaxHeight}px` } : undefined}
        data-testid={`${testId ? testId + "-" : ""}form`}
      >
        <input type="hidden" id={loadingKey} name={loadingKey} data-testid={loadingKey} />
        {fieldsToRender?.map(fieldToRender => {
          const { fieldName, softHidden } = fieldToRender;
          const fieldState = formState?.fieldStates[fieldName];
          if (!fieldState) return <React.Fragment key={fieldName} />;

          const fieldConfig = fields![fieldName];
          return (
            <FormErrorBoundary key={`${fieldName}-form`}>
              <RenderField
                fieldName={fieldName}
                testId={testId}
                type={fieldState.type ?? ""}
                hidden={fieldState.hidden}
                required={fieldState.required}
                readOnly={fieldState.readOnly}
                options={asyncOptions[fieldName] ?? fieldState.options}
                optionsLoading={asyncOptionsLoading[fieldName] ?? false}
                validate={fieldState.validate}
                setFieldValue={setFieldValue}
                isManualSave={isManualSave}
                isCreate={isCreate}
                filterText={filterText}
                softHidden={softHidden}
                label={fieldState?.label ?? fieldConfig?.label}
                skipLayoutReadOnly={fieldConfig?.skipLayoutReadOnly}
                hideOnCreate={fieldConfig?.hideOnCreate}
                config={fieldConfig?.config}
                description={fieldConfig?.description}
                placeholder={fieldConfig?.placeholder}
                helpText={fieldConfig?.helpText}
                renderLabel={renderLabel}
                renderError={renderError}
                renderStatus={renderStatus}
                analytics={analytics}
              />
            </FormErrorBoundary>
          );
        })}
      </form>
    </div>
  );
};

