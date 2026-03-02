import { Dictionary } from "@cxpui/common";
import { ElxDialog } from "@elixir/components";
import { DialogType } from "@fluentui/react";
import React from "react";
import { useFormContext } from "react-hook-form";
import { IFieldConfig } from "../Interfaces/IFieldConfig";
import { UseBusinessRulesContext } from "../Providers/BusinessRulesProvider";
import { HookInlineFormStrings } from "../Strings";
import HookRenderField from "./HookRenderField";

interface IHookConfirmInputsModalProps {
  isOpen?: boolean;
  configName: string;
  entityId: string;
  entityType: string;
  programName: string;
  fieldConfigs: Dictionary<IFieldConfig>;
  confirmInputFields: string[];
  saveConfirmInputFields: () => void;
  cancelConfirmInputFields: () => void;
}

const HookConfirmInputsModal = (props: IHookConfirmInputsModalProps) => {
  const {
    isOpen,
    configName,
    entityId,
    entityType,
    programName,
    fieldConfigs,
    confirmInputFields,
    saveConfirmInputFields,
    cancelConfirmInputFields
  } = props;
  const { setValue, trigger } = useFormContext();
  const { businessRules } = UseBusinessRulesContext();

  /**
   * Set Field Value
   * @param fieldName Field Name
   * @param fieldValue Field Value
   * @param skipSave Skips api save call
   */
  const setValueFunctionFieldValue = <T extends {}>(fieldName: string, fieldValue: T) => {
    trigger();
    setValue(`${fieldName}` as const, fieldValue, { shouldDirty: true });
  };

  return (
    <ElxDialog
      hidden={!isOpen}
      modalProps={{
        className: "hook-inline-form-modal",
        isBlocking: true,
        containerClassName: "hook-inline-form-modal-container"
      }}
      dialogContentProps={{
        type: DialogType.normal,
        showCloseButton: false
      }}
      primaryButtonProps={{
        iconProps: { iconName: "Save" },
        text: HookInlineFormStrings.save,
        onClick: saveConfirmInputFields
      }}
      cancelButtonProps={{
        text: HookInlineFormStrings.cancel,
        onClick: cancelConfirmInputFields
      }}
    >
      <div className="hook-inline-form-wrapper">
        <div className="hook-inline-form-container">
          <form className="hook-inline-form modal">
            {confirmInputFields ? (
              confirmInputFields.map(confirmInputField => {
                const { component, dropdownOptions, validations } = businessRules.configRules[configName].fieldRules[
                  confirmInputField
                ];
                const fieldConfig = fieldConfigs[confirmInputField];
                const { label, hideOnCreate, meta } = fieldConfig;
                return (
                  <HookRenderField
                    key={`${confirmInputField}-${entityId}-modal`}
                    fieldName={confirmInputField}
                    entityId={entityId}
                    entityType={entityType}
                    programName={programName}
                    component={component}
                    required
                    dropdownOptions={dropdownOptions}
                    validations={validations}
                    isManualSave
                    setFieldValue={setValueFunctionFieldValue}
                    label={label}
                    skipLayoutReadOnly
                    hideOnCreate={hideOnCreate}
                    meta={meta}
                    ignoreChangedEntity
                  />
                );
              })
            ) : (
              <></>
            )}
          </form>
        </div>
      </div>
    </ElxDialog>
  );
};

export default HookConfirmInputsModal;
