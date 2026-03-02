import { IEntityData, isEmpty } from "@cxpui/common";
import {
  ElxSearchBox,
  IContainerAction,
  INotification,
  ISearchCriteria,
  NotificationVariant
} from "@elixir/components";
import { DefaultButton } from "@fluentui/react";
import { Dictionary } from "lodash";
import React from "react";
import { FormProvider, FormState, useForm } from "react-hook-form";
import { CxpAuthContext } from "../../Auth/AuthProvider";
import { ApiActions } from "../../DynamicLayout/Models/Enums";
import { UseElxToastNotificationDispatch } from "../../ElxToastNotification/ElxToastNotificationProvider";
import { HookInlineFormConstants } from "../Constants";
import {
  CheckDefaultValues,
  CheckValidDropdownOptions,
  ExecuteValueFunction,
  GetChildEntity,
  GetConfirmInputModalProps,
  GetValueFunctionsOnDirtyFields,
  InitOnCreateBusinessRules,
  InitOnEditBusinessRules,
  IsExpandVisible
} from "../Helpers/HookInlineFormHelper";
import { IBusinessRulesState } from "../Interfaces/IBusinessRulesState";
import { IConfirmInputModalProps } from "../Interfaces/IConfirmInputModalProps";
import { IFieldConfig } from "../Interfaces/IFieldConfig";
import { IHookInlineFormSharedProps } from "../Interfaces/IHookInlineFormSharedProps";
import { UseBusinessRulesContext } from "../Providers/BusinessRulesProvider";
import { UseHookInlineFormPanelContext } from "../Providers/HookInlineFormPanelProvider";
import { HookInlineFormStrings } from "../Strings";
import HookConfirmInputsModal from "./HookConfirmInputsModal";
import { HookInlineFormFields } from "./HookInlineFormFields";

interface IHookInlineFormProps extends IHookInlineFormSharedProps {
  fieldConfigs: Dictionary<IFieldConfig>;
  defaultValues: IEntityData;
  isChildEntity?: boolean;
  saveData?: (entityData: IEntityData, dirtyFieldNames?: string[]) => Promise<IEntityData>;
}

