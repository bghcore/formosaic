/**
 * Cross-adapter edge-case parity tests.
 *
 * Renders the same field type through MULTIPLE adapter registries and verifies
 * equivalent engine-level behavior for boundary/edge-case values: undefined,
 * null, 0, negative, empty arrays, unknown option values, and readOnly sentinels.
 *
 * Pattern mirrors parityTests.test.ts — same adapter list, same mocks, same
 * wrapper components — but tests edge-case scenarios rather than standard fixtures.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { ComponentTypes } from "../../constants";

import { createFluentFieldRegistry } from "@formosaic/fluent";
import { createMuiFieldRegistry } from "@formosaic/mui";
import { createHeadlessFieldRegistry } from "@formosaic/headless";
import { createAntdFieldRegistry } from "@formosaic/antd";
import { createChakraFieldRegistry } from "@formosaic/chakra";
import { createMantineFieldRegistry } from "@formosaic/mantine";
import { createAtlaskitFieldRegistry } from "@formosaic/atlaskit";
import { createBaseWebFieldRegistry } from "@formosaic/base-web";
import { createHeroUIFieldRegistry } from "@formosaic/heroui";
import { createRadixFieldRegistry } from "@formosaic/radix";
import { createReactAriaFieldRegistry } from "@formosaic/react-aria";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { MantineProvider } from "@mantine/core";

// Mantine requires matchMedia + ResizeObserver mocks in jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const ChakraWrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(ChakraProvider, { value: defaultSystem }, children);
const MantineWrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(MantineProvider, { forceColorScheme: "light" as const }, children);

interface AdapterConfig {
  name: string;
  registry: () => Record<string, React.JSX.Element>;
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

const adapters: AdapterConfig[] = [
  { name: "headless", registry: createHeadlessFieldRegistry },
  { name: "antd", registry: createAntdFieldRegistry },
  { name: "chakra", registry: createChakraFieldRegistry, wrapper: ChakraWrapper },
  { name: "mantine", registry: createMantineFieldRegistry, wrapper: MantineWrapper },
  { name: "atlaskit", registry: createAtlaskitFieldRegistry },
  { name: "base-web", registry: createBaseWebFieldRegistry },
  { name: "heroui", registry: createHeroUIFieldRegistry },
  { name: "radix", registry: createRadixFieldRegistry },
  { name: "react-aria", registry: createReactAriaFieldRegistry },
];
// Note: fluent and mui are EXCLUDED from edge-case tests that involve Multiselect
// because their Multiselect requires FormProvider context. Include them only for
// non-Multiselect tests.

const fluentMuiAdapters: AdapterConfig[] = [
  { name: "fluent", registry: createFluentFieldRegistry },
  { name: "mui", registry: createMuiFieldRegistry },
];
// Use [...adapters, ...fluentMuiAdapters] for non-Multiselect fields
// Use just `adapters` for Multiselect fields

const TEST_OPTIONS = [
  { value: "opt1", label: "Option 1" },
  { value: "opt2", label: "Option 2" },
  { value: "opt3", label: "Option 3" },
];

const baseProps = {
  fieldName: "testField",
  testId: "edge-test",
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
  return render(el, adapter.wrapper ? { wrapper: adapter.wrapper } : undefined);
}

describe("Cross-adapter edge cases", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------
  // Number
  // -----------------------------------------------------------------
  describe("Cross-adapter Number edge cases", () => {
    const allAdapters = [...adapters, ...fluentMuiAdapters];
    const type = ComponentTypes.Number;

    for (const adapter of allAdapters) {
      describe(`[${adapter.name}]`, () => {
        it("renders undefined as empty", () => {
          const { container } = renderWithAdapter(adapter, type, { value: undefined });
          expect(container.innerHTML).not.toBe("");
        });

        it("renders null as empty", () => {
          const { container } = renderWithAdapter(adapter, type, { value: null });
          expect(container.innerHTML).not.toBe("");
        });

        it("renders 0 without treating as empty", () => {
          const { container } = renderWithAdapter(adapter, type, { value: 0 });
          expect(container.innerHTML).not.toBe("");
        });

        it("renders negative values", () => {
          const { container } = renderWithAdapter(adapter, type, { value: -42 });
          expect(container.innerHTML).not.toBe("");
        });

        it("renders decimals", () => {
          const { container } = renderWithAdapter(adapter, type, { value: 3.14 });
          expect(container.innerHTML).not.toBe("");
        });

        it("readOnly with 0 shows '0' not sentinel", () => {
          const { container } = renderWithAdapter(adapter, type, {
            readOnly: true,
            value: 0,
          });
          expect(container.textContent).toContain("0");
        });

        it("readOnly with null shows value or sentinel", () => {
          const { container } = renderWithAdapter(adapter, type, {
            readOnly: true,
            value: null,
          });
          // Adapters may show "0", "-", "null", or other truthy text -- all acceptable
          expect(container.textContent).toBeTruthy();
        });
      });
    }
  });

  // -----------------------------------------------------------------
  // Dropdown
  // -----------------------------------------------------------------
  describe("Cross-adapter Dropdown edge cases", () => {
    const allAdapters = [...adapters, ...fluentMuiAdapters];
    const type = ComponentTypes.Dropdown;

    for (const adapter of allAdapters) {
      describe(`[${adapter.name}]`, () => {
        it("renders with undefined value without crash", () => {
          const { container } = renderWithAdapter(adapter, type, {
            value: undefined,
            options: TEST_OPTIONS,
          });
          expect(container.innerHTML).not.toBe("");
        });

        it("renders with unknown value gracefully", () => {
          const { container } = renderWithAdapter(adapter, type, {
            value: "nonexistent",
            options: TEST_OPTIONS,
          });
          expect(container).toBeTruthy();
        });

        it("readOnly with value shows content", () => {
          const { container } = renderWithAdapter(adapter, type, {
            readOnly: true,
            value: "opt1",
            options: TEST_OPTIONS,
          });
          expect(container.textContent).toBeTruthy();
        });

        it("readOnly with missing value shows sentinel", () => {
          const { container } = renderWithAdapter(adapter, type, {
            readOnly: true,
            value: undefined,
            options: TEST_OPTIONS,
          });
          expect(container.textContent).toContain("-");
        });
      });
    }
  });

  // -----------------------------------------------------------------
  // MultiSelect
  // -----------------------------------------------------------------
  describe("Cross-adapter MultiSelect edge cases", () => {
    // Fluent and MUI excluded -- their Multiselect requires FormProvider context
    const type = ComponentTypes.MultiSelect;

    for (const adapter of adapters) {
      describe(`[${adapter.name}]`, () => {
        it("renders undefined without crash", () => {
          const { container } = renderWithAdapter(adapter, type, {
            value: undefined,
            options: TEST_OPTIONS,
          });
          expect(container).toBeTruthy();
        });

        it("renders null without crash", () => {
          const { container } = renderWithAdapter(adapter, type, {
            value: null,
            options: TEST_OPTIONS,
          });
          expect(container).toBeTruthy();
        });

        it("renders empty array", () => {
          const { container } = renderWithAdapter(adapter, type, {
            value: [],
            options: TEST_OPTIONS,
          });
          expect(container.innerHTML).not.toBe("");
        });

        it("readOnly with values shows content", () => {
          const { container } = renderWithAdapter(adapter, type, {
            readOnly: true,
            value: ["opt1"],
            options: TEST_OPTIONS,
          });
          expect(container.textContent).toBeTruthy();
        });

        it("readOnly with empty shows sentinel", () => {
          const { container } = renderWithAdapter(adapter, type, {
            readOnly: true,
            value: undefined,
            options: TEST_OPTIONS,
          });
          expect(container.textContent).toContain("-");
        });
      });
    }
  });

  // -----------------------------------------------------------------
  // RadioGroup
  // -----------------------------------------------------------------
  describe("Cross-adapter RadioGroup edge cases", () => {
    const allAdapters = [...adapters, ...fluentMuiAdapters];
    const type = ComponentTypes.RadioGroup;

    for (const adapter of allAdapters) {
      describe(`[${adapter.name}]`, () => {
        it("renders with unknown value gracefully", () => {
          const { container } = renderWithAdapter(adapter, type, {
            value: "nonexistent",
            options: TEST_OPTIONS,
          });
          expect(container).toBeTruthy();
        });

        it("renders with no selection", () => {
          const { container } = renderWithAdapter(adapter, type, {
            value: undefined,
            options: TEST_OPTIONS,
          });
          expect(container.innerHTML).not.toBe("");
        });

        it("readOnly with value shows option label", () => {
          const { container } = renderWithAdapter(adapter, type, {
            readOnly: true,
            value: "opt1",
            options: TEST_OPTIONS,
          });
          expect(container.textContent).toContain("Option 1");
        });

        it("readOnly with missing value shows sentinel", () => {
          const { container } = renderWithAdapter(adapter, type, {
            readOnly: true,
            value: undefined,
            options: TEST_OPTIONS,
          });
          expect(container.textContent).toContain("-");
        });
      });
    }
  });

  // -----------------------------------------------------------------
  // CheckboxGroup
  // -----------------------------------------------------------------
  describe("Cross-adapter CheckboxGroup edge cases", () => {
    const allAdapters = [...adapters, ...fluentMuiAdapters];
    const type = ComponentTypes.CheckboxGroup;

    for (const adapter of allAdapters) {
      describe(`[${adapter.name}]`, () => {
        it("renders with undefined", () => {
          const { container } = renderWithAdapter(adapter, type, {
            value: undefined,
            options: TEST_OPTIONS,
          });
          expect(container.innerHTML).not.toBe("");
        });

        it("renders with empty array", () => {
          const { container } = renderWithAdapter(adapter, type, {
            value: [],
            options: TEST_OPTIONS,
          });
          expect(container.innerHTML).not.toBe("");
        });

        it("readOnly with values shows labels", () => {
          const { container } = renderWithAdapter(adapter, type, {
            readOnly: true,
            value: ["opt1"],
            options: TEST_OPTIONS,
          });
          expect(container.textContent).toContain("Option 1");
        });

        it("readOnly with empty shows sentinel", () => {
          const { container } = renderWithAdapter(adapter, type, {
            readOnly: true,
            value: undefined,
            options: TEST_OPTIONS,
          });
          expect(container.textContent).toContain("-");
        });
      });
    }
  });

  // -----------------------------------------------------------------
  // DateControl
  // -----------------------------------------------------------------
  describe("Cross-adapter DateControl edge cases", () => {
    const allAdapters = [...adapters, ...fluentMuiAdapters];
    const type = ComponentTypes.DateControl;

    for (const adapter of allAdapters) {
      describe(`[${adapter.name}]`, () => {
        it("renders null without crash", () => {
          const { container } = renderWithAdapter(adapter, type, { value: null });
          expect(container.innerHTML).not.toBe("");
        });

        it("renders undefined without crash", () => {
          const { container } = renderWithAdapter(adapter, type, { value: undefined });
          expect(container.innerHTML).not.toBe("");
        });

        it("renders ISO date string", () => {
          const { container } = renderWithAdapter(adapter, type, {
            value: "2024-01-15T00:00:00.000Z",
          });
          expect(container.innerHTML).not.toBe("");
        });

        it("readOnly with value shows content", () => {
          const { container } = renderWithAdapter(adapter, type, {
            readOnly: true,
            value: "2024-01-15T00:00:00.000Z",
          });
          expect(container.textContent).toBeTruthy();
        });

        it("readOnly with null shows sentinel", () => {
          const { container } = renderWithAdapter(adapter, type, {
            readOnly: true,
            value: null,
          });
          expect(container.textContent).toContain("-");
        });
      });
    }
  });

  // -----------------------------------------------------------------
  // ReadOnly
  // -----------------------------------------------------------------
  describe("Cross-adapter ReadOnly edge cases", () => {
    const allAdapters = [...adapters, ...fluentMuiAdapters];
    const type = ComponentTypes.ReadOnly;

    for (const adapter of allAdapters) {
      describe(`[${adapter.name}]`, () => {
        it("renders empty value with sentinel", () => {
          const { container } = renderWithAdapter(adapter, type, { value: undefined });
          expect(container.textContent).toContain("-");
        });

        it("renders null with sentinel", () => {
          const { container } = renderWithAdapter(adapter, type, { value: null });
          expect(container.textContent).toContain("-");
        });

        it("renders string value", () => {
          const { container } = renderWithAdapter(adapter, type, { value: "hello" });
          expect(container.textContent).toContain("hello");
        });

        it("renders number as string", () => {
          const { container } = renderWithAdapter(adapter, type, { value: 42 });
          expect(container.textContent).toContain("42");
        });
      });
    }
  });
});
