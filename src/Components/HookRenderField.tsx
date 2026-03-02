import { isEmpty, isNull } from "@cxpui/common";
import { IDropdownOption } from "@fluentui/react";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { ChangedEntityType, UseEntitiesState } from "../../DynamicLayout";
import { ComponentTypes } from "../../DynamicLayout/Models/Enums";
import { UseEntityDisabled } from "../../Hooks/UseEntityDisabled";
import { CheckFieldValidationRules, ShowField } from "../Helpers/HookInlineFormHelper";
import { UseInjectedHookFieldContext } from "../Providers/InjectedHookFieldProvider";
import { HookInlineFormStrings } from "../Strings";
import { HookFieldWrapper } from "./HookFieldWrapper";

interface IRenderFieldProps {
  fieldName: string;
  entityId: string;
  entityType: string;
  programName: string;
  component: string;
  hidden?: boolean;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  dropdownOptions?: IDropdownOption[];
  validations?: string[];
  parentEntityId?: string;
  parentEntityType?: string;
  isManualSave?: boolean;
  setFieldValue: <T extends {}>(fieldName: string, fieldValue: T, skipSave?: boolean) => void;
  isCreate?: boolean;
  filterText?: string;
  softHidden?: boolean;
  label?: string;
  skipLayoutReadOnly?: boolean;
  hideOnCreate?: boolean;
  meta?: object;
  ignoreChangedEntity?: boolean;
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
    dropdownOptions,
    validations,
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
    ignoreChangedEntity
  } = props;

  const { injectedFields } = UseInjectedHookFieldContext();
  const { control, getValues } = useFormContext();
  const { allEntities, changedEntity } = UseEntitiesState();
  const [FieldComponent, setFieldComponent] = React.useState<JSX.Element>(<></>);

  const { disabled } = UseEntityDisabled(
    parentEntityId ? parentEntityId : entityId,
    parentEntityType ? parentEntityType : entityType
  );

  const fieldNameConst = `${fieldName}` as const;

  React.useEffect(() => {
    if (
      changedEntity?.type === ChangedEntityType.Updated &&
      changedEntity?.entity?.EntityId === entityId &&
      !ignoreChangedEntity
    ) {
      const updatedEntity = allEntities[entityType].entities[entityId];
      const formValue = getValues(fieldNameConst);
      if (updatedEntity?.[fieldName] && JSON.stringify(updatedEntity[fieldName]) !== JSON.stringify(formValue)) {
        // Field was changed outside of form - skipSave to prevent additional API call
        setFieldValue(fieldNameConst, updatedEntity[fieldName], true);
      }
    }
  }, [changedEntity]);

  React.useEffect(() => {
    const isReadOnly =
      readOnly || (disabled && (isNull(skipLayoutReadOnly) || (!isNull(skipLayoutReadOnly) && !skipLayoutReadOnly)));

    if ((isCreate && hideOnCreate) || hidden) {
      setFieldComponent(<></>);
    } else if (!isEmpty(injectedFields) && injectedFields[component]) {
      const Comp = injectedFields[component];
      setFieldComponent(
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
            validate:
              !isEmpty(validations) && validations.length > 0 && !isReadOnly
                ? value => (value ? CheckFieldValidationRules(value, getValues(), validations) : undefined)
                : undefined
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
    } else {
      setFieldComponent(<>Missing Component ({component})</>);
    }
  }, [component, hidden, required, disabled, dropdownOptions, filterText, readOnly, softHidden]);

  return FieldComponent;
};

export default HookRenderField;
