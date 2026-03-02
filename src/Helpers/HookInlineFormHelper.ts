import {
  DeepCopy,
  Dictionary,
  IEntityData,
  SetDropdownValue,
  SubEntityType,
  isEmpty,
  isNull,
  isStringEmpty
} from "@cxpui/common";
import { IPropertyConfig } from "@cxpui/dux/dist/fx/components/dashboard/models/@types/Props";
import { IDropdownOption } from "@fluentui/react";
import { UseFormSetValue } from "react-hook-form";
import { IPropertySchema, Types } from "../../DataModelsSchema/Models/DataModelsSchema";
import { IDropdownItem } from "../../DropdownPanel/Interfaces/IDropdownItem";
import {
  AzureServiceSizeLimitValidation,
  EmailValidation,
  EndDateValidation,
  Max150KbValidation,
  Max32KbValidation,
  PhoneNumberValidation,
  StartDateValidation,
  YearValidation
} from "../../DynamicLayout/Helpers/DynamicValidationHelper";
import { HookInlineFormConstants } from "../Constants";
import { IBusinessRule } from "../Interfaces/IBusinessRule";
import { IConfigBusinessRules } from "../Interfaces/IConfigBusinessRules";
import { IConfirmInputModalProps } from "../Interfaces/IConfirmInputModalProps";
import { IExecuteValueFunction } from "../Interfaces/IExecuteValueFunction";
import { IDeprecatedOption, IFieldConfig } from "../Interfaces/IFieldConfig";
import { IFieldToRender } from "../Interfaces/IFieldToRender";
import { GetDefaultBusinessRules, ProcessDropdownOptions } from "./BusinessRulesHelper";

/**
 * Get Child Entity
 * @param entityId Child Entity Id
 * @param entity Entity Data
 * @param entityPath Entity Path
 * @returns the child entity
 */
export const GetChildEntity = (
  entityId?: string,
  entity?: IEntityData,
  entityPath?: string
): IEntityData | undefined => {
  const childValues = (entity[entityPath] as IEntityData[]).filter(child => child.EntityId === entityId);
  return childValues?.length === 1 ? { ...childValues[0], Parent: { ...entity } } : undefined;
};

/**
 * Gets number of fields that aren't hidden
 * @param businessRules business rules
 * @param expandCutoffCount custom count for cutoff
 * @returns count
 */
export const IsExpandVisible = (businessRules: Dictionary<IBusinessRule>, expandCutoffCount?: number): boolean => {
  let count = 0;
  Object.keys(businessRules).forEach(field => {
    if (!businessRules[field].hidden) {
      count += 1;
    }
  });

  return expandCutoffCount ? count > expandCutoffCount : count > HookInlineFormConstants.defaultExpandCutoffCount;
};

/**
 * Get Confirm Input Modal Props
 * @param dirtyFieldNames Dirty Field Names
 * @param fieldRules Field Business Rules
 * @returns Modal Props
 */
export const GetConfirmInputModalProps = (
  dirtyFieldNames: string[],
  fieldRules: Dictionary<IBusinessRule>
): IConfirmInputModalProps => {
  const confirmInputModalProps: IConfirmInputModalProps = {};

  dirtyFieldNames?.forEach(fieldName => {
    fieldRules[fieldName]?.dependentFields?.forEach(dependentFieldName => {
      if (fieldRules[dependentFieldName].confirmInput) {
        if (confirmInputModalProps.confirmInputsTriggeredBy === undefined) {
          confirmInputModalProps.confirmInputsTriggeredBy = fieldName;
          confirmInputModalProps.dependentFieldNames = [dependentFieldName];
        } else {
          confirmInputModalProps.dependentFieldNames.push(dependentFieldName);
        }
      }
    });
  });

  confirmInputModalProps.otherDirtyFields = dirtyFieldNames?.filter(
    fieldName =>
      !confirmInputModalProps.dependentFieldNames?.includes(fieldName) &&
      fieldName !== confirmInputModalProps.confirmInputsTriggeredBy
  );

  return confirmInputModalProps;
};

/**
 * Get Value Functions on Dirty Fields
 * @param dirtyFieldNames Dirty Field Names
 * @param fieldRules Field Business Rules
 * @returns value functions to execute
 */
