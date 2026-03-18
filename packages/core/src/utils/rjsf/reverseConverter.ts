import { IFieldConfig } from "../../types/IFieldConfig";
import { IFormConfig } from "../../types/IFormConfig";
import { IJsonSchemaNode, IRjsfUiSchema } from "./types";

/**
 * Reverse-convert an IFormConfig to JSON Schema + uiSchema.
 *
 * Best-effort: structural fidelity only. Rules, computed values,
 * and other dynamic features do NOT map back to JSON Schema.
 */
export function toRjsfSchema(config: IFormConfig): {
  schema: IJsonSchemaNode;
  uiSchema: IRjsfUiSchema;
} {
  const properties: Record<string, IJsonSchemaNode> = {};
  const required: string[] = [];
  const uiSchema: IRjsfUiSchema = {};

  // Cast fields to Record<string, IFieldConfig>: toRjsfSchema expects resolved configs
  // (no template refs). If unresolved templateRefs are present they are silently skipped.
  const resolvedFields = config.fields as Record<string, IFieldConfig>;
  for (const [fieldName, fieldConfig] of Object.entries(resolvedFields)) {
    // Skip any unresolved template refs (safety guard)
    if (!fieldConfig.type) continue;

    // Handle dot-notation (flattened nested objects)
    if (fieldName.includes(".")) {
      setNestedProperty(properties, required, uiSchema, fieldName, fieldConfig);
      continue;
    }

    properties[fieldName] = fieldConfigToSchemaNode(fieldConfig);
    if (fieldConfig.required) required.push(fieldName);

    const fieldUi = fieldConfigToUiSchema(fieldConfig);
    if (Object.keys(fieldUi).length > 0) {
      uiSchema[fieldName] = fieldUi;
    }
  }

  // Set field order in uiSchema
  if (config.fieldOrder && config.fieldOrder.length > 0) {
    uiSchema["ui:order"] = config.fieldOrder;
  }

  const schema: IJsonSchemaNode = {
    type: "object",
    properties,
  };
  if (required.length > 0) schema.required = required;

  return { schema, uiSchema };
}

// --- Internal helpers ---

const REVERSE_TYPE_MAP: Record<string, string> = {
  Textbox: "string",
  Textarea: "string",
  Number: "number",
  Slider: "number",
  Toggle: "boolean",
  DateControl: "string",
  Dropdown: "string",
  Multiselect: "array",
  DocumentLinks: "string",
  DynamicFragment: "string",
};

const REVERSE_WIDGET_MAP: Record<string, string> = {
  Textarea: "textarea",
  Slider: "range",
  Toggle: "checkbox",
  DocumentLinks: "file",
};

function fieldConfigToSchemaNode(config: IFieldConfig): IJsonSchemaNode {
  const node: IJsonSchemaNode = {};

  // Type
  const jsonType = REVERSE_TYPE_MAP[config.type] ?? "string";
  node.type = jsonType;

  if (config.label) node.title = config.label;
  if (config.description) node.description = config.description;
  if (config.defaultValue !== undefined) node.default = config.defaultValue;

  // Options → enum
  if (config.options && config.options.length > 0) {
    node.enum = config.options.map((o) => o.value);
    const labels = config.options.map((o) => o.label);
    const valuesAsStrings = config.options.map((o) => String(o.value));
    // Only set enumNames if labels differ from values
    if (labels.some((l, i) => l !== valuesAsStrings[i])) {
      node.enumNames = labels;
    }
  }

  // Validation rules → schema constraints
  if (config.validate) {
    for (const rule of config.validate) {
      applyValidationToSchema(node, rule.name, rule.params);
    }
  }

  // FieldArray → array with object items
  if (config.type === "FieldArray" && config.items) {
    node.type = "array";
    const itemProperties: Record<string, IJsonSchemaNode> = {};
    const itemRequired: string[] = [];
    for (const [itemName, itemConfig] of Object.entries(config.items)) {
      itemProperties[itemName] = fieldConfigToSchemaNode(itemConfig);
      if (itemConfig.required) itemRequired.push(itemName);
    }
    node.items = {
      type: "object",
      properties: itemProperties,
      ...(itemRequired.length > 0 ? { required: itemRequired } : {}),
    };
    if (config.minItems !== undefined) node.minItems = config.minItems;
    if (config.maxItems !== undefined) node.maxItems = config.maxItems;
  }

  // Multiselect → array with enum items
  if (config.type === "Multiselect" && config.options) {
    node.type = "array";
    node.items = {
      type: "string",
      enum: config.options.map((o) => o.value),
    };
    // Move enum off the root node
    delete node.enum;
    delete node.enumNames;
  }

  // Format
  if (config.type === "DateControl") {
    node.format = "date";
  }
  if (config.type === "DocumentLinks") {
    node.format = "data-url";
  }

  // Password / color via config
  if (config.config?.type === "password" || config.config?.type === "color") {
    // No schema equivalent, handled in uiSchema
  }

  return node;
}

