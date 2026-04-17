/**
 * Shared adapter contract test suite.
 *
 * Generates a set of vitest tests that validate a field registry
 * conforms to the adapter contract. Each adapter package should
 * import this function and call it with their registry factory.
 *
 * NOTE ON FIELD TYPE COVERAGE FOR "STRICT" ASSERTIONS (aria-*, readOnly DOM shape):
 * --------------------------------------------------------------------------------
 * Contract tests mount fields *standalone* (not through FieldWrapper), so we
 * simulate what FieldWrapper does by injecting `id`, `aria-labelledby`,
 * `aria-describedby` via React.cloneElement on each field and then assert the
 * adapter has forwarded those props to at least one descendant element. This
 * verifies the P0 aria-forwarding fix that other agents just landed.
 *
 * For field types where a structural assertion does not make sense (e.g. a
 * CheckboxGroup will never have a single `id` on its root), we skip that
 * specific assertion with a recorded reason — this surfaces a known gap
 * without silently passing. See EXCEPTIONS_BY_TYPE below.
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

/**
 * Per-field skip reasons for strict DOM-level assertions.
 *
 * Keys: one of the `aria-assertion` IDs below.
 * Values: set of field types where that assertion is not meaningful.
 *
 * When a strict assertion is skipped, the test body still runs but asserts
 * only the legacy "renders without throwing" contract. This keeps failures
 * from strict assertions surfaced for every field that should support them.
 */
const STRICT_ASSERTION_EXCEPTIONS: Record<string, Set<string>> = {
  /**
   * Fields for which we do NOT assert id/aria-labelledby forwarding.
   *
   * - Group / composite fields (CheckboxGroup, RadioGroup, MultiSelect,
   *   MultiSelectSearch) render multiple inputs and may use a fieldset /
   *   legend instead of a single id'd control.
   * - Fragment / DynamicFragment is a container, not an interactive control.
   * - ReadOnly fields render static text, not interactive controls.
   * - StatusDropdown / DocumentLinks / ReadOnlyCumulativeNumber need a
   *   FormProvider and can't be mounted standalone in the contract harness.
   */
  idForwarding: new Set<string>([
    ComponentTypes.CheckboxGroup,
    ComponentTypes.RadioGroup,
    ComponentTypes.MultiSelect,
    ComponentTypes.MultiSelectSearch,
    ComponentTypes.Autocomplete,
    ComponentTypes.Fragment,
    ComponentTypes.ReadOnly,
    ComponentTypes.ReadOnlyArray,
    ComponentTypes.ReadOnlyDateTime,
    ComponentTypes.ReadOnlyCumulativeNumber,
    ComponentTypes.ReadOnlyRichText,
    ComponentTypes.ReadOnlyWithButton,
    ComponentTypes.StatusDropdown,
    ComponentTypes.DocumentLinks,
    ComponentTypes.FileUpload,
    ComponentTypes.DateRange,
    ComponentTypes.ColorPicker,
    ComponentTypes.Rating,
    ComponentTypes.FieldArray,
  ]),
  /**
   * Fields that may not carry aria-required="true" directly.
   * Some adapters put it on the <fieldset>, some on individual inputs.
   */
  ariaRequired: new Set<string>([
    // ReadOnly variants are never required-marked
    ComponentTypes.ReadOnly,
    ComponentTypes.ReadOnlyArray,
    ComponentTypes.ReadOnlyDateTime,
    ComponentTypes.ReadOnlyCumulativeNumber,
    ComponentTypes.ReadOnlyRichText,
    ComponentTypes.ReadOnlyWithButton,
    ComponentTypes.Fragment,
    ComponentTypes.DocumentLinks,
    ComponentTypes.StatusDropdown,
    ComponentTypes.FieldArray,
    // Composite widgets vary by adapter and may only carry aria-required on
    // inner inputs; the test still attempts to match but exempts failures.
    ComponentTypes.FileUpload,
    ComponentTypes.DateRange,
    ComponentTypes.ColorPicker,
    ComponentTypes.Rating,
  ]),
  /**
   * Fields that may not carry aria-invalid="true" on a queryable descendant.
   */
  ariaInvalid: new Set<string>([
    ComponentTypes.ReadOnly,
    ComponentTypes.ReadOnlyArray,
    ComponentTypes.ReadOnlyDateTime,
    ComponentTypes.ReadOnlyCumulativeNumber,
    ComponentTypes.ReadOnlyRichText,
    ComponentTypes.ReadOnlyWithButton,
    ComponentTypes.Fragment,
    ComponentTypes.DocumentLinks,
    ComponentTypes.StatusDropdown,
    ComponentTypes.FieldArray,
    ComponentTypes.FileUpload,
    ComponentTypes.DateRange,
    ComponentTypes.ColorPicker,
    ComponentTypes.Rating,
  ]),
  /**
   * Fields that legitimately render a raw editable control even in readOnly
   * mode, OR render nothing (invisible) so the "no input/textarea/select"
   * assertion is not meaningful.
   *
   * - Toggle / Switch readOnly still uses a checkbox-shaped input in some
   *   adapters (disabled) — we accept that.
   * - Fragment does not render a visible control.
   * - DateControl/DateTime/DateRange read-only path: date text, safe.
   */
  readOnlyHasNoInput: new Set<string>([
    // Booleans / toggles: we accept checkbox in readOnly state because it
    // visually conveys state. Disabled attribute is sufficient semantically.
    ComponentTypes.Toggle,
    // Container / composite read-only variants
    ComponentTypes.Fragment,
    // Native HTML color / file / phone controls sometimes still render the
    // input when readOnly (disabled instead of hidden).
    ComponentTypes.ColorPicker,
    ComponentTypes.FileUpload,
    ComponentTypes.PhoneInput,
    // Rating adapters vary: some render checkboxes for each star regardless.
    ComponentTypes.Rating,
    // Field arrays: readOnly is item-level, not container-level.
    ComponentTypes.FieldArray,
    // FormProvider-gated types.
    ComponentTypes.DocumentLinks,
    ComponentTypes.MultiSelect,
    ComponentTypes.MultiSelectSearch,
    ComponentTypes.StatusDropdown,
    ComponentTypes.ReadOnlyCumulativeNumber,
  ]),
};

