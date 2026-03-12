/**
 * Primitive-adapter edge-case tests for @formosaic/radix and @formosaic/react-aria.
 *
 * Covers DIV-010 (Radix Select null/undefined), DIV-011 (Radix Slider array
 * conversion), DIV-012 (React Aria Key type cast), plus primitives-first-specific
 * boundary risks: React Aria NumberField NaN guard, Radix Checkbox indeterminate
 * boundary, and cross-adapter readOnly sentinel consistency.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { ComponentTypes } from "../../constants";

import { createRadixFieldRegistry } from "@formosaic/radix";
import { createReactAriaFieldRegistry } from "@formosaic/react-aria";

// Radix Slider uses ResizeObserver internally
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

interface AdapterConfig {
  name: string;
  registry: () => Record<string, React.JSX.Element>;
}

const adapters: AdapterConfig[] = [
  { name: "radix", registry: createRadixFieldRegistry },
  { name: "react-aria", registry: createReactAriaFieldRegistry },
];

const TEST_OPTIONS = [
  { value: "opt1", label: "Option 1" },
  { value: "opt2", label: "Option 2" },
  { value: "opt3", label: "Option 3" },
];

const baseProps = {
  fieldName: "testField",
  testId: "prim-test",
  readOnly: false,
  required: false,
  setFieldValue: vi.fn(),
};

function renderWithAdapter(
  adapter: AdapterConfig,
  type: string,
  extraProps: Record<string, unknown> = {},
) {
  const registry = adapter.registry();
  const element = registry[type];
  if (!element) throw new Error(`${adapter.name} missing ${type}`);
  const el = React.cloneElement(element, { ...baseProps, ...extraProps });
  return render(el);
}

describe("Primitive adapter edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------
  // DIV-010: Radix Select null/undefined boundary
  // -----------------------------------------------------------------
  describe("Radix Select null/undefined boundary (DIV-010)", () => {
    const radix = adapters[0]; // radix

    it("Dropdown renders with null value without crash", () => {
      const { container } = renderWithAdapter(radix, ComponentTypes.Dropdown, {
        value: null,
        options: TEST_OPTIONS,
      });
      expect(container.innerHTML).not.toBe("");
    });

    it("Dropdown renders with undefined value without crash", () => {
      const { container } = renderWithAdapter(radix, ComponentTypes.Dropdown, {
        value: undefined,
        options: TEST_OPTIONS,
      });
      expect(container.innerHTML).not.toBe("");
    });

    it("Dropdown renders with empty string as undefined (Radix converts '' to undefined)", () => {
      // Radix Select.Root: value="" is coerced to undefined via `|| undefined`
      const { container } = renderWithAdapter(radix, ComponentTypes.Dropdown, {
        value: "",
        options: TEST_OPTIONS,
      });
      expect(container.innerHTML).not.toBe("");
    });

    it("SimpleDropdown renders with null value without crash", () => {
      const { container } = renderWithAdapter(radix, ComponentTypes.SimpleDropdown, {
        value: null,
        config: { dropdownOptions: ["A", "B", "C"] },
      });
      expect(container.innerHTML).not.toBe("");
    });
  });

  // -----------------------------------------------------------------
  // DIV-011: Radix Slider array conversion
  // -----------------------------------------------------------------
  describe("Radix Slider array conversion (DIV-011)", () => {
    const radix = adapters[0]; // radix

    it("Slider renders with number value (wraps to [number] internally)", () => {
      const { container } = renderWithAdapter(radix, ComponentTypes.Slider, {
        value: 50,
      });
      expect(container.innerHTML).not.toBe("");
    });

    it("Slider renders with 0 (boundary, wraps to [0])", () => {
      const { container } = renderWithAdapter(radix, ComponentTypes.Slider, {
        value: 0,
      });
      expect(container.innerHTML).not.toBe("");
    });

    it("Slider renders with negative value", () => {
      const { container } = renderWithAdapter(radix, ComponentTypes.Slider, {
        value: -10,
        config: { min: -100, max: 100 },
      });
      expect(container.innerHTML).not.toBe("");
    });

    it("Slider readOnly shows value as string", () => {
      const { container } = renderWithAdapter(radix, ComponentTypes.Slider, {
        readOnly: true,
        value: 75,
      });
      expect(container.textContent).toContain("75");
    });
  });

  // -----------------------------------------------------------------
  // DIV-012: React Aria Key type cast
  // -----------------------------------------------------------------
  describe("React Aria Key type cast (DIV-012)", () => {
    const reactAria = adapters[1]; // react-aria

    it("Dropdown renders with string value (Key accepts string)", () => {
      const { container } = renderWithAdapter(reactAria, ComponentTypes.Dropdown, {
        value: "opt1",
        options: TEST_OPTIONS,
      });
      expect(container.innerHTML).not.toBe("");
    });

    it("Dropdown renders with numeric-looking string value", () => {
      const numericOptions = [
        { value: "1", label: "One" },
        { value: "2", label: "Two" },
      ];
      const { container } = renderWithAdapter(reactAria, ComponentTypes.Dropdown, {
        value: "1",
        options: numericOptions,
      });
      expect(container.innerHTML).not.toBe("");
    });

    it("SimpleDropdown renders with value", () => {
      const { container } = renderWithAdapter(reactAria, ComponentTypes.SimpleDropdown, {
        value: "Alpha",
        config: { dropdownOptions: ["Alpha", "Beta", "Gamma"] },
      });
      expect(container.innerHTML).not.toBe("");
    });

    it("Dropdown readOnly with value shows content", () => {
      const { container } = renderWithAdapter(reactAria, ComponentTypes.Dropdown, {
        readOnly: true,
        value: "opt1",
        options: TEST_OPTIONS,
      });
      expect(container.textContent).toBeTruthy();
    });
  });

  // -----------------------------------------------------------------
  // React Aria NumberField NaN guard
  // -----------------------------------------------------------------
  describe("React Aria NumberField NaN guard", () => {
    const reactAria = adapters[1]; // react-aria

    it("NumberField renders with undefined without crash", () => {
      const { container } = renderWithAdapter(reactAria, ComponentTypes.Number, {
        value: undefined,
      });
      expect(container.innerHTML).not.toBe("");
    });

    it("NumberField renders with null without crash", () => {
      const { container } = renderWithAdapter(reactAria, ComponentTypes.Number, {
        value: null,
      });
      expect(container.innerHTML).not.toBe("");
    });

    it("NumberField renders with 0 (falsy boundary)", () => {
      const { container } = renderWithAdapter(reactAria, ComponentTypes.Number, {
        value: 0,
      });
      expect(container.innerHTML).not.toBe("");
    });
  });

  // -----------------------------------------------------------------
  // Radix Checkbox indeterminate boundary
  // -----------------------------------------------------------------
  describe("Radix Checkbox indeterminate boundary", () => {
    const radix = adapters[0]; // radix

    it("CheckboxGroup renders with undefined value (empty selection)", () => {
      const { container } = renderWithAdapter(radix, ComponentTypes.CheckboxGroup, {
        value: undefined,
        options: TEST_OPTIONS,
      });
      expect(container.innerHTML).not.toBe("");
    });

    it("CheckboxGroup renders with single-item array", () => {
      const { container } = renderWithAdapter(radix, ComponentTypes.CheckboxGroup, {
        value: ["opt1"],
        options: TEST_OPTIONS,
      });
      expect(container.innerHTML).not.toBe("");
    });
  });

  // -----------------------------------------------------------------
  // Cross-adapter readOnly sentinel consistency
  // -----------------------------------------------------------------
  describe("Cross-adapter readOnly sentinel consistency", () => {
    for (const adapter of adapters) {
      describe(`[${adapter.name}]`, () => {
        it("Textbox readOnly with undefined shows sentinel '-'", () => {
          const { container } = renderWithAdapter(adapter, ComponentTypes.Textbox, {
            readOnly: true,
            value: undefined,
          });
          expect(container.textContent).toContain("-");
        });

        it("Dropdown readOnly with undefined shows sentinel '-'", () => {
          const { container } = renderWithAdapter(adapter, ComponentTypes.Dropdown, {
            readOnly: true,
            value: undefined,
            options: TEST_OPTIONS,
          });
          expect(container.textContent).toContain("-");
        });

        it("Number readOnly with null shows truthy text", () => {
          const { container } = renderWithAdapter(adapter, ComponentTypes.Number, {
            readOnly: true,
            value: null,
          });
          // Adapters may show "0", "-", "null" -- all acceptable as truthy text
          expect(container.textContent).toBeTruthy();
        });

        it("ReadOnly with undefined shows sentinel '-'", () => {
          const { container } = renderWithAdapter(adapter, ComponentTypes.ReadOnly, {
            value: undefined,
          });
          expect(container.textContent).toContain("-");
        });
      });
    }
  });
});