export const GetValueFunctionsOnDirtyFields = (
  dirtyFieldNames: string[],
  fieldRules: Dictionary<IBusinessRule>
): IExecuteValueFunction[] => {
  const valueFunctions: IExecuteValueFunction[] = [];

  dirtyFieldNames?.forEach(fieldName => {
    fieldRules[fieldName]?.dependentFields?.forEach(dependentFieldName => {
      if (
        fieldRules[dependentFieldName].valueFunction &&
        !isStringEmpty(fieldRules[dependentFieldName].valueFunction) &&
        !fieldRules[dependentFieldName].onlyOnCreate &&
        dirtyFieldNames.indexOf(dependentFieldName) === -1
      ) {
        valueFunctions.push({
          fieldName: dependentFieldName,
          valueFunction: fieldRules[dependentFieldName].valueFunction
        });
      }
    });
  });

  return valueFunctions;
};

/**
 * Get Value Functions
 * @param fieldRules Field Business Rules
 * @returns value functions to execute
 */
export const GetValueFunctionsOnCreate = (fieldRules: Dictionary<IBusinessRule>): IExecuteValueFunction[] => {
  const valueFunctions: IExecuteValueFunction[] = [];

  Object.keys(fieldRules).forEach(fieldName => {
    if (
      fieldRules[fieldName].valueFunction &&
      !isStringEmpty(fieldRules[fieldName].valueFunction) &&
      fieldRules[fieldName].onlyOnCreate
    ) {
      valueFunctions.push({
        fieldName,
        valueFunction: fieldRules[fieldName].valueFunction
      });
    }
  });

  return valueFunctions;
};

/**
 * Execute Value Function
 * @param valueFunction Value Function
 * @param fieldValue Field Value
 * @returns New Value
 */
export const ExecuteValueFunction = (
  fieldName: string,
  valueFunction: string,
  fieldValue?: SubEntityType,
  parentEntity?: IEntityData,
  upn?: string
): SubEntityType => {
  switch (valueFunction) {
    case "setDate":
      return new Date();
    case "setDateIfNull":
      return fieldValue ? fieldValue : new Date();
    case "setLoggedInUser":
      return { Upn: upn };
    case "inheritFromParent":
      return parentEntity ? parentEntity[fieldName] : undefined;
    default:
      return undefined;
  }
};

/**
 * Check Field Validation Rules
 * @param value Value
 * @param entityData Entity Data
 * @param validations Validations
 * @returns Validation Message or undefined if valid
 */
export const CheckFieldValidationRules = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  entityData: IEntityData,
  validations: string[]
): string | undefined => {
  let errorMessage = "";

  validations.forEach(validation => {
    const validationResult = ExecuteValidation(value, entityData, validation);
    if (validationResult && !errorMessage) {
      errorMessage = `${validationResult}`;
    } else if (validationResult) {
      // multiple validation errors
      errorMessage += `${errorMessage} & ${validationResult}`;
    }
  });

  return errorMessage ? errorMessage : undefined;
};

/**
 * Execute Validation
 * @param value Value
 * @param entityData Entity Data
 * @param validation Validation
 * @returns Validation Message or undefined if valid
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ExecuteValidation = (value: any, entityData: IEntityData, validation: string): string | undefined => {
  switch (validation) {
    case "EndDateValidation":
      return EndDateValidation(value as Date, entityData);
    case "StartDateValidation":
      return StartDateValidation(value as Date, entityData);
    case "EmailValidation":
      return EmailValidation(`${value}`);
    case "Max150KbValidation":
      return Max150KbValidation(`${value}`);
    case "Max32KbValidation":
      return Max32KbValidation(`${value}`);
    case "PhoneNumberValidation":
      return PhoneNumberValidation(`${value}`);
    case "YearValidation":
      return YearValidation(`${value}`);
    case "AzureServiceSizeLimitValidation_3":
      return AzureServiceSizeLimitValidation(3)(value as IDropdownItem[]);
    default:
      return undefined;
  }
};

/**
 * When a value already exists in an entity but it's not a valid option for the available business rules, it will get cleared.
 * @param fieldRules Field Rules
 * @param formValues Form Values
 * @param setValue Set Value
 */
