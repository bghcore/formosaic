import type { IFieldConfig } from "../../packages/core/src/types/IFieldConfig";
import type { IFormConfig } from "../../packages/core/src/types/IFormConfig";

/**
 * Creates a linear dependency chain: field_0 -> field_1 -> field_2 -> ... -> field_N-1
 *
 * Each field depends on the previous field via a simple equals condition.
 * This is the worst case for incremental evaluation: changing field_0
 * triggers re-evaluation of every subsequent field.
 */
export function generateChainDependency(length: number): IFormConfig {
  const fields: Record<string, IFieldConfig> = {};
  const fieldOrder: string[] = [];

  for (let i = 0; i < length; i++) {
    const name = `field_${i}`;
    fieldOrder.push(name);

    const config: IFieldConfig = {
      type: "Textbox",
      label: `Chain Field ${i}`,
    };

    if (i > 0) {
      config.rules = [
        {
          id: `chain_rule_${i}`,
          when: {
            field: `field_${i - 1}`,
            operator: "isNotEmpty",
          },
          then: { required: true },
          else: { required: false },
        },
      ];
    }

    fields[name] = config;
  }

  return { version: 2, fields, fieldOrder };
}

/**
 * Creates a fan-out dependency pattern: field_0 is depended on by all other fields.
 *
 * Changing field_0 triggers re-evaluation of ALL other fields.
 * However, there are no transitive dependencies beyond that.
 */
export function generateFanOutDependency(size: number): IFormConfig {
  const fields: Record<string, IFieldConfig> = {};
  const fieldOrder: string[] = [];

  // Root field
  fields["field_0"] = {
    type: "Dropdown",
    label: "Root Field",
    options: [
      { value: "a", label: "Option A" },
      { value: "b", label: "Option B" },
      { value: "c", label: "Option C" },
    ],
  };
  fieldOrder.push("field_0");

  // All other fields depend on field_0
  for (let i = 1; i < size; i++) {
    const name = `field_${i}`;
    fieldOrder.push(name);

    fields[name] = {
      type: "Textbox",
      label: `Fan Field ${i}`,
      rules: [
        {
          id: `fan_rule_${i}`,
          when: {
            field: "field_0",
            operator: "equals",
            value: "a",
          },
          then: { hidden: false, required: true },
          else: { hidden: true, required: false },
        },
      ],
    };
  }

  return { version: 2, fields, fieldOrder };
}

/**
 * Creates a diamond dependency pattern:
 * field_0 -> field_1, field_2 -> field_3
 *
 * Useful for testing that shared dependencies are evaluated only once.
 * Scales by repeating the diamond pattern N times.
 */
export function generateDiamondDependency(diamondCount: number): IFormConfig {
  const fields: Record<string, IFieldConfig> = {};
  const fieldOrder: string[] = [];
  let idx = 0;

  for (let d = 0; d < diamondCount; d++) {
    const top = `field_${idx}`;
    const left = `field_${idx + 1}`;
    const right = `field_${idx + 2}`;
    const bottom = `field_${idx + 3}`;

    fieldOrder.push(top, left, right, bottom);

    fields[top] = {
      type: "Dropdown",
      label: `Diamond ${d} Top`,
      options: [{ value: "x", label: "X" }, { value: "y", label: "Y" }],
    };

    fields[left] = {
      type: "Textbox",
      label: `Diamond ${d} Left`,
      rules: [{
        id: `diamond_${d}_left`,
        when: { field: top, operator: "equals", value: "x" },
        then: { required: true },
      }],
    };

    fields[right] = {
      type: "Textbox",
      label: `Diamond ${d} Right`,
      rules: [{
        id: `diamond_${d}_right`,
        when: { field: top, operator: "equals", value: "y" },
        then: { hidden: true },
      }],
    };

    fields[bottom] = {
      type: "Textbox",
      label: `Diamond ${d} Bottom`,
      rules: [
        {
          id: `diamond_${d}_bottom_left`,
          when: { field: left, operator: "isNotEmpty" },
          then: { required: true },
          priority: 1,
        },
        {
          id: `diamond_${d}_bottom_right`,
          when: { field: right, operator: "isNotEmpty" },
          then: { readOnly: true },
          priority: 0,
        },
      ],
    };

    idx += 4;
  }

  return { version: 2, fields, fieldOrder };
}

/**
 * Generates entity data for chain/fan-out/diamond configs.
 */
export function generateDependencyValues(fieldCount: number): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < fieldCount; i++) {
    data[`field_${i}`] = `value_${i}`;
  }
  return data;
}
