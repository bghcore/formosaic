import { IFieldConfig } from "./IFieldConfig";
import { ICondition } from "./ICondition";
import { IFormConfig, IFormSettings } from "./IFormConfig";
import { IWizardConfig } from "./IWizardConfig";

export interface IFragmentDef {
  template?: string;
  config?: IFormConfig;
  params?: Record<string, unknown>;
  overrides?: Record<string, Partial<IFieldConfig>>;
  defaultValues?: Record<string, unknown>;
}

export interface IFormConnection {
  name: string;
  when: ICondition;
  source: { fragment: string; port: string };
  target: { fragment: string; port: string };
  effect: "copyValues" | "hide" | "readOnly" | "computeFrom";
}

export interface IComposeFormOptions {
  fragments: Record<string, IFragmentDef>;
  fields?: Record<string, IFieldConfig>;
  connections?: IFormConnection[];
  fieldOrder?: string[];
  wizard?: IWizardConfig;
  settings?: IFormSettings;
  lookups?: Record<string, unknown>;
}
