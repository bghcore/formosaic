import { IFieldConfig } from "../types/IFieldConfig";

export interface IFormFieldProps {
  name: string;
  config: IFieldConfig;
}

/** Declaration-only component. Returns null. Props read by ComposedForm. */
export function FormField(_props: IFormFieldProps): null {
  return null;
}
FormField.displayName = "FormField";
