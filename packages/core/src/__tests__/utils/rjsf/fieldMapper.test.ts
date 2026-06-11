import { describe, it, expect } from "vitest";
import {
  schemaNodeToFieldConfig,
  extractValidationRules,
  applyUiSchema,
} from "../../../utils/rjsf/fieldMapper";

describe("schemaNodeToFieldConfig", () => {
  it("should map string to Textbox", () => {
    const result = schemaNodeToFieldConfig("name", { type: "string" }, false);
    expect(result.type).toBe("Textbox");
    expect(result.label).toBe("name");
    expect(result.required).toBe(false);
  });

  it("should map string with title to label", () => {
    const result = schemaNodeToFieldConfig(
      "name",
      { type: "string", title: "Full Name" },
      true
    );
    expect(result.label).toBe("Full Name");
    expect(result.required).toBe(true);
  });

  it("should map string with enum to Dropdown", () => {
    const result = schemaNodeToFieldConfig(
      "color",
      { type: "string", enum: ["red", "blue", "green"] },
      false
    );
    expect(result.type).toBe("Dropdown");
    expect(result.options).toHaveLength(3);
    expect(result.options![0]).toEqual({ value: "red", label: "red" });
  });

  it("should use enumNames for option labels", () => {
    const result = schemaNodeToFieldConfig(
      "color",
      {
        type: "string",
        enum: ["r", "g", "b"],
        enumNames: ["Red", "Green", "Blue"],
      },
      false
    );
    expect(result.options![0]).toEqual({ value: "r", label: "Red" });
    expect(result.options![2]).toEqual({ value: "b", label: "Blue" });
  });

  it("should map string with format date to DateControl", () => {
    const result = schemaNodeToFieldConfig(
      "dob",
      { type: "string", format: "date" },
      false
    );
    expect(result.type).toBe("DateControl");
  });

  it("should map string with format date-time to DateControl", () => {
    const result = schemaNodeToFieldConfig(
      "ts",
      { type: "string", format: "date-time" },
      false
    );
    expect(result.type).toBe("DateControl");
  });

  it("should map string with format data-url to DocumentLinks", () => {
    const result = schemaNodeToFieldConfig(
      "file",
      { type: "string", format: "data-url" },
      false
    );
    expect(result.type).toBe("DocumentLinks");
  });

  it("should map string with maxLength > 200 to Textarea", () => {
    const result = schemaNodeToFieldConfig(
      "bio",
      { type: "string", maxLength: 500 },
      false
    );
    expect(result.type).toBe("Textarea");
  });

  it("should map number to Number", () => {
    const result = schemaNodeToFieldConfig("age", { type: "number" }, false);
    expect(result.type).toBe("Number");
  });

  it("should map integer to Number", () => {
    const result = schemaNodeToFieldConfig("count", { type: "integer" }, false);
    expect(result.type).toBe("Number");
  });

  it("should map number with min+max to Slider", () => {
    const result = schemaNodeToFieldConfig(
      "rating",
      { type: "number", minimum: 1, maximum: 10 },
      false
    );
    expect(result.type).toBe("Slider");
  });

  it("should map boolean to Toggle", () => {
    const result = schemaNodeToFieldConfig("active", { type: "boolean" }, false);
    expect(result.type).toBe("Toggle");
  });

  it("should map array with enum items to Multiselect", () => {
    const result = schemaNodeToFieldConfig(
      "tags",
      {
        type: "array",
        items: { type: "string", enum: ["a", "b", "c"] },
      },
      false
    );
    expect(result.type).toBe("Multiselect");
  });

  it("should map array with object items to FieldArray", () => {
    const result = schemaNodeToFieldConfig(
      "items",
      {
        type: "array",
        items: {
          type: "object",
          properties: { name: { type: "string" } },
        },
      },
      false
    );
    expect(result.type).toBe("FieldArray");
  });

  it("should map plain array to Multiselect", () => {
    const result = schemaNodeToFieldConfig(
      "list",
      { type: "array" },
      false
    );
    expect(result.type).toBe("Multiselect");
  });

  it("should handle nullable types (pick first non-null)", () => {
    const result = schemaNodeToFieldConfig(
      "name",
      { type: ["string", "null"] },
      false
    );
    expect(result.type).toBe("Textbox");
  });

  it("should handle const as read-only with default", () => {
    const result = schemaNodeToFieldConfig(
      "version",
      { const: "1.0" },
      false
    );
    expect(result.type).toBe("Textbox");
    expect(result.readOnly).toBe(true);
    expect(result.defaultValue).toBe("1.0");
  });

  it("should set description from schema", () => {
    const result = schemaNodeToFieldConfig(
      "name",
      { type: "string", description: "Enter your name" },
      false
    );
    expect(result.description).toBe("Enter your name");
  });

  it("should set defaultValue from schema default", () => {
    const result = schemaNodeToFieldConfig(
      "name",
      { type: "string", default: "John" },
      false
    );
    expect(result.defaultValue).toBe("John");
  });

  it("should default unknown types to Textbox", () => {
    const result = schemaNodeToFieldConfig("x", {}, false);
    expect(result.type).toBe("Textbox");
  });
});

