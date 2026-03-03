import { Dictionary } from "../utils";
import React from "react";
import { GetFieldsToRender } from "../helpers/HookInlineFormHelper";
import { IConfigBusinessRules } from "../types/IConfigBusinessRules";
import { IFieldConfig } from "../types/IFieldConfig";
import HookRenderField from "./HookRenderField";
import { HookFormErrorBoundary } from "./HookFormErrorBoundary";

interface IHookInlineFormFieldsProps {
  entityId?: string;
  entityType?: string;
  programName?: string;
  parentEntityId?: string;
  parentEntityType?: string;
  isExpanded?: boolean;
  expandEnabled?: boolean;
  fieldOrder?: string[];
  inPanel?: boolean;
  collapsedMaxHeight?: number;
  configRules?: IConfigBusinessRules;
  fieldConfigs?: Dictionary<IFieldConfig>;
  setFieldValue: (fieldName: string, fieldValue: unknown, skipSave?: boolean) => void;
  isManualSave?: boolean;
  isCreate?: boolean;
  filterText?: string;
  fieldRenderLimit?: number;
  /** Custom render function for field labels, passed through to HookRenderField -> HookFieldWrapper. */
  renderLabel?: (props: {
    id: string;
    labelId: string;
    label?: string;
    required?: boolean;
  }) => React.ReactNode;
  /** Custom render function for field error display, passed through to HookRenderField -> HookFieldWrapper. */
  renderError?: (props: {
    id: string;
    error?: import("react-hook-form").FieldError;
    errorCount?: number;
  }) => React.ReactNode;
  /** Custom render function for field status area, passed through to HookRenderField -> HookFieldWrapper. */
  renderStatus?: (props: {
    id: string;
    saving?: boolean;
    savePending?: boolean;
    errorCount?: number;
    isManualSave?: boolean;
  }) => React.ReactNode;
}

export const HookInlineFormFields = (props: IHookInlineFormFieldsProps) => {
  const {
    entityId,
    entityType,
    programName,
    parentEntityId,
    parentEntityType,
    isExpanded,
    expandEnabled,
    fieldOrder,
    inPanel,
    collapsedMaxHeight,
    configRules,
    fieldConfigs,
    setFieldValue,
    isManualSave,
    isCreate,
    filterText,
    fieldRenderLimit,
    renderLabel,
    renderError,
    renderStatus,
  } = props;

  const collapsedClass = !isExpanded && (expandEnabled || expandEnabled === undefined) ? "collapsed" : "";

  const fieldsToRender = GetFieldsToRender(fieldRenderLimit ?? 0, fieldOrder ?? [], configRules?.fieldRules);

  const loadingKey = `${programName}-${entityType}-${entityId}-form-loaded`;

  return (
    <div className={`hook-inline-form-container ${collapsedClass}`}>
      <form
        className={`hook-inline-form ${collapsedClass} ${inPanel ? "in-panel" : ""}`}
        style={collapsedClass && collapsedMaxHeight ? { maxHeight: `${collapsedMaxHeight}px` } : undefined}
        data-testid={`${programName}-${entityType}-${entityId}-form`}
      >
        <input type="hidden" id={loadingKey} name={loadingKey} data-testid={loadingKey} />
        {fieldsToRender?.map(fieldToRender => {
          const { fieldName, softHidden } = fieldToRender;
          if (configRules?.fieldRules[fieldName]) {
            const { component, hidden, required, readOnly, dropdownOptions, validations, asyncValidations } = configRules?.fieldRules[fieldName];
            const fieldConfig = fieldConfigs![fieldName];
            const { label, skipLayoutReadOnly, hideOnCreate, meta } = fieldConfig;

            return (
              <HookFormErrorBoundary key={`${fieldName}-${entityId}-form`}>
                <HookRenderField
                  fieldName={fieldName}
                  entityId={entityId}
                  entityType={entityType}
                  programName={programName}
                  component={component ?? ""}
                  hidden={hidden}
                  required={required}
                  readOnly={readOnly}
                  dropdownOptions={dropdownOptions}
                  validations={validations}
                  asyncValidations={asyncValidations}
                  parentEntityId={parentEntityId}
                  parentEntityType={parentEntityType}
                  setFieldValue={setFieldValue}
                  isManualSave={isManualSave}
                  isCreate={isCreate}
                  filterText={filterText}
                  softHidden={softHidden}
                  label={label}
                  skipLayoutReadOnly={skipLayoutReadOnly}
                  hideOnCreate={hideOnCreate}
                  meta={meta}
                  renderLabel={renderLabel}
                  renderError={renderError}
                  renderStatus={renderStatus}
                />
              </HookFormErrorBoundary>
            );
          } else {
            return <React.Fragment key={fieldName} />;
          }
        })}
      </form>
    </div>
  );
};