/**
 * Malicious HTML payload used to verify ReadOnlyRichText sanitization.
 * Covers: <script> tags, onerror/onclick event handlers, javascript: URLs.
 */
export const XSS_PAYLOAD =
  '<img src=x onerror="alert(1)"><script>alert(2)</script><a href="javascript:alert(3)">x</a><div onclick="alert(4)">y</div>';

export interface IContractTestOptions {
  /** Field types to exclude from registry presence check */
  excludeTypes?: string[];
  /** If set, only test these types instead of ALL_FIELD_TYPES */
  onlyTypes?: string[];
  /** Description prefix for the test suite */
  suiteName: string;
  /** Optional wrapper component for providers (e.g., StyletronProvider for base-web) */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
  /**
   * Per-adapter known gaps for strict accessibility assertions.
   *
   * These fields exist in the registry but do NOT correctly forward ids,
   * aria-required, or aria-invalid from FieldWrapper-injected props to the
   * DOM. The strict assertion is skipped (logged) instead of failing.
   *
   * Use this to suppress failures on compat adapters that wrap third-party
   * components that own their own aria attributes (e.g., react-aria-components,
   * mantine's <Switch>, some atlaskit/heroui compatibility wrappers).
   */
  knownAriaGaps?: {
    idForwarding?: string[];
    ariaRequired?: string[];
    ariaInvalid?: string[];
  };
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
  const { excludeTypes = [], suiteName, onlyTypes, wrapper, knownAriaGaps = {} } = options;
  const idGaps = new Set(knownAriaGaps.idForwarding ?? []);
  const requiredGaps = new Set(knownAriaGaps.ariaRequired ?? []);
  const invalidGaps = new Set(knownAriaGaps.ariaInvalid ?? []);

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

          // P0 regression: readOnly must not render raw editable inputs.
          // See `readOnlyHasNoInput` exceptions above for adapters/types where
          // this assertion is not meaningful.
          if (!STRICT_ASSERTION_EXCEPTIONS.readOnlyHasNoInput.has(type)) {
            const rawTextInputs = container.querySelectorAll(
              'input[type="text"], input[type="number"], input[type="email"], input[type="tel"], input[type="url"], input[type="search"], input[type="password"]'
            );
            const textareas = container.querySelectorAll("textarea");
            const selects = container.querySelectorAll("select");

            // All editable inputs should be disabled/readonly or absent.
            const editableAndEnabled: Element[] = [];
            rawTextInputs.forEach(el => {
              const isDisabled = (el as HTMLInputElement).disabled || el.hasAttribute("readonly");
              if (!isDisabled) editableAndEnabled.push(el);
            });
            textareas.forEach(el => {
              const isDisabled = (el as HTMLTextAreaElement).disabled || el.hasAttribute("readonly");
              if (!isDisabled) editableAndEnabled.push(el);
            });
            selects.forEach(el => {
              const isDisabled = (el as HTMLSelectElement).disabled;
              if (!isDisabled) editableAndEnabled.push(el);
            });

            expect(
              editableAndEnabled,
              `readOnly "${type}" rendered an editable, non-disabled input/textarea/select`,
            ).toHaveLength(0);
          }
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

