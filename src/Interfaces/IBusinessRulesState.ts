import { Dictionary } from "@cxpui/common";
import { IConfigBusinessRules } from "./IConfigBusinessRules";

export interface IBusinessRulesState {
  /**
   * Business Rules Configs per config name (order and field business rules)
   */
  configRules: Dictionary<IConfigBusinessRules>;
}