function fieldConfigToUiSchema(config: IFieldConfig): IRjsfUiSchema {
  const ui: IRjsfUiSchema = {};

  // Widget mapping
  const widget = REVERSE_WIDGET_MAP[config.type];
  if (widget) ui["ui:widget"] = widget;

  // Config-based widget overrides
  if (config.config?.type === "password") ui["ui:widget"] = "password";
  if (config.config?.type === "color") ui["ui:widget"] = "color";
  if (config.config?.display === "radio") ui["ui:widget"] = "radio";
  if (config.config?.display === "checkboxes") ui["ui:widget"] = "checkboxes";

  if (config.placeholder) ui["ui:placeholder"] = config.placeholder;
  if (config.helpText) ui["ui:help"] = config.helpText;
  if (config.hidden) ui["ui:hidden"] = true;
  if (config.readOnly) ui["ui:readonly"] = true;
  if (config.disabled) ui["ui:disabled"] = true;
  if (config.config?.autofocus) ui["ui:autofocus"] = true;
  if (config.config?.className) ui["ui:classNames"] = config.config.className as string;
  if (config.config?.hideLabel) ui["ui:label"] = false;

  // Disabled options
  if (config.options) {
    const disabled = config.options
      .filter((o) => o.disabled)
      .map((o) => o.value);
    if (disabled.length > 0) ui["ui:enumDisabled"] = disabled;
  }

  return ui;
}

function applyValidationToSchema(
  node: IJsonSchemaNode,
  name: string,
  params?: Record<string, unknown>
): void {
  switch (name) {
    case "minLength":
      node.minLength = Number(params?.min ?? 0);
      break;
    case "maxLength":
      node.maxLength = Number(params?.max ?? 0);
      break;
    case "pattern":
      node.pattern = String(params?.pattern ?? "");
      break;
    case "numericRange":
      if (params?.min !== undefined && params.min !== -Infinity)
        node.minimum = Number(params.min);
      if (params?.max !== undefined && params.max !== Infinity)
        node.maximum = Number(params.max);
      break;
    case "exclusiveNumericRange":
      if (params?.exclusiveMin !== undefined)
        node.exclusiveMinimum = Number(params.exclusiveMin);
      if (params?.exclusiveMax !== undefined)
        node.exclusiveMaximum = Number(params.exclusiveMax);
      break;
    case "multipleOf":
      node.multipleOf = Number(params?.factor ?? 1);
      break;
    case "email":
      node.format = "email";
      break;
    case "url":
      node.format = "uri";
      break;
    case "uniqueInArray":
      node.uniqueItems = true;
      break;
  }
}

function setNestedProperty(
  properties: Record<string, IJsonSchemaNode>,
  required: string[],
  uiSchema: IRjsfUiSchema,
  dotPath: string,
  config: IFieldConfig
): void {
  const parts = dotPath.split(".");
  let currentProps = properties;
  let currentUi = uiSchema;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!currentProps[part]) {
      currentProps[part] = {
        type: "object",
        properties: {},
      };
    }
    if (!currentProps[part].properties) {
      currentProps[part].properties = {};
    }
    currentProps = currentProps[part].properties!;

    if (!currentUi[part]) {
      currentUi[part] = {};
    }
    currentUi = currentUi[part] as IRjsfUiSchema;
  }

  const leafName = parts[parts.length - 1];
  currentProps[leafName] = fieldConfigToSchemaNode(config);
  if (config.required) {
    // Add to parent's required array
    const parentPath = parts.slice(0, -1);
    let parentNode: IJsonSchemaNode | undefined;
    let props = properties;
    for (const p of parentPath) {
      parentNode = props[p];
      props = parentNode?.properties ?? {};
    }
    if (parentNode) {
      parentNode.required = [...(parentNode.required ?? []), leafName];
    }
  }

  const fieldUi = fieldConfigToUiSchema(config);
  if (Object.keys(fieldUi).length > 0) {
    currentUi[leafName] = fieldUi;
  }
}
