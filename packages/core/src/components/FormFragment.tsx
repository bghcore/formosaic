import { IFormConfig } from "../types/IFormConfig";
import { IFieldConfig } from "../types/IFieldConfig";

export interface IFormFragmentProps {
  template?: string;
  config?: IFormConfig;
  params?: Record<string, unknown>;
  prefix: string;
  overrides?: Record<string, Partial<IFieldConfig>>;
  defaultValues?: Record<string, unknown>;
}

/** Declaration-only component. Returns null. Props read by ComposedForm. */
export function FormFragment(_props: IFormFragmentProps): null {
  return null;
}
FormFragment.displayName = "FormFragment";
