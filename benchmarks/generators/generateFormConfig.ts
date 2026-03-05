import type { IFieldConfig } from "../../packages/core/src/types/IFieldConfig";
import type { IFormConfig } from "../../packages/core/src/types/IFormConfig";
import type { IRule } from "../../packages/core/src/types/IRule";
import type { ICondition } from "../../packages/core/src/types/ICondition";
import type { IOption } from "../../packages/core/src/types/IOption";
import type { IValidationRule } from "../../packages/core/src/types/IValidationRule";

export interface IFormConfigOptions {
  /** Number of fields to generate */
  fieldCount: number;
  /** Number of rules per field (0 = no rules) */
  rulesPerField?: number;
  /** Number of dropdown options per dropdown field */
  optionsPerDropdown?: number;
  /** Number of validation rules per field (0 = no validation) */
  validationsPerField?: number;
  /** Whether to include computed value fields */
  includeComputedValues?: boolean;
  /** Fraction of fields that are dropdowns (0-1) */
  dropdownFraction?: number;
}

const FIELD_TYPES = ["Textbox", "Dropdown", "Toggle", "DatePicker", "NumberInput", "Textarea"];

const OPERATORS = [
  "equals", "notEquals", "greaterThan", "lessThan",
  "contains", "startsWith", "isEmpty", "isNotEmpty",
] as const;

const VALIDATOR_NAMES = ["required", "email", "minLength", "maxLength", "pattern"];

/**
 * Generates a synthetic IFormConfig with N fields and configurable complexity.
 * Produces deterministic output for a given set of options.
 */
export function generateFormConfig(options: IFormConfigOptions): IFormConfig {
  const {
    fieldCount,
    rulesPerField = 0,
    optionsPerDropdown = 5,
    validationsPerField = 0,
    includeComputedValues = false,
    dropdownFraction = 0.2,
  } = options;

  const fields: Record<string, IFieldConfig> = {};
  const fieldOrder: string[] = [];

  for (let i = 0; i < fieldCount; i++) {
    const name = `field_${i}`;
    fieldOrder.push(name);

    const isDropdown = i / fieldCount < dropdownFraction;
    const type = isDropdown ? "Dropdown" : FIELD_TYPES[i % FIELD_TYPES.length];

    const config: IFieldConfig = {
      type,
      label: `Field ${i}`,
    };

    // Add dropdown options
    if (isDropdown) {
      config.options = generateOptions(optionsPerDropdown, i);
    }

    // Add rules (referencing prior fields so dependencies go forward)
    if (rulesPerField > 0 && i > 0) {
      config.rules = generateFieldRules(i, fieldCount, rulesPerField);
    }

    // Add validations
    if (validationsPerField > 0) {
      config.validate = generateValidationRules(validationsPerField);
    }

    // Add computed values for some fields
    if (includeComputedValues && i > 1 && i % 5 === 0) {
      const depA = `field_${i - 1}`;
      const depB = `field_${i - 2}`;
      config.computedValue = `$values.${depA} + $values.${depB}`;
    }

    fields[name] = config;
  }

  return {
    version: 2,
    fields,
    fieldOrder,
  };
}

function generateOptions(count: number, seed: number): IOption[] {
  const options: IOption[] = [];
  for (let j = 0; j < count; j++) {
    options.push({
      value: `opt_${seed}_${j}`,
      label: `Option ${seed}-${j}`,
    });
  }
  return options;
}

function generateFieldRules(
  fieldIndex: number,
  totalFields: number,
  rulesPerField: number
): IRule[] {
  const rules: IRule[] = [];
  for (let r = 0; r < rulesPerField; r++) {
    // Reference a field earlier in the order to avoid cycles
    const depIndex = (fieldIndex - 1 - r + totalFields) % fieldIndex;
    const depField = `field_${depIndex}`;

    const condition: ICondition = {
      field: depField,
      operator: OPERATORS[r % OPERATORS.length],
      value: r % 2 === 0 ? `value_${r}` : r,
    };

    rules.push({
      id: `rule_${fieldIndex}_${r}`,
      when: condition,
      then: {
        required: r % 2 === 0,
        hidden: r % 3 === 0,
      },
      priority: r,
    });
  }
  return rules;
}

function generateValidationRules(count: number): IValidationRule[] {
  const rules: IValidationRule[] = [];
  for (let v = 0; v < count; v++) {
    const name = VALIDATOR_NAMES[v % VALIDATOR_NAMES.length];
    const rule: IValidationRule = { name };
    if (name === "minLength") {
      rule.params = { min: 3 };
    } else if (name === "maxLength") {
      rule.params = { max: 100 };
    } else if (name === "pattern") {
      rule.params = { pattern: "^[a-z]+$", message: "Lowercase only" };
    }
    rules.push(rule);
  }
  return rules;
}

/**
 * Generates entity data (form values) matching a generated config.
 * Populates each field with a plausible value.
 */
export function generateEntityData(fieldCount: number): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < fieldCount; i++) {
    const name = `field_${i}`;
    // Alternate between string, number, and boolean values
    switch (i % 3) {
      case 0:
        data[name] = `value_${i}`;
        break;
      case 1:
        data[name] = i * 10;
        break;
      case 2:
        data[name] = i % 4 === 0;
        break;
    }
  }
  return data;
}
