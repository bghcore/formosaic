/**
 * Cross-adapter parity test harness.
 *
 * Given an IFormConfig and a set of adapter configs, generates vitest tests
 * that verify each adapter produces equivalent engine-level behavior:
 * initial render, readOnly mode, value hydration, required indicator,
 * and empty-display sentinel.
 */
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { ComponentTypes } from "../constants";
import type { Dictionary } from "../utils";
import type { IFormConfig } from "../types/IFormConfig";
import type { IOption } from "../types/IOption";

/** Tier 1 field types every adapter must implement */
export const PARITY_TIER_1_FIELDS = [
  ComponentTypes.Textbox,
  ComponentTypes.Number,
  ComponentTypes.Toggle,
  ComponentTypes.Dropdown,
  ComponentTypes.SimpleDropdown,
  ComponentTypes.MultiSelect,
  ComponentTypes.DateControl,
  ComponentTypes.Slider,
  ComponentTypes.RadioGroup,
  ComponentTypes.CheckboxGroup,
  ComponentTypes.Textarea,
  ComponentTypes.ReadOnly,
  ComponentTypes.Fragment,
] as const;

/** Default test values by field type */
const VALUE_BY_TYPE: Record<string, unknown> = {
  [ComponentTypes.Textbox]: "hello",
  [ComponentTypes.Number]: 42,
  [ComponentTypes.Toggle]: true,
  [ComponentTypes.Dropdown]: "opt1",
  [ComponentTypes.SimpleDropdown]: "opt1",
  [ComponentTypes.MultiSelect]: ["opt1"],
  [ComponentTypes.DateControl]: "2024-01-15",
  [ComponentTypes.Slider]: 50,
  [ComponentTypes.RadioGroup]: "opt1",
  [ComponentTypes.CheckboxGroup]: ["opt1"],
  [ComponentTypes.Textarea]: "some text",
  [ComponentTypes.ReadOnly]: "read only text",
  [ComponentTypes.Fragment]: "hidden",
};

/** Default test options for select-like fields */
const TEST_OPTIONS: IOption[] = [
  { value: "opt1", label: "Option 1" },
  { value: "opt2", label: "Option 2" },
];

/** Fields that use options */
const OPTION_FIELDS: Set<string> = new Set([
  ComponentTypes.Dropdown,
  ComponentTypes.SimpleDropdown,
  ComponentTypes.MultiSelect,
  ComponentTypes.RadioGroup,
  ComponentTypes.CheckboxGroup,
]);

/**
 * Display-only field types that do not render editable controls
 * and therefore have no required indicator behavior.
 */
const DISPLAY_ONLY_FIELDS: Set<string> = new Set([
  ComponentTypes.ReadOnly,
  ComponentTypes.Fragment,
]);

/**
 * Fields whose readOnly rendering with null/undefined does NOT show "-" sentinel.
 * - Number/Slider coerce undefined to 0 via `?? 0`, so they show "0" not "-"
 * - DynamicFragment renders <input type="hidden"> with no visible text
 */
const NO_EMPTY_SENTINEL_FIELDS: Set<string> = new Set([
  ComponentTypes.Number,
  ComponentTypes.Slider,
  ComponentTypes.Fragment,
]);

/**
 * Fields that depend on react-hook-form's FormProvider context.
 * These cannot be rendered standalone with React.cloneElement alone
 * for certain adapters (fluent, mui).
 */
const CONTEXT_DEPENDENT_FIELDS: Set<string> = new Set([
  ComponentTypes.MultiSelect,
]);

export interface IParityAdapterConfig {
  /** Human-readable adapter name */
  name: string;
  /** Factory that creates the field registry */
  registry: () => Dictionary<React.JSX.Element>;
  /** Optional provider wrapper (e.g., ChakraProvider, MantineProvider) */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  /**
   * Field types to skip for this adapter because they require context
   * not available in standalone rendering (e.g., Multiselect needing FormProvider).
   */
  contextDependentFields?: string[];
  /**
   * Field types where the required indicator is not surfaced at the
   * component level (e.g., PopOutEditor shows * only in modal,
   * MUI CheckboxGroup needs FormLabel for Mui-required class).
   * These are documented parity gaps, not test infrastructure issues.
   */
  skipRequiredCheck?: string[];
}

export interface IParityTestOptions {
  /** Adapter configs to test */
  adapters: IParityAdapterConfig[];
  /** If set, only test these field types instead of all fields in the config */
  fieldTypes?: string[];
}

/**
 * Generates cross-adapter parity tests for a given form config.
 *
 * For each adapter in `options.adapters`, generates tests for every field
 * in `formConfig.fields` that verify initial render, readOnly mode,
 * value hydration, required indicator, and empty-display sentinel.
 */
