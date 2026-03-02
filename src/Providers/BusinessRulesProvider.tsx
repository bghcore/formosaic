import { Dictionary, IEntityData } from "@cxpui/common";
import React from "react";
import {
  CombineBusinessRules,
  GetFieldValue,
  ProcessAllBusinessRules,
  ProcessComboFieldBusinessRule,
  ProcessFieldBusinessRule,
  ProcessFieldDropdownValues,
  ProcessFieldOrderDepencendies,
  ProcessPreviousFieldBusinessRule,
  RevertFieldBusinessRule,
  SameFieldOrder
} from "../Helpers/BusinessRulesHelper";
import { IBusinessRule } from "../Interfaces/IBusinessRule";
import { ActionTypeKeys } from "../Interfaces/IBusinessRuleActionKeys";
import { IConfigBusinessRules } from "../Interfaces/IConfigBusinessRules";
import { IFieldConfig } from "../Interfaces/IFieldConfig";
import businessRulesReducer from "../Reducers/BusinessRulesReducer";
import { IBusinessRulesProvider, defaultBusinessRulesState } from "./IBusinessRulesProvider";

const BusinessRulesContext: React.Context<IBusinessRulesProvider> = React.createContext(undefined);

export function UseBusinessRulesContext() {
  const context = React.useContext(BusinessRulesContext);
  if (context === undefined) {
    throw new Error("BusinessRulesContext must be used within HookInlineFormProvider");
  }
  return context;
}

// eslint-disable-next-line max-lines-per-function
export const BusinessRulesProvider: React.FC<React.PropsWithChildren<{}>> = (
  props: React.PropsWithChildren<{}>
): JSX.Element => {
  const [businessRules, businessRulesDispatch] = React.useReducer(businessRulesReducer, defaultBusinessRulesState);

  const initBusinessRules = (
    configName: string,
    defaultValues: IEntityData,
    fieldConfigs: Dictionary<IFieldConfig>,
    areAllFieldsReadonly?: boolean,
    defaultFieldRules?: Dictionary<IBusinessRule>
  ): IConfigBusinessRules => {
    const configBusinessRules = ProcessAllBusinessRules(
      defaultValues,
      fieldConfigs,
      areAllFieldsReadonly,
      defaultFieldRules
    );

    businessRulesDispatch({
      type: ActionTypeKeys.BUSINESSRULES_SET,
      payload: { configName, configBusinessRules }
    });

    return configBusinessRules;
  };

  const processBusinessRule = (
    entityData: IEntityData,
    configName: string,
    fieldName: string,
    previousValue: string,
    fieldConfigs: Dictionary<IFieldConfig>
  ) => {
    if (
      businessRules.configRules?.[configName]?.fieldRules[fieldName]?.dependentFields.length > 0 ||
      businessRules.configRules?.[configName]?.fieldRules[fieldName]?.dependsOnFields.length > 0 ||
      businessRules.configRules?.[configName]?.fieldRules[fieldName]?.pivotalRootField ||
      businessRules.configRules?.[configName]?.fieldRules[fieldName]?.comboDependentFields.length > 0 ||
      businessRules.configRules?.[configName]?.fieldRules[fieldName]?.dependentDropdownFields.length > 0
    ) {
      // Check Business Rules
      const pendingBusinessRules: IConfigBusinessRules = {
        fieldRules: {},
        order: [...businessRules.configRules[configName].order]
      };

      // Revert previously applied business rule to default
      CombineBusinessRules(
        pendingBusinessRules,
        RevertFieldBusinessRule(fieldName, previousValue, businessRules.configRules[configName], fieldConfigs)
      );

      // Rerun business rules on reverted fields
      CombineBusinessRules(
        pendingBusinessRules,
        ProcessPreviousFieldBusinessRule(
          fieldName,
          previousValue,
          businessRules.configRules[configName],
          fieldConfigs,
          entityData,
          pendingBusinessRules.fieldRules
        )
      );

      // Apply new business rule
      CombineBusinessRules(
        pendingBusinessRules,
        ProcessFieldBusinessRule(
          fieldName,
          GetFieldValue(entityData, fieldName),
          businessRules.configRules[configName],
          fieldConfigs,
          pendingBusinessRules.fieldRules
        )
      );

      // Apply combo business rules (AND)
      businessRules.configRules[configName].fieldRules[fieldName].comboDependentFields.forEach(dependentField => {
        CombineBusinessRules(pendingBusinessRules, {
          fieldRules: ProcessComboFieldBusinessRule(
            dependentField,
            businessRules.configRules[configName].fieldRules[dependentField],
            fieldConfigs[dependentField],
            entityData,
            pendingBusinessRules.fieldRules[dependentField]
          ),
          order: []
        });
      });

      // Apply dropdown option changes
      CombineBusinessRules(
        pendingBusinessRules,
        ProcessFieldDropdownValues(
          fieldName,
          entityData,
          businessRules.configRules[configName],
          fieldConfigs,
          pendingBusinessRules.fieldRules
        )
      );

      // Process Order Dependencies
      if (businessRules.configRules?.[configName]?.fieldRules[fieldName]?.pivotalRootField) {
        CombineBusinessRules(
          pendingBusinessRules,
          ProcessFieldOrderDepencendies(
            businessRules.configRules?.[configName]?.fieldRules[fieldName]?.pivotalRootField,
            fieldConfigs,
            entityData
          ),
          true
        );
      }

      if (
        Object.keys(pendingBusinessRules.fieldRules).length > 0 ||
        !SameFieldOrder(pendingBusinessRules.order, businessRules.configRules[configName].order)
      ) {
        businessRulesDispatch({
          type: ActionTypeKeys.BUSINESSRULES_UPDATE,
          payload: { configName, configBusinessRules: pendingBusinessRules }
        });
      }
    }
  };

  const BusinessRulesProvider: IBusinessRulesProvider = {
    businessRules,
    initBusinessRules,
    processBusinessRule
  };

  return <BusinessRulesContext.Provider value={BusinessRulesProvider}>{props.children}</BusinessRulesContext.Provider>;
};
