import { IFieldConfig } from "./IFieldConfig";
import { IRule } from "./IRule";
import { IWizardConfig } from "./IWizardConfig";

export interface ITemplateParamSchema {
  type: "string" | "number" | "boolean";
  enum?: unknown[];
  default?: unknown;
  required?: boolean;
}

export interface ITemplateFieldRef {
  templateRef: string;
  templateParams?: Record<string, unknown>;
  templateOverrides?: Record<string, Partial<IFieldConfig>>;
  defaultValues?: Record<string, unknown>;
}

export function isTemplateFieldRef(
  field: IFieldConfig | ITemplateFieldRef
): field is ITemplateFieldRef {
  return "templateRef" in field && typeof (field as ITemplateFieldRef).templateRef === "string";
}

// TParams is a marker type for registerFormTemplate<T>() call-site inference only.
export interface IFormTemplate<TParams extends Record<string, unknown> = Record<string, unknown>> {
  params?: Record<string, ITemplateParamSchema>;
  fields: Record<string, IFieldConfig | ITemplateFieldRef>;
  fieldOrder?: string[];
  rules?: IRule[];
  wizard?: IWizardConfig;
  ports?: Record<string, string[]>;
}
