import { IFieldConfig } from "./IFieldConfig";
import { IFormConfig } from "./IFormConfig";

export interface IResolvedFieldMeta {
  source: "direct" | "template";
  fragmentPrefix?: string;
  templateName?: string;
}

export interface ITemplateMeta {
  [resolvedFieldName: string]: {
    template: string;
    fragment: string;
    originalName: string;
  };
}

export interface IResolvedFormConfig extends IFormConfig {
  fields: Record<string, IFieldConfig>;
  _templateMeta?: ITemplateMeta;
  _resolvedPorts?: Record<string, string[]>;
  _fieldMeta?: Record<string, IResolvedFieldMeta>;
}
