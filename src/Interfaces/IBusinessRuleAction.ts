import { ActionTypeKeys } from "./IBusinessRuleActionKeys";
import { IConfigBusinessRules } from "./IConfigBusinessRules";

/**
 * Set Business Rules
 */
export interface IAddBusinessRules {
  readonly type: ActionTypeKeys.BUSINESSRULES_SET;
  readonly payload: {
    /**
     * Form Config Name
     */
    readonly configName: string;

    /**
     * Business Rules to Add
     */
    readonly configBusinessRules: IConfigBusinessRules;
  };
}

/**
 * Update Business Rules
 */
export interface IUpdateBusinessRules {
  readonly type: ActionTypeKeys.BUSINESSRULES_UPDATE;
  readonly payload: {
    /**
     * Form Config Name
     */
    readonly configName: string;

    /**
     * Business Rules to Update
     */
    readonly configBusinessRules: IConfigBusinessRules;
  };
}

type BusinessRulesActionType = IAddBusinessRules | IUpdateBusinessRules;

export default BusinessRulesActionType;
