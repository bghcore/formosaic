import { Dictionary } from "@cxpui/common";
import { IBusinessRule } from "./IBusinessRule";

/**
 * Business rules for a given config name
 */
export interface IConfigBusinessRules {
  /**
   * Order of fields
   */
  order: string[];

  /**
   * Field business rules
   */
  fieldRules: Dictionary<IBusinessRule>;
}
