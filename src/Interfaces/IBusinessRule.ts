import { IDropdownOption } from "@fluentui/react";
import { SingleTypes } from "../../DataModelsSchema/Models/DataModelsSchema";
export interface IBusinessRule {
  /**
   * Component (business rules can change this value - see ApplyBusinessRule)
   */
  component?: string;
  /**
   * Field Required (business rules can change this value - see ApplyBusinessRule)
   */
  required?: boolean;

  /**
   * Field Hidden (business rules can change this value - see ApplyBusinessRule)
   */
  hidden?: boolean;

  /**
   * Field Read Only (business rules can change this value - see ApplyBusinessRule)
   */
  readOnly?: boolean;

  /**
   * Validations (business rules can change this value - see ApplyBusinessRule)
   */
  validations?: string[];

  /**
   * Value Function (business rules can change this value - see ApplyBusinessRule)
   */
  valueFunction?: string;

  /**
   * Confirm Input in Modal before save (business rules can change this value - see ApplyBusinessRule)
   */
  confirmInput?: boolean;

  /**
   * Dropdown options from schema (business rules can change this value - see ApplyBusinessRule)
   */
  dropdownOptions?: IDropdownOption[];

  /**
   * Only on Create
   */
  onlyOnCreate?: boolean;

  /**
   * Only on Create Value
   */
  onlyOnCreateValue?: string | number | boolean | Date;

  /**
   * Default value (set by cxpDefaultValue in schema config)
   */
  defaultValue?: SingleTypes;

  /**
   * fields whose business rules change based on this field's value (dependencies config)
   */
  dependentFields?: string[];

  /**
   * fields whose value will change this field's business rules (dependencies config)
   */
  dependsOnFields?: string[];

  /**
   * fields whose business rules change based on this field's value (dependencies config)
   */
  orderDependentFields?: string[];

  /**
   * fields whose value will change this field's business rules (dependencies config)
   */
  pivotalRootField?: string;

  /**
   * fields whose business rules change based on this field's value (dependencyRules config)
   */
  comboDependentFields?: string[];

  /**
   * fields whose value will change this field's business rules (dependencyRules config)
   */
  comboDependsOnFields?: string[];

  /**
   * fields whose dropdown values change based on this field's value (schema depdendencyRules/cxpConditions/cxpDependencyValues config)
   */
  dependentDropdownFields?: string[];

  /**
   * fields whose dropdown values change based on this field's value (schema depdendencyRules/cxpConditions/cxpDependencyValues config)
   */
  dependsOnDropdownFields?: string[];
}