export const CheckValidDropdownOptions = (
  fieldRules: Dictionary<IBusinessRule>,
  fieldConfigs: Dictionary<IFieldConfig>,
  formValues: IEntityData,
  setValue: UseFormSetValue<IEntityData>
) => {
  if (!isEmpty(fieldRules) && !isEmpty(formValues)) {
    Object.keys(fieldRules).forEach(fieldName => {
      const { component, dropdownOptions } = fieldRules[fieldName];
      if (
        (component === HookInlineFormConstants.dropdown || component === HookInlineFormConstants.statusDropdown) &&
        !isNull(formValues[fieldName]) &&
        dropdownOptions?.findIndex(option => option.key === formValues[fieldName]) === -1 &&
        !CheckIsDeprecated(formValues[fieldName] as string, fieldConfigs[fieldName])
      ) {
        // Clear non-deprecated dropdown options that are not valid for dropdown and status dropdown
        setValue(`${fieldName}` as const, null, { shouldDirty: false });
      } else if (component === HookInlineFormConstants.multiselect && !isNull(formValues[fieldName])) {
        const filteredValues = (formValues[fieldName] as string[])?.filter(
          option =>
            dropdownOptions?.map(dropdownOption => dropdownOption.key).includes(option) &&
            !CheckIsDeprecated(option, fieldConfigs[fieldName])
        );
        if (filteredValues?.length !== (formValues[fieldName] as string[]).length) {
          // Clear non-deprecated dropdown options that are not valid for multiselect
          setValue(`${fieldName}` as const, filteredValues, { shouldDirty: false });
        }
      }
    });
  }
};

/**
 * Adds deprecated dropdown option to dropdown options for field
 * @param fieldConfig Field Config
 * @param dropdownOptions Dropdown Options
 * @param fieldValue Field Value
 */
export const CheckDeprecatedDropdownOptions = (
  fieldConfig: IFieldConfig,
  dropdownOptions: IDropdownOption[],
  fieldValue?: unknown
): IDropdownOption[] => {
  const deprecatedOptions: IDropdownOption[] = [];
  const { component } = fieldConfig;
  if (
    (component === HookInlineFormConstants.dropdown || component === HookInlineFormConstants.statusDropdown) &&
    dropdownOptions?.findIndex(option => option.key === (fieldValue as string)) === -1 &&
    CheckIsDeprecated(fieldValue as string, fieldConfig)
  ) {
    deprecatedOptions.push({
      ...SetDropdownValue(fieldValue as string),
      disabled: true,
      data: {
        iconName: "Info",
        iconTitle: "This value has been Deprecated"
      }
    });
  } else if (component === HookInlineFormConstants.multiselect) {
    (fieldValue as string[])?.forEach(selectedOption => {
      if (CheckIsDeprecated(selectedOption, fieldConfig)) {
        // Add deprecated value to dropdown options
        deprecatedOptions.push({
          ...SetDropdownValue(selectedOption),
          disabled: true,
          data: {
            iconName: "Info",
            iconTitle: "This value has been Deprecated"
          }
        });
      }
    });
  }
  return deprecatedOptions;
};

/**
 * When business rules change and a field is shown that has no value, check if it has default value and set it
 * @param fieldRules Field Rules
 * @param formValues Form Values
 * @param setValue Set Value
 */
export const CheckDefaultValues = (
  fieldRules: Dictionary<IBusinessRule>,
  formValues: IEntityData,
  setValue: UseFormSetValue<IEntityData>
) => {
  if (isEmpty(fieldRules) || isEmpty(formValues)) {
    return;
  }
  Object.keys(fieldRules).forEach(fieldName => {
    const { defaultValue, hidden } = fieldRules[fieldName];
    if (!isNull(defaultValue) && isNull(formValues[fieldName]) && !hidden) {
      setValue(`${fieldName}` as const, defaultValue, { shouldDirty: true });
    }
  });
};

/**
 * Check if a field is deprecated. See deprecated definition in DatamodelPropertyMaps.ts
 * @param entityValue Value to check
 * @param fieldConfig Field Config
 */