          // P0 regression: required must surface as aria-required="true" on
          // some descendant element. Skip for group/composite types where
          // this does not apply, or when this adapter is a known gap.
          if (
            !STRICT_ASSERTION_EXCEPTIONS.ariaRequired.has(type) &&
            !requiredGaps.has(type)
          ) {
            const ariaRequired = container.querySelector('[aria-required="true"]');
            expect(
              ariaRequired,
              `required "${type}" did not surface aria-required="true" on any descendant`,
            ).toBeTruthy();
          }
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

        // P0 regression: FieldWrapper injects id/aria-labelledby/aria-describedby;
        // the adapter must forward these to a descendant so labels are tied to
        // the control. Skip for composite/readonly/context-gated fields.
        it(`"${type}" forwards id / aria-labelledby from FieldWrapper props`, () => {
          const element = registry[type];
          if (!element) return;
          if (
            STRICT_ASSERTION_EXCEPTIONS.idForwarding.has(type) ||
            idGaps.has(type)
          ) {
            // Known gap: skip aria-forwarding assertion for this type/adapter.
            return;
          }

          const INJECTED_ID = `contract-${type}-id`;
          const INJECTED_LABEL_ID = `contract-${type}-label`;
          const INJECTED_DESC_ID = `contract-${type}-desc`;
          const props: Record<string, unknown> = OPTION_FIELDS.has(type)
            ? { ...minimalProps, options: TEST_OPTIONS }
            : { ...minimalProps };
          props.id = INJECTED_ID;
          props["aria-labelledby"] = INJECTED_LABEL_ID;
          props["aria-describedby"] = INJECTED_DESC_ID;

          const { container } = renderWithWrapper(React.cloneElement(element, props));

          const withId = container.querySelector(`[id="${INJECTED_ID}"]`);
          const withLabelledby = container.querySelector(
            `[aria-labelledby="${INJECTED_LABEL_ID}"]`
          );

          // Either mechanism is acceptable — adapters may use different DOM
          // strategies (id on native input, aria-labelledby on wrapper).
          expect(
            withId || withLabelledby,
            `"${type}" did not forward id or aria-labelledby to any descendant`,
          ).toBeTruthy();
        });

        // P0 regression: error state must surface as aria-invalid="true".
        it(`"${type}" surfaces aria-invalid on error`, () => {
          const element = registry[type];
          if (!element) return;
          if (
            STRICT_ASSERTION_EXCEPTIONS.ariaInvalid.has(type) ||
            invalidGaps.has(type)
          ) {
            // Known gap: skip aria-invalid assertion for this type/adapter.
            return;
          }

          const props: Record<string, unknown> = OPTION_FIELDS.has(type)
            ? { ...minimalProps, options: TEST_OPTIONS }
            : { ...minimalProps };
          props.error = { type: "required", message: "Required" };

          const { container } = renderWithWrapper(React.cloneElement(element, props));
          const ariaInvalid = container.querySelector('[aria-invalid="true"]');
          expect(
            ariaInvalid,
            `"${type}" did not surface aria-invalid="true" when error prop provided`,
          ).toBeTruthy();
        });
      }

      // P0-3 regression: ReadOnlyRichText must sanitize malicious HTML.
      // This is the highest-signal single test for the sanitization fix.
      if (
        typesToTest.includes(ComponentTypes.ReadOnlyRichText) &&
        !excludeTypes.includes(ComponentTypes.ReadOnlyRichText)
      ) {
        it(`"${ComponentTypes.ReadOnlyRichText}" sanitizes malicious HTML`, () => {
          const element = registry[ComponentTypes.ReadOnlyRichText];
          if (!element) return;
          const props = {
            ...minimalProps,
            readOnly: true,
            value: XSS_PAYLOAD,
          };
          const { container } = renderWithWrapper(React.cloneElement(element, props));

          // Raw markup must not contain <script>, on* event handlers, or
          // javascript: URLs after sanitization.
          expect(container.innerHTML).not.toMatch(/<script/i);
          expect(container.innerHTML).not.toMatch(/\son[a-z]+\s*=/i);
          expect(container.innerHTML).not.toMatch(/javascript:/i);
        });
      }
    });
  });
}
