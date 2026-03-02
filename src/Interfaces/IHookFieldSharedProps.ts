import { IDropdownOption } from "@fluentui/react";
import { FieldError } from "react-hook-form";

export interface IHookFieldSharedProps<T> {
  /**
   * Field Name
   */
  fieldName?: string;

  /**
   * Entity Id
   */
  entityId?: string;

  /**
   * Entity Type
   */
  entityType?: string;

  /**
   * Program Name
   */
  programName?: string;

  /**
   * Parent Entity Id
   */
  parentEntityId?: string;

  /**
   * Parent Entity Type
   */
  parentEntityType?: string;

  /**
   * Read Only
   */
  readOnly?: boolean;

  /**
   * Required
   */
  required?: boolean;

  /**
   * Is Field Error
   */
  error?: FieldError;
  /**
   * How many Field errors are there
   */
  errorCount?: number;

  /**
   * Saving
   */
  saving?: boolean;

  /**
   * Is a save pending
   */
  savePending?: boolean;

  /**
   * Value
   */
  value?: unknown;

  /**
   * Meta data (Field Props)
   */
  meta?: T;

  /**
   * Dropdown Options
   */
  dropdownOptions?: IDropdownOption[];

  /**
   * Validations
   */
  validations?: string[];

  /**
   * Label - only for pop out editor, can be removed when advanced editor refactor is complete
   */
  label?: string;

  /**
   * Component - only for pop out editor, can be removed when advanced editor refactor is complete
   */
  component?: string;

  /**
   * Set Field Value
   */
  setFieldValue?: <T extends {}>(fieldName: string, fieldValue: T, skipSave?: boolean, timeout?: number) => void;
}
