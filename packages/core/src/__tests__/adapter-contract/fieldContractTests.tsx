/**
 * Shared adapter contract test suite.
 *
 * Generates a set of vitest tests that validate a field registry
 * conforms to the adapter contract. Each adapter package should
 * import this function and call it with their registry factory.
 */
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { ComponentTypes, Dictionary } from "../../index";

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

interface IContractTestOptions {
  /** Field types to exclude from registry presence check */
  excludeTypes?: string[];
  /** If set, only test these types instead of ALL_FIELD_TYPES */
  onlyTypes?: string[];
  /** Description prefix for the test suite */
  suiteName: string;
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
  const { excludeTypes = [], suiteName, onlyTypes } = options;

  describe(`${suiteName} adapter contract`, () => {
    let registry: Dictionary<React.JSX.Element>;

    beforeEach(() => {
      registry = registryFactory();
    });

    const typesToTest = onlyTypes ?? ALL_FIELD_TYPES.filter(t => !excludeTypes.includes(t));

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
          if (!element) return; // skip if not in registry (covered by coverage tests)
          const { container } = render(React.cloneElement(element, minimalProps));
          expect(container).toBeTruthy();
        });

        it(`"${type}" renders in readOnly mode`, () => {
          const element = registry[type];
          if (!element) return;
          const { container } = render(
            React.cloneElement(element, { ...minimalProps, readOnly: true, value: "Test" })
          );
          expect(container).toBeTruthy();
        });
      }
    });
  });
}