describe("extractValidationRules", () => {
  it("should extract minLength", () => {
    const rules = extractValidationRules({ minLength: 3 });
    expect(rules).toContainEqual({
      name: "minLength",
      params: { min: 3 },
    });
  });

  it("should extract maxLength", () => {
    const rules = extractValidationRules({ maxLength: 100 });
    expect(rules).toContainEqual({
      name: "maxLength",
      params: { max: 100 },
    });
  });

  it("should extract pattern", () => {
    const rules = extractValidationRules({ pattern: "^[A-Z]" });
    expect(rules).toContainEqual({
      name: "pattern",
      params: { pattern: "^[A-Z]", message: "Must match pattern" },
    });
  });

  it("should extract numericRange for min+max", () => {
    const rules = extractValidationRules({ minimum: 0, maximum: 100 });
    expect(rules).toContainEqual({
      name: "numericRange",
      params: { min: 0, max: 100 },
    });
  });

  it("should extract numericRange for min only", () => {
    const rules = extractValidationRules({ minimum: 0 });
    expect(rules).toContainEqual({
      name: "numericRange",
      params: { min: 0, max: Infinity },
    });
  });

  it("should extract numericRange for max only", () => {
    const rules = extractValidationRules({ maximum: 100 });
    expect(rules).toContainEqual({
      name: "numericRange",
      params: { min: -Infinity, max: 100 },
    });
  });

  it("should extract exclusiveNumericRange", () => {
    const rules = extractValidationRules({
      exclusiveMinimum: 0,
      exclusiveMaximum: 100,
    });
    expect(rules).toContainEqual({
      name: "exclusiveNumericRange",
      params: {
        exclusiveMin: 0,
        exclusiveMax: 100,
        min: undefined,
        max: undefined,
      },
    });
  });

  it("should extract multipleOf", () => {
    const rules = extractValidationRules({ multipleOf: 5 });
    expect(rules).toContainEqual({
      name: "multipleOf",
      params: { factor: 5 },
    });
  });

  it("should extract email format", () => {
    const rules = extractValidationRules({ format: "email" });
    expect(rules).toContainEqual({ name: "email" });
  });

  it("should extract url format", () => {
    const rules = extractValidationRules({ format: "uri" });
    expect(rules).toContainEqual({ name: "url" });
  });

  it("should extract uniqueItems", () => {
    const rules = extractValidationRules({ uniqueItems: true });
    expect(rules).toContainEqual({ name: "uniqueInArray" });
  });

  it("should return empty array for no constraints", () => {
    const rules = extractValidationRules({ type: "string" });
    expect(rules).toEqual([]);
  });
});