export const CheckIsDeprecated = (entityValue: string, fieldConfig: IFieldConfig) => {
  const items = fieldConfig?.deprecatedDropdownOptions?.map((item: IDeprecatedOption) => item.oldVal);
  return items?.includes(entityValue);
};

/**
 * Init On Create Business Rules
 * @param configName Config Name
 * @param fieldConfigs Property Configs
 * @param defaultValues Default Values
 * @param parentEntity Parent Entity
 * @param upn Logged in user upn
 * @param setValue Set Value
 * @param initBusinessRules Init Business Rules
 * @returns On Load Rules and Init Entity Data
 */
export const InitOnCreateBusinessRules = (
  configName: string,
  fieldConfigs: Dictionary<IPropertyConfig>,
  defaultValues: IEntityData,
  parentEntity: IEntityData,
  upn: string,
  setValue: UseFormSetValue<IEntityData>,
  initBusinessRules: (
    configName: string,
    defaultValues: IEntityData,
    fieldConfigs: Dictionary<IFieldConfig>,
    areAllFieldsReadonly?: boolean,
    defaultFieldRules?: Dictionary<IBusinessRule>
  ) => IConfigBusinessRules
): { onLoadRules: IConfigBusinessRules; initEntityData: IEntityData } => {
  const defaultBusinessRules = GetDefaultBusinessRules(fieldConfigs);
  const initEntityData: IEntityData = { ...defaultValues, Parent: { ...parentEntity } };
  const executeValueFunctions = GetValueFunctionsOnCreate(defaultBusinessRules);

  executeValueFunctions?.forEach(executeValueFunction => {
    if (executeValueFunction.valueFunction) {
      const fieldValue = ExecuteValueFunction(
        executeValueFunction.fieldName,
        executeValueFunction.valueFunction,
        undefined,
        parentEntity,
        upn
      );
      setValue(`${executeValueFunction.fieldName}` as const, fieldValue);
      initEntityData[executeValueFunction.fieldName] = fieldValue;
    }
  });

  Object.keys(defaultBusinessRules).forEach(fieldName => {
    if (defaultBusinessRules[fieldName].onlyOnCreateValue) {
      setValue(`${fieldName}` as const, defaultBusinessRules[fieldName].onlyOnCreateValue);
      initEntityData[fieldName] = defaultBusinessRules[fieldName].onlyOnCreateValue;
    } else if (defaultBusinessRules[fieldName].defaultValue) {
      setValue(`${fieldName}` as const, defaultBusinessRules[fieldName].defaultValue);
      initEntityData[fieldName] = defaultBusinessRules[fieldName].defaultValue;
    }
  });

  return {
    onLoadRules: initBusinessRules(configName, initEntityData, fieldConfigs, false, defaultBusinessRules),
    initEntityData
  };
};

/**
 * Init On Edit Business Rules
 * @param configName Config Name
 * @param fieldConfigs Property Configs
 * @param defaultValues Default Values
 * @param areAllFieldsReadonly Are All Fields Readonly
 * @param initBusinessRules Init Business Rules
 * @returns Init On Edit Business Rules
 */
export const InitOnEditBusinessRules = (
  configName: string,
  fieldConfigs: Dictionary<IPropertyConfig>,
  defaultValues: IEntityData,
  areAllFieldsReadonly: boolean,
  initBusinessRules: (
    configName: string,
    defaultValues: IEntityData,
    fieldConfigs: Dictionary<IFieldConfig>,
    areAllFieldsReadonly?: boolean,
    defaultFieldRules?: Dictionary<IBusinessRule>
  ) => IConfigBusinessRules
): { onLoadRules: IConfigBusinessRules; initEntityData: IEntityData } => {
  return {
    onLoadRules: initBusinessRules(configName, defaultValues, fieldConfigs, areAllFieldsReadonly),
    initEntityData: defaultValues
  };
};

/**
 * With filter enabled, filter based on field value and field label
 * @param filterText Filter Text
 * @param value Value
 * @param label Label
 * @returns True if field should be shown
 */
