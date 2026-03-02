import { IDropdownOption } from "@fluentui/react";
import { Dictionary } from "lodash";
import { OrderDependencies } from "./IOrderDependencies";

export interface IFieldConfig {
  /**
   * Component Name - can be affected by business rules
   */
  component?: string;

  /**
   * Field Required by default - can be affected by business rules
   */
  required?: boolean;

  /**
   * Field Hidden by default - can be affected by business rules
   */
  hidden?: boolean;

  /**
   * Field Read Only by default - can be affected by business rules
   */
  readOnly?: boolean;

  /**
   * This indicates if the property should be rendered as readonly or not
   */
  isReadonly?: boolean; // TODO switch to readOnly

  /**
   * Field Disabled by default - can be affected by business rules
   */
  disabled?: boolean;

  /**
   * Field Label
   */
  label?: string;

  /**
   * Defines order of all fields in config based on value defined in rule
   */
  orderDependencies?: Dictionary<OrderDependencies>;

  /**
   * Only on Create - for value function
   */
  onlyOnCreate?: boolean;

  /**
   * Only on Create Value
   */
  onlyOnCreateValue?: string | number | boolean | Date;

  /**
   * Default value (set by cxpDefaultValue in schema config)
   */
  defaultValue?: string | number | boolean;

  /**
   * For confirming values or inputing new values before final save
   */
  confirmInput?: boolean;

  /**
   * when true, field will be hidden only in Create scenarios. Create scenario is determined based on isCreate passed to field props
   */
  hideOnCreate?: boolean;

  /**
   * Indicates whether to skip making the current component readonly when layout readonly flag is set to true
   */
  skipLayoutReadOnly?: boolean;

  /**
   * These are the list of fields that change depending on current field's value
   */
  dependencies?: Dictionary<Dictionary<IFieldConfig>>;

  /**
   * rules as how the field is dependent on other fields and their values
   */
  dependencyRules?: IDependencyAndRules;

  /**
   * Dropdown dependency rules
   */
  dropdownDependencies?: Dictionary<Dictionary<string[]>>;

  /**
   *if the value provided to value property above is function name then this has to be set to true.
    If isValueFunction is not set to true then value will be considered as  string | number | boolean
   */
  isValueFunction?: boolean;

  /**
   * Function references for Redux validations
   */
  validations?: string[];

  /**
   * Possible set of values
   */
  value?: string | number | boolean | Date;

  /**
   * This can have additional properties that need to be passed to component, ex: classnames, styling
   */
  meta?: Dictionary<string | boolean | number | string[] | object>;

  /**
   * Dropdown options from schema (business rules can change this value - see ApplyBusinessRule)
   */
  dropdownOptions?: IDropdownOption[];

  /**
   * Deprecated dropdown options
   */
  deprecatedDropdownOptions?: IDeprecatedOption[];
}

export interface IDependencyAndRules {
  /**
   * partial propert config that needs to be merged/replaced upon validation of rules
   */
  updatedConfig: Dictionary<IFieldConfig>;
  /**
   * rules for dependency with dependent field name as key. Supporting only strings as on today
   */
  rules: Dictionary<string[]>;
}

export interface IDeprecatedOption {
  oldVal: string;
  newVal?: string;
  isDeleted?: boolean;
}
