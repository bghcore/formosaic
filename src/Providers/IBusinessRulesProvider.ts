import { Dictionary, IEntityData } from "@cxpui/common";
import { IBusinessRule } from "../Interfaces/IBusinessRule";
import { IBusinessRulesState } from "../Interfaces/IBusinessRulesState";
import { IConfigBusinessRules } from "../Interfaces/IConfigBusinessRules";
import { IFieldConfig } from "../Interfaces/IFieldConfig";

export interface IBusinessRulesProvider {
  /**
   * Business Rules for each field
   */
  businessRules: IBusinessRulesState;

  /**
   * Init Business Rules
   * @param configName Form Config Name
   * @param defaultValues Entity Values
   * @param fieldConfigs Property Configs
   * @param areAllFieldsReadonly Are all read only
   * @param defaultFieldRules Default Field Rules
   * @returns business rules
   */
  initBusinessRules: (
    configName: string,
    defaultValues: IEntityData,
    fieldConfigs: Dictionary<IFieldConfig>,
    areAllFieldsReadonly?: boolean,
    defaultFieldRules?: Dictionary<IBusinessRule>
  ) => IConfigBusinessRules;

  /**
   * Process business rule
   * @param entityData Entity Data
   * @param configName Config Name
   * @param fieldName Field Name
   * @param previousValue Previous field value
   * @param fieldConfigs Property Configs
   * @returns True if business rules were updated
   */
  processBusinessRule: (
    entityData: IEntityData,
    configName: string,
    fieldName: string,
    previousValue: string,
    fieldConfigs: Dictionary<IFieldConfig>
  ) => void;
}

export const defaultBusinessRulesState: IBusinessRulesState = {
  configRules: {}
};