export const ShowField = (filterText?: string, value?: SubEntityType, label?: string): boolean => {
  return (
    !filterText ||
    JSON.stringify(value)
      ?.toLowerCase()
      .includes(filterText.toLowerCase()) ||
    label?.toLowerCase().includes(filterText.toLowerCase())
  );
};

export const CombineSchemaConfig = (
  fieldConfigs: Dictionary<IPropertyConfig>,
  schemaConfigs: Dictionary<IPropertySchema>
): Dictionary<IFieldConfig> => {
  const results = DeepCopy(fieldConfigs) as Dictionary<IFieldConfig>;

  Object.keys(fieldConfigs).map(fieldName => {
    const fieldConfigSchema = schemaConfigs[fieldName];

    // Default Value
    const cxpDefault = fieldConfigSchema?.cxpDefault ? (fieldConfigSchema?.cxpDefault as string) : undefined;
    const defaultValue =
      cxpDefault && /^\{[\S\s]*}$/.test(cxpDefault)
        ? GetDefaultValue(cxpDefault.slice(1, -1), fieldConfigSchema.type)
        : cxpDefault;

    results[fieldName].defaultValue = defaultValue;

    // Dropdown Options
    results[fieldName].dropdownOptions = fieldConfigSchema?.values
      ? ProcessDropdownOptions(fieldConfigSchema.values as IDropdownOption[], fieldConfigs[fieldName])
      : [];

    // Dropdown Options Business Rules
    fieldConfigSchema?.depdendencyRules?.forEach(dependencyRule => {
      if (dependencyRule.cxpConditions?.length === 1) {
        const { cxpFieldName, cxpFieldValue } = dependencyRule.cxpConditions[0];
        const dropdownOptions = dependencyRule.cxpDependencyValues as string[];

        if (results[cxpFieldName]?.dropdownDependencies?.[cxpFieldValue]) {
          results[cxpFieldName].dropdownDependencies[cxpFieldValue][fieldName] = [...dropdownOptions];
        } else if (results[cxpFieldName]) {
          results[cxpFieldName].dropdownDependencies = results[cxpFieldName].dropdownDependencies || {};
          results[cxpFieldName].dropdownDependencies[cxpFieldValue] =
            results[cxpFieldName].dropdownDependencies[cxpFieldValue] || {};
          results[cxpFieldName].dropdownDependencies[cxpFieldValue][fieldName] = [...dropdownOptions];
        }
      }
    });

    // Deprecated Dropdown Options
    results[fieldName].deprecatedDropdownOptions = fieldConfigSchema?.cxpDeprecatedEnum
      ? [...fieldConfigSchema?.cxpDeprecatedEnum]
      : [];
  });

  return results;
};

const GetDefaultValue = (value: string, type: string[]): string | number | boolean => {
  if (type.indexOf(Types.boolean) > -1) {
    try {
      return JSON.parse(value.toLowerCase());
    } catch (e) {
      return undefined;
    }
  } else if (type.indexOf(Types.number) > -1 || type.indexOf(Types.integer) > -1) {
    return +value;
  } else if (type.indexOf(Types.string) > -1) {
    return value.replace(/'/g, "");
  } else {
    return value;
  }
};

/**
 * Gets fields to render based on business rules hidden and field render limit
 * @param fieldRenderLimit field render limit
 * @param fieldOrder field order
 * @param fieldRules field rules
 * @returns Fields to render
 */
export const GetFieldsToRender = (
  fieldRenderLimit: number,
  fieldOrder: string[],
  fieldRules?: Dictionary<IBusinessRule>
): IFieldToRender[] => {
  if (fieldRenderLimit) {
    const fieldsToRender: IFieldToRender[] = [];
    let count = 0;
    fieldOrder.forEach(fieldName => {
      if (fieldRules?.[fieldName]?.hidden) {
        return;
      } else if (count === fieldRenderLimit) {
        fieldsToRender.push({ fieldName, softHidden: true });
      } else {
        fieldsToRender.push({ fieldName, softHidden: false });
        count += 1;
      }
    });
    return fieldsToRender;
  } else {
    return fieldOrder?.map(fieldName => {
      return { fieldName, softHidden: false };
    });
  }
};