export function runParityTests(
  formConfig: IFormConfig,
  testName: string,
  options: IParityTestOptions
): void {
  const { adapters, fieldTypes } = options;

  describe(`Parity: ${testName}`, () => {
    for (const adapter of adapters) {
      describe(`[${adapter.name}]`, () => {
        const renderWithWrapper = (element: React.ReactElement) => {
          return render(element, adapter.wrapper ? { wrapper: adapter.wrapper } : undefined);
        };

        const skipFields = new Set(adapter.contextDependentFields ?? []);
        const skipRequired = new Set(adapter.skipRequiredCheck ?? []);

        const fieldEntries = Object.entries(formConfig.fields).filter(
          ([, config]) =>
            (!fieldTypes || fieldTypes.includes(config.type)) &&
            !skipFields.has(config.type)
        );

        for (const [fieldKey, fieldConfig] of fieldEntries) {
          const fieldType = fieldConfig.type;

          describe(`${fieldKey} (${fieldType})`, () => {
            const getMinimalProps = () => ({
              fieldName: fieldKey,
              programName: "parityTest",
              entityType: "test",
              entityId: "parity-1",
              value: undefined as unknown,
              readOnly: false,
              required: false,
              label: fieldConfig.label,
              setFieldValue: vi.fn(),
            });

            const getPropsWithOptions = (baseProps: ReturnType<typeof getMinimalProps>) => {
              if (OPTION_FIELDS.has(fieldType)) {
                const configOptions = fieldConfig.options;
                return {
                  ...baseProps,
                  options: configOptions && configOptions.length > 0 ? configOptions : TEST_OPTIONS,
                };
              }
              return baseProps;
            };

            it("renders initial state with non-empty content", () => {
              const registry = adapter.registry();
              const element = registry[fieldType];
              if (!element) return;

              const props = getPropsWithOptions(getMinimalProps());
              const { container } = renderWithWrapper(React.cloneElement(element, props));
              expect(container.innerHTML).not.toBe("");
            });

            it("renders readOnly mode without editable inputs", () => {
              const registry = adapter.registry();
              const element = registry[fieldType];
              if (!element) return;

              const value = VALUE_BY_TYPE[fieldType];
              const baseProps = { ...getMinimalProps(), readOnly: true, value };
              const props = getPropsWithOptions(baseProps);
              const { container } = renderWithWrapper(React.cloneElement(element, props));

              // In readOnly mode there should be no editable input, select, or textarea.
              // Exception: DynamicFragment may include hidden inputs.
              if (fieldType !== ComponentTypes.Fragment) {
                const editableInputs = container.querySelectorAll(
                  'input:not([type="hidden"]), select, textarea'
                );
                expect(editableInputs.length).toBe(0);
              }
            });

            it("renders with hydrated value", () => {
              const registry = adapter.registry();
              const element = registry[fieldType];
              if (!element) return;

              const value = VALUE_BY_TYPE[fieldType];
              const baseProps = { ...getMinimalProps(), value };
              const props = getPropsWithOptions(baseProps);
              const { container } = renderWithWrapper(React.cloneElement(element, props));
              expect(container.innerHTML).not.toBe("");
            });

            // Display-only fields (ReadOnly, DynamicFragment), fields configured
            // with readOnly: true, and adapter-specific skipRequiredCheck fields
            // do not render detectable required indicators.
            if (
              !DISPLAY_ONLY_FIELDS.has(fieldType) &&
              !fieldConfig.readOnly &&
              !skipRequired.has(fieldType)
            ) {
              it("renders required indicator", () => {
                const registry = adapter.registry();
                const element = registry[fieldType];
                if (!element) return;

                const baseProps = { ...getMinimalProps(), required: true };
                const props = getPropsWithOptions(baseProps);
                const { container } = renderWithWrapper(React.cloneElement(element, props));

                // Check for required indicators across adapter implementations.
                // Adapters express "required" in many ways:
                // 1. aria-required="true" on any element (input, wrapper div, etc.)
                // 2. native required attribute on any form element
                // 3. visual "*" indicator in text content
                // 4. CSS class or data attribute containing "required"
                // 5. "required" substring in rendered HTML attributes (catches
                //    MUI's Mui-required class, baseui's aria-required on wrappers, etc.)
                const html = container.innerHTML;
                const hasAriaRequired =
                  container.querySelector('[aria-required="true"]') !== null;
                const hasNativeRequired =
                  container.querySelector("[required]") !== null;
                const hasRequiredStar = container.textContent?.includes("*") ?? false;
                const hasRequiredClass =
                  container.querySelector("[class*=required]") !== null ||
                  container.querySelector("[class*=Required]") !== null ||
                  container.querySelector("[data-required]") !== null;
                const hasRequiredInHtml =
                  html.includes("aria-required") ||
                  html.includes("Mui-required") ||
                  html.includes("required-indicator") ||
                  html.includes("required");
                expect(
                  hasAriaRequired ||
                    hasNativeRequired ||
                    hasRequiredStar ||
                    hasRequiredClass ||
                    hasRequiredInHtml
                ).toBe(true);
              });
            }

            // Number/Slider coerce null → 0 (no "-" sentinel).
            // DynamicFragment renders hidden input only (no visible text).
            if (!NO_EMPTY_SENTINEL_FIELDS.has(fieldType)) {
              it("renders empty sentinel in readOnly with null value", () => {
                const registry = adapter.registry();
                const element = registry[fieldType];
                if (!element) return;

                const baseProps = { ...getMinimalProps(), readOnly: true, value: undefined };
                const props = getPropsWithOptions(baseProps);
                const { container } = renderWithWrapper(React.cloneElement(element, props));

                // Standard empty sentinel is "-" dash (ASCII hyphen, en-dash, or em-dash)
                const text = container.textContent ?? "";
                expect(
                  text.includes("-") || text.includes("\u2013") || text.includes("\u2014")
                ).toBe(true);
              });
            }
          });
        }
      });
    }
  });
}