// eslint-disable-next-line max-lines-per-function
export const HookInlineForm: React.FC<IHookInlineFormProps> = (props: IHookInlineFormProps): JSX.Element => {
  const {
    configName,
    entityId,
    entityType,
    programName,
    parentEntityId,
    parentEntityType,
    entityPath,
    expandCutoffCount,
    fieldConfigs,
    defaultValues,
    areAllFieldsReadonly,
    collapsedMaxHeight,
    inPanel,
    isCreate,
    panelProps,
    parentEntity,
    isChildEntity,
    customSaveCallbackKey,
    enableFilter
  } = props;

  // Allow HookInlineForm to still work without these fields
  const saveData = props.saveData
    ? props.saveData
    : (): Promise<IEntityData> => {
        return undefined;
      };

  const { onDismiss, actions, setPanelActions, apiActionDetails, keepOpenOnSave } = panelProps ?? {
    onDismiss: undefined,
    actions: undefined,
    setPanelActions: undefined,
    apiActionDetails: undefined,
    keepOpenOnSave: undefined
  };

  const { initBusinessRules, processBusinessRule, businessRules } = UseBusinessRulesContext();
  const authContext = React.useContext(CxpAuthContext);
  const { customSaveCallbacks } = UseHookInlineFormPanelContext();
  const { addNotification } = UseElxToastNotificationDispatch();

  const saveTimeoutDelay = React.useRef<number>();
  const saveTimeout = React.useRef<NodeJS.Timeout>();
  const confirmInputModalProps = React.useRef<IConfirmInputModalProps>();
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const [expandEnabled, setExpandEnabled] = React.useState<boolean>();
  const [inputFieldsConfirmed, setInputFieldsConfirmed] = React.useState<boolean>(true);
  const isManualSave = React.useRef<boolean>(false);
  const [filterText, setFilterText] = React.useState<string>();

  const formMethods = useForm({
    mode: "onChange",
    defaultValues
  });

  const { reset, resetField, handleSubmit, trigger, setValue, getValues, setError, formState } = formMethods;

  const businessRulesRef = React.useRef<IBusinessRulesState>(businessRules);
  const formStateRef = React.useRef<FormState<IEntityData>>({ ...formState });

  const { isDirty, isValid, dirtyFields, errors, isSubmitting, isSubmitSuccessful } = formState;

  React.useEffect(() => {
    businessRulesRef.current = businessRules;
  }, [businessRules]);

  React.useEffect(() => {
    formStateRef.current = formState;
  }, [formState]);

  React.useEffect(() => {
    initForm(defaultValues);
  }, [areAllFieldsReadonly]);

  const initForm = (entityData: IEntityData) => {
    const { onLoadRules, initEntityData } = isCreate
      ? InitOnCreateBusinessRules(
          configName,
          fieldConfigs,
          entityData,
          parentEntity,
          authContext.getUserUpn(),
          setValue,
          initBusinessRules
        )
      : InitOnEditBusinessRules(configName, fieldConfigs, entityData, areAllFieldsReadonly, initBusinessRules);

    setExpandEnabled(IsExpandVisible(onLoadRules.fieldRules, expandCutoffCount) && !inPanel);
    CheckValidDropdownOptions(onLoadRules.fieldRules, fieldConfigs, initEntityData, setValue);

    // If apiActionDetails exists, it's in a panel and we need to save manually
    isManualSave.current =
      apiActionDetails?.action === ApiActions.create || apiActionDetails?.action === ApiActions.update;

    // Set Action Buttons
    updateActionButtons();
  };

  const updateActionButtons = (disabled?: boolean) => {
    if (actions && setPanelActions) {
      // Init buttons
      const actionButtons: IContainerAction[] = actions.map((action: IContainerAction) => ({ ...action }));

      actionButtons.map(container => {
        if (
          container.key === HookInlineFormConstants.panelActionKeys.create ||
          container.key === HookInlineFormConstants.panelActionKeys.update
        ) {
          container.onClick = () => {
            onSaveButtonClick();
          };
          container.disabled =
            !formStateRef.current || Object.keys(formStateRef.current.dirtyFields).length === 0 || disabled;
        } else if (
          container.key === HookInlineFormConstants.panelActionKeys.cancel ||
          container.key === HookInlineFormConstants.panelActionKeys.close
        ) {
          container.onClick = () => {
            onDismiss();
          };
        }
      });
      setPanelActions(actionButtons);
    }
  };

  const onSaveButtonClick = () => {
    const businessRules = businessRulesRef.current;
    if (inputFieldsConfirmed && businessRules?.configRules?.[configName]?.fieldRules) {
      updateActionButtons(true);
      validateAndSave();
    }
  };

  /**
   * On Change of business rules:
   *  check Dropdown/StatusDropdown/Multiselect Component values against business rules
   *  check if any default values need to be set
   *  check if any value functions need to be executed
   */
  React.useEffect(() => {
    if (businessRules.configRules[configName]) {
      CheckValidDropdownOptions(businessRules.configRules[configName].fieldRules, fieldConfigs, getValues(), setValue);
      CheckDefaultValues(businessRules.configRules[configName].fieldRules, getValues(), setValue);
      handleValueFunctions();
    }
  }, [businessRules]);

  const attemptSave = React.useCallback(() => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
      saveTimeout.current = undefined;
    }
    saveTimeout.current = setTimeout(() => {
      if (!isManualSave?.current) {
        validateAndSave();
      } else {
        updateActionButtons();
      }
      clearTimeout(saveTimeout.current);
      saveTimeout.current = undefined;
    }, saveTimeoutDelay?.current || 100);
  }, [saveTimeout, inputFieldsConfirmed]);

  /**
   * Set Field Value
   * @param fieldName Field Name
   * @param fieldValue Field Value
   * @param skipSave Skips api save call
   */
  const setFieldValue = <T extends {}>(fieldName: string, fieldValue: T, skipSave?: boolean, timeout?: number) => {
    saveTimeoutDelay.current = timeout;
    const previousValue = `${getValues(fieldName)}`;
    setValue(`${fieldName}` as const, fieldValue, { shouldDirty: !skipSave }); // while setting field value shouldDirty will always set to true unless skipSave is passed in as true.
    trigger(fieldName);
    processBusinessRule(getValues(), configName, fieldName, previousValue, fieldConfigs);
    if (!skipSave) {
      attemptSave();
    }
  };

  const saveConfirmInputFields = () => {
    trigger().then((valid: boolean) => {
      if (valid) {
        setInputFieldsConfirmed(true);
        attemptSave();
      }
    });
  };

  const handleValueFunctions = () => {
    const { dirtyFields } = formStateRef.current;
    const businessRules = businessRulesRef.current;
    const executeValueFunctions = GetValueFunctionsOnDirtyFields(
      Object.keys(dirtyFields),
      businessRules.configRules[configName].fieldRules
    );
    if (executeValueFunctions.length > 0) {
      executeValueFunctions.forEach(executeValueFunction => {
        if (executeValueFunction.valueFunction) {
          // TODO brhanso, ExecuteValueFunction should be passed in
          const fieldValue = ExecuteValueFunction(
            executeValueFunction.fieldName,
            executeValueFunction.valueFunction,
            getValues(executeValueFunction.fieldName)
          );
          setValue(`${executeValueFunction.fieldName}` as const, fieldValue, { shouldDirty: true });
        }
      });
    }
  };

  const validateAndSave = () => {
    const { dirtyFields } = formStateRef.current;
    const businessRules = businessRulesRef.current;

    trigger().then((valid: boolean) => {
      if (!valid) {
        setIsExpanded(true);
      } else {
        const newConfirmInputModalProps: IConfirmInputModalProps =
          confirmInputModalProps.current === undefined
            ? GetConfirmInputModalProps(Object.keys(dirtyFields), businessRules.configRules[configName].fieldRules)
            : undefined;

        if (
          !isEmpty(newConfirmInputModalProps?.confirmInputsTriggeredBy) &&
          newConfirmInputModalProps?.dependentFieldNames?.length > 0
        ) {
          confirmInputModalProps.current = newConfirmInputModalProps;
          setInputFieldsConfirmed(false);
        } else if (dirtyFields && Object.keys(dirtyFields).length > 0) {
          handleSubmit(handleSave)();
          confirmInputModalProps.current = undefined;
        }
      }
    });
  };

  const handleSave = (data: IEntityData) => {
    saveData(data, Object.keys(formStateRef.current.dirtyFields))
      .then(updatedEntity => {
        if (keepOpenOnSave || !isCreate) {
          handleDirtyFields(updatedEntity, data);
        }
        const customSaveCallback = customSaveCallbacks[customSaveCallbackKey];
        customSaveCallback && customSaveCallback(updatedEntity);
        if (!keepOpenOnSave && onDismiss) {
          onDismiss();
        }
      })
      .finally(() => {
        if (isManualSave) {
          updateActionButtons();
        }
      })
      .catch(error => {
        Object.keys(formStateRef.current.dirtyFields).forEach(field => {
          setError(field, { type: "custom", message: HookInlineFormStrings.saveError });
        });
        addNotification({
          message: `${HookInlineFormStrings.saveError}${error ? `: ${error}` : ""}`,
          variant: NotificationVariant.Error
        } as INotification);
      });
  };

  const handleDirtyFields = (entity: IEntityData, data: IEntityData) => {
    const { dirtyFields } = formStateRef.current;
    const stillDirtyFields: IEntityData = {};
    Object.keys(dirtyFields).forEach(field => {
      stillDirtyFields[field] = getValues(field);
    });
    reset(isChildEntity ? GetChildEntity(entityId, entity, entityPath) : entity);
    Object.keys(stillDirtyFields).forEach(field => {
      if (JSON.stringify(stillDirtyFields[field]) !== JSON.stringify(data[field])) {
        setFieldValue(field, stillDirtyFields[field], false, saveTimeoutDelay?.current);
      }
    });
  };

  const onFilterChange = (value: ISearchCriteria) => {
    const timeOutId = setTimeout(() => {
      setFilterText(value.keyword);
    }, 500);
    return () => clearTimeout(timeOutId);
  };

  const cancelConfirmInputFields = () => {
    if (confirmInputModalProps.current.otherDirtyFields?.length > 0) {
      resetField(confirmInputModalProps.current.confirmInputsTriggeredBy);
      confirmInputModalProps.current.dependentFieldNames.forEach(dependentFieldName => {
        resetField(dependentFieldName);
      });
      saveData(getValues(), confirmInputModalProps.current.otherDirtyFields).then(updatedEntity => {
        initForm(updatedEntity);
      });
    } else {
      reset();
      initForm(getValues());
    }
    setInputFieldsConfirmed(true);
    confirmInputModalProps.current = undefined;
  };

  return (
    <FormProvider
      {...formMethods}
      formState={{
        ...formMethods.formState,
        isDirty,
        isValid,
        dirtyFields,
        errors,
        isSubmitting,
        isSubmitSuccessful
      }}
    >
      {enableFilter && (
        <div className="hook-inline-form-filter">
          <ElxSearchBox onChange={onFilterChange} />
        </div>
      )}
      <div className="hook-inline-form-wrapper">
        <HookInlineFormFields
          entityId={entityId}
          entityType={entityType}
          programName={programName}
          parentEntityId={parentEntityId}
          parentEntityType={parentEntityType}
          isExpanded={isExpanded}
          expandEnabled={expandEnabled}
          fieldOrder={businessRules?.configRules[configName]?.order}
          inPanel={inPanel}
          collapsedMaxHeight={collapsedMaxHeight}
          configRules={businessRules?.configRules[configName]}
          fieldConfigs={fieldConfigs}
          setFieldValue={setFieldValue}
          isManualSave={isManualSave.current}
          isCreate={isCreate}
          filterText={filterText}
          fieldRenderLimit={
            expandEnabled && !isExpanded
              ? expandCutoffCount
                ? expandCutoffCount
                : HookInlineFormConstants.defaultExpandCutoffCount
              : undefined
          }
        />

        {expandEnabled && (
          <DefaultButton
            className="expand-button"
            iconProps={{
              iconName: isExpanded ? "BackToWindow" : "FullScreen"
            }}
            text={isExpanded ? HookInlineFormStrings.seeLess : HookInlineFormStrings.expand}
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
            data-testid={`${programName}-${entityType}-${entityId}-expand-form`}
          />
        )}
      </div>
      <HookConfirmInputsModal
        isOpen={confirmInputModalProps !== undefined && !inputFieldsConfirmed}
        configName={configName}
        entityId={entityId}
        entityType={entityType}
        programName={programName}
        fieldConfigs={fieldConfigs}
        confirmInputFields={confirmInputModalProps?.current?.dependentFieldNames}
        cancelConfirmInputFields={cancelConfirmInputFields}
        saveConfirmInputFields={saveConfirmInputFields}
      />
    </FormProvider>
  );
};