describe("applyUiSchema", () => {
  const baseConfig = {
    type: "Textbox",
    label: "Name",
  };

  it("should map ui:widget to component type", () => {
    const result = applyUiSchema(baseConfig, { "ui:widget": "textarea" });
    expect(result.type).toBe("Textarea");
  });

  it("should apply password widget config", () => {
    const result = applyUiSchema(baseConfig, { "ui:widget": "password" });
    expect(result.type).toBe("Textbox");
    expect(result.config?.type).toBe("password");
  });

  it("should apply radio widget config", () => {
    const result = applyUiSchema(
      { type: "Dropdown", label: "Choice" },
      { "ui:widget": "radio" }
    );
    expect(result.type).toBe("Dropdown");
    expect(result.config?.display).toBe("radio");
  });

  it("should override label with ui:title", () => {
    const result = applyUiSchema(baseConfig, {
      "ui:title": "Your Name",
    });
    expect(result.label).toBe("Your Name");
  });

  it("should set description from ui:description", () => {
    const result = applyUiSchema(baseConfig, {
      "ui:description": "Enter full name",
    });
    expect(result.description).toBe("Enter full name");
  });

  it("should set helpText from ui:help", () => {
    const result = applyUiSchema(baseConfig, {
      "ui:help": "First and last name",
    });
    expect(result.helpText).toBe("First and last name");
  });

  it("should set placeholder from ui:placeholder", () => {
    const result = applyUiSchema(baseConfig, {
      "ui:placeholder": "John Doe",
    });
    expect(result.placeholder).toBe("John Doe");
  });

  it("should set hidden from ui:hidden", () => {
    const result = applyUiSchema(baseConfig, { "ui:hidden": true });
    expect(result.hidden).toBe(true);
  });

  it("should set readOnly from ui:readonly", () => {
    const result = applyUiSchema(baseConfig, { "ui:readonly": true });
    expect(result.readOnly).toBe(true);
  });

  it("should set disabled from ui:disabled", () => {
    const result = applyUiSchema(baseConfig, { "ui:disabled": true });
    expect(result.disabled).toBe(true);
  });

  it("should set autofocus in config", () => {
    const result = applyUiSchema(baseConfig, { "ui:autofocus": true });
    expect(result.config?.autofocus).toBe(true);
  });

  it("should set className in config", () => {
    const result = applyUiSchema(baseConfig, {
      "ui:classNames": "my-field",
    });
    expect(result.config?.className).toBe("my-field");
  });

  it("should merge ui:options into config", () => {
    const result = applyUiSchema(baseConfig, {
      "ui:options": { rows: 5, inline: true },
    });
    expect(result.config?.rows).toBe(5);
    expect(result.config?.inline).toBe(true);
  });

  it("should set hideLabel for ui:label false", () => {
    const result = applyUiSchema(baseConfig, { "ui:label": false });
    expect(result.config?.hideLabel).toBe(true);
  });

  it("should mark disabled options from ui:enumDisabled", () => {
    const config = {
      type: "Dropdown",
      label: "Color",
      options: [
        { value: "r", label: "Red" },
        { value: "g", label: "Green" },
        { value: "b", label: "Blue" },
      ],
    };
    const result = applyUiSchema(config, { "ui:enumDisabled": ["g"] });
    expect(result.options![1].disabled).toBe(true);
    expect(result.options![0].disabled).toBeUndefined();
  });

  it("should override option labels from ui:enumNames", () => {
    const config = {
      type: "Dropdown",
      label: "Color",
      options: [
        { value: "r", label: "r" },
        { value: "g", label: "g" },
      ],
    };
    const result = applyUiSchema(config, {
      "ui:enumNames": ["Red", "Green"],
    });
    expect(result.options![0].label).toBe("Red");
    expect(result.options![1].label).toBe("Green");
  });

  it("should not mutate the original config", () => {
    const original = { ...baseConfig };
    applyUiSchema(baseConfig, { "ui:hidden": true });
    expect("hidden" in original).toBe(false);
  });
});
