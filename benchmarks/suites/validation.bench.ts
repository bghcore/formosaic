import { describe, bench } from "vitest";
import {
  runValidations,
  runSyncValidations,
  type IValidationContext,
} from "../../packages/core/src/helpers/ValidationRegistry";
import type { IValidationRule } from "../../packages/core/src/types/IValidationRule";
import { generateFormConfig, generateEntityData } from "../generators/generateFormConfig";

// --- Individual validator benchmarks ---

describe("runSyncValidations - individual validators", () => {
  const baseContext: IValidationContext = {
    fieldName: "testField",
    values: { testField: "hello@example.com", otherField: "active" },
  };

  const validators: Array<{ label: string; value: unknown; rules: IValidationRule[] }> = [
    { label: "required (valid)", value: "hello", rules: [{ name: "required" }] },
    { label: "required (invalid)", value: "", rules: [{ name: "required" }] },
    { label: "email (valid)", value: "test@example.com", rules: [{ name: "email" }] },
    { label: "email (invalid)", value: "not-email", rules: [{ name: "email" }] },
    { label: "phone (valid)", value: "+1-555-123-4567", rules: [{ name: "phone" }] },
    { label: "url (valid)", value: "https://example.com", rules: [{ name: "url" }] },
    { label: "year (valid)", value: "2025", rules: [{ name: "year" }] },
    { label: "noSpecialCharacters (valid)", value: "hello world", rules: [{ name: "noSpecialCharacters" }] },
    { label: "currency (valid)", value: "19.99", rules: [{ name: "currency" }] },
    { label: "minLength (valid)", value: "hello", rules: [{ name: "minLength", params: { min: 3 } }] },
    { label: "maxLength (valid)", value: "hello", rules: [{ name: "maxLength", params: { max: 100 } }] },
    { label: "numericRange (valid)", value: 50, rules: [{ name: "numericRange", params: { min: 0, max: 100 } }] },
    { label: "pattern (valid)", value: "abc", rules: [{ name: "pattern", params: { pattern: "^[a-z]+$", message: "fail" } }] },
    {
      label: "requiredIf (triggered)",
      value: "",
      rules: [{ name: "requiredIf", params: { field: "otherField", values: ["active"] } }],
    },
  ];

  for (const { label, value, rules } of validators) {
    bench(label, () => {
      runSyncValidations(value, rules, baseContext);
    });
  }
});

// --- Multiple validators per field ---

describe("runSyncValidations - multiple rules per field", () => {
  const context: IValidationContext = {
    fieldName: "email",
    values: { email: "test@example.com" },
  };

  const ruleSets: Array<{ label: string; rules: IValidationRule[] }> = [
    {
      label: "1 rule",
      rules: [{ name: "required" }],
    },
    {
      label: "3 rules",
      rules: [
        { name: "required" },
        { name: "email" },
        { name: "maxLength", params: { max: 255 } },
      ],
    },
    {
      label: "5 rules",
      rules: [
        { name: "required" },
        { name: "email" },
        { name: "minLength", params: { min: 5 } },
        { name: "maxLength", params: { max: 255 } },
        { name: "pattern", params: { pattern: "^[^\\s]+$", message: "No spaces" } },
      ],
    },
  ];

  for (const { label, rules } of ruleSets) {
    bench(label, () => {
      runSyncValidations("test@example.com", rules, context);
    });
  }
});

// --- Conditional validation ---

describe("runSyncValidations - conditional (when clause)", () => {
  const context: IValidationContext = {
    fieldName: "address",
    values: { address: "", country: "US", type: "business" },
  };

  bench("condition met (validates)", () => {
    runSyncValidations("", [
      {
        name: "required",
        when: { field: "country", operator: "equals", value: "US" },
      },
    ], context);
  });

  bench("condition not met (skips)", () => {
    runSyncValidations("", [
      {
        name: "required",
        when: { field: "country", operator: "equals", value: "CA" },
      },
    ], context);
  });

  bench("5 conditional rules (mixed met/not met)", () => {
    runSyncValidations("test", [
      { name: "required", when: { field: "country", operator: "equals", value: "US" } },
      { name: "minLength", params: { min: 3 }, when: { field: "type", operator: "equals", value: "business" } },
      { name: "maxLength", params: { max: 100 }, when: { field: "country", operator: "equals", value: "CA" } },
      { name: "email", when: { field: "type", operator: "equals", value: "personal" } },
      { name: "noSpecialCharacters", when: { field: "country", operator: "isNotEmpty" } },
    ], context);
  });
});

// --- Bulk field validation (simulated form-wide validation pass) ---

describe("runSyncValidations - form-wide validation", () => {
  const fieldCounts = [10, 50, 100];

  for (const count of fieldCounts) {
    const config = generateFormConfig({ fieldCount: count, validationsPerField: 2 });
    const values = generateEntityData(count);

    bench(`${count} fields, 2 validators each`, () => {
      for (const [fieldName, fieldConfig] of Object.entries(config.fields)) {
        if (fieldConfig.validate) {
          const context: IValidationContext = { fieldName, values };
          runSyncValidations(values[fieldName], fieldConfig.validate, context);
        }
      }
    });
  }
});

// --- Async validation (runValidations) ---

describe("runValidations (async) - basic", () => {
  const context: IValidationContext = {
    fieldName: "email",
    values: { email: "test@example.com" },
  };

  bench("1 sync rule via async path", async () => {
    await runValidations("test@example.com", [{ name: "email" }], context);
  });

  bench("3 sync rules via async path", async () => {
    await runValidations("test@example.com", [
      { name: "required" },
      { name: "email" },
      { name: "maxLength", params: { max: 255 } },
    ], context);
  });
});
