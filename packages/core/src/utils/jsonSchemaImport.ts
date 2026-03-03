import { Dictionary } from "../utils";
import { IFieldConfig } from "../types/IFieldConfig";

export interface IJsonSchema {
  type?: string | string[];
  properties?: Record<string, IJsonSchemaProperty>;
  required?: string[];
}

export interface IJsonSchemaProperty {
  type?: string | string[];
  title?: string;
  description?: string;
  enum?: (string | number)[];
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  default?: unknown;
  items?: IJsonSchemaProperty;
}

export function jsonSchemaToFieldConfig(schema: IJsonSchema): Dictionary<IFieldConfig> {
  const configs: Dictionary<IFieldConfig> = {};
  const requiredFields = new Set(schema.required ?? []);

  for (const [fieldName, property] of Object.entries(schema.properties ?? {})) {
    const component = mapTypeToComponent(property);
    const validations = mapFormatToValidations(property);
    const dropdownOptions = property.enum
      ? property.enum.map(v => ({ key: String(v), text: String(v) }))
      : undefined;

    configs[fieldName] = {
      component,
      label: property.title ?? fieldName,
      required: requiredFields.has(fieldName),
      validations: validations.length > 0 ? validations : undefined,
      dropdownOptions,
      defaultValue: property.default as string | number | boolean | undefined,
    };
  }

  return configs;
}

function mapTypeToComponent(property: IJsonSchemaProperty): string {
  if (property.enum) return "Dropdown";

  const type = Array.isArray(property.type) ? property.type[0] : property.type;

  switch (type) {
    case "string":
      if (property.format === "date" || property.format === "date-time") return "DateControl";
      if (property.format === "uri" || property.format === "url") return "Textbox";
      if (property.maxLength && property.maxLength > 200) return "Textarea";
      return "Textbox";
    case "number":
    case "integer":
      if (property.minimum !== undefined && property.maximum !== undefined) return "Slider";
      return "Number";
    case "boolean":
      return "Toggle";
    case "array":
      return "Multiselect";
    default:
      return "Textbox";
  }
}

function mapFormatToValidations(property: IJsonSchemaProperty): string[] {
  const validations: string[] = [];
  if (property.format === "email") validations.push("EmailValidation");
  if (property.format === "uri" || property.format === "url") validations.push("isValidUrl");
  if (property.format === "phone") validations.push("PhoneNumberValidation");
  return validations;
}
