/**
 * Shared adapter contract test suite.
 *
 * Generates a set of vitest tests that validate a field registry
 * conforms to the adapter contract. Each adapter package should
 * import this function and call it with their registry factory.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { ComponentTypes } from "../constants";
import type { Dictionary } from "../utils";
import type { IOption } from "../types/IOption";

/** Tier 1 field types that every adapter should implement */
export const TIER_1_FIELDS = [
  ComponentTypes.Textbox,
  ComponentTypes.Number,
  ComponentTypes.Toggle,
  ComponentTypes.Dropdown,
  ComponentTypes.MultiSelect,
  ComponentTypes.DateControl,
  ComponentTypes.Slider,
  ComponentTypes.RadioGroup,
  ComponentTypes.CheckboxGroup,
  ComponentTypes.Textarea,
  ComponentTypes.ReadOnly,
  ComponentTypes.Fragment,
] as const;

/** All standard field types (Tier 1 + 2 + 3) */
export const ALL_FIELD_TYPES = Object.values(ComponentTypes);

/** Default test values by field type */
export const VALUE_BY_TYPE: Record<string, unknown> = {
  [ComponentTypes.Textbox]: "hello",
  [ComponentTypes.Number]: 42,
  [ComponentTypes.Toggle]: true,
  [ComponentTypes.Dropdown]: "opt1",
  [ComponentTypes.MultiSelect]: ["opt1"],
  [ComponentTypes.DateControl]: "2024-01-15",
  [ComponentTypes.Slider]: 50,
  [ComponentTypes.RadioGroup]: "opt1",
  [ComponentTypes.CheckboxGroup]: ["opt1"],
  [ComponentTypes.Textarea]: "some text",
  [ComponentTypes.ReadOnly]: "read only text",
  [ComponentTypes.Fragment]: "hidden",
  // Tier 2+ types
  [ComponentTypes.MultiSelectSearch]: ["opt1"],
  [ComponentTypes.ReadOnlyArray]: ["item1", "item2"],
  [ComponentTypes.ReadOnlyDateTime]: "2024-01-15T10:30:00Z",
  [ComponentTypes.ReadOnlyRichText]: "<p>rich text</p>",
  [ComponentTypes.ReadOnlyWithButton]: "value",
  [ComponentTypes.Rating]: 3,
  [ComponentTypes.ColorPicker]: "#ff0000",
  [ComponentTypes.Autocomplete]: "opt1",
  [ComponentTypes.FileUpload]: null,
  [ComponentTypes.DateRange]: { start: "2024-01-01", end: "2024-01-31" },
  [ComponentTypes.DateTime]: "2024-01-15T10:30:00Z",
  [ComponentTypes.PhoneInput]: "5551234567",
};

/** Default test options for select-like fields */
const TEST_OPTIONS: IOption[] = [
  { value: "opt1", label: "Option 1" },
  { value: "opt2", label: "Option 2" },
];

/** Fields that use options */
const OPTION_FIELDS: Set<string> = new Set([
  ComponentTypes.Dropdown,
  ComponentTypes.MultiSelect,
  ComponentTypes.MultiSelectSearch,
  ComponentTypes.RadioGroup,
  ComponentTypes.CheckboxGroup,
  ComponentTypes.Autocomplete,
]);

export interface IContractTestOptions {
  /** Field types to exclude from registry presence check */
  excludeTypes?: string[];
  /** If set, only test these types instead of ALL_FIELD_TYPES */
  onlyTypes?: string[];
  /** Description prefix for the test suite */
  suiteName: string;
  /** Optional wrapper component for providers (e.g., StyletronProvider for base-web) */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

/**
 * Runs the adapter contract test suite against a field registry.
 *
 * @param registryFactory - Function that creates the field registry
 * @param options - Test configuration
 */
export function runAdapterContractTests(
  registryFactory: () => Dictionary<React.JSX.Element>,
  options: IContractTestOptions
) {
  const { excludeTypes = [], suiteName, onlyTypes, wrapper } = options;

  describe(`${suiteName} adapter contract`, () => {
    let registry: Dictionary<React.JSX.Element>;

    beforeEach(() => {
      registry = registryFactory();
    });

    const typesToTest = onlyTypes ?? ALL_FIELD_TYPES.filter(t => !excludeTypes.includes(t));

    const renderWithWrapper = (element: React.ReactElement) => {
      return render(element, wrapper ? { wrapper } : undefined);
    };

    describe("registry coverage", () => {
      it("registry is a non-empty object", () => {
        expect(typeof registry).toBe("object");
        expect(Object.keys(registry).length).toBeGreaterThan(0);
      });

      for (const type of typesToTest) {
        it(`has entry for "${type}"`, () => {
          expect(registry[type]).toBeDefined();
          expect(React.isValidElement(registry[type])).toBe(true);
        });
      }
    });

    describe("field rendering", () => {
      const minimalProps = {
        fieldName: "testField",
        testId: "contract-test",
        value: undefined,
        readOnly: false,
        required: false,
        setFieldValue: vi.fn(),
      };

      for (const type of typesToTest) {
        it(`"${type}" renders without error with minimal props`, () => {
          const element = registry[type];
          if (!element) return;
          const props = OPTION_FIELDS.has(type)
            ? { ...minimalProps, options: TEST_OPTIONS }
            : minimalProps;
          const { container } = renderWithWrapper(React.cloneElement(element, props));
          expect(container).toBeTruthy();
        });

        it(`"${type}" renders in readOnly mode`, () => {
          const element = registry[type];
          if (!element) return;
          const readOnlyValue = VALUE_BY_TYPE[type] ?? "Test";
          const props = OPTION_FIELDS.has(type)
            ? { ...minimalProps, readOnly: true, value: readOnlyValue, options: TEST_OPTIONS }
            : { ...minimalProps, readOnly: true, value: readOnlyValue };
          const { container } = renderWithWrapper(
            React.cloneElement(element, props)
          );
          expect(container).toBeTruthy();
        });

        it(`"${type}" renders in disabled state`, () => {
          const element = registry[type];
          if (!element) return;
          const props = OPTION_FIELDS.has(type)
            ? { ...minimalProps, disabled: true, options: TEST_OPTIONS }
            : { ...minimalProps, disabled: true };
          const { container } = renderWithWrapper(React.cloneElement(element, props));
          expect(container).toBeTruthy();
        });

        it(`"${type}" renders in required state`, () => {
          const element = registry[type];
          if (!element) return;
          const props = OPTION_FIELDS.has(type)
            ? { ...minimalProps, required: true, options: TEST_OPTIONS }
            : { ...minimalProps, required: true };
          const { container } = renderWithWrapper(React.cloneElement(element, props));
          expect(container).toBeTruthy();
        });

        it(`"${type}" renders with a value`, () => {
          const element = registry[type];
          if (!element) return;
          const testValue = VALUE_BY_TYPE[type];
          const props = OPTION_FIELDS.has(type)
            ? { ...minimalProps, value: testValue, options: TEST_OPTIONS }
            : { ...minimalProps, value: testValue };
          const { container } = renderWithWrapper(React.cloneElement(element, props));
          expect(container).toBeTruthy();
        });

        it(`"${type}" renders safely with undefined value`, () => {
          const element = registry[type];
          if (!element) return;
          const props = OPTION_FIELDS.has(type)
            ? { ...minimalProps, value: undefined, options: TEST_OPTIONS }
            : { ...minimalProps, value: undefined };
          const { container } = renderWithWrapper(React.cloneElement(element, props));
          expect(container).toBeTruthy();
        });
      }
    });
  });
}
