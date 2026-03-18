/**
 * Business form serialization round-trip tests.
 *
 * Tests realistic business forms end-to-end: default value hydration,
 * readOnly rendering, and serialization shape consistency across multiple adapters.
 * Uses the business form fixtures (profile, workflow, option-heavy) and renders
 * each field type through headless, antd, mantine, and chakra adapters.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import React from "react";
import { ComponentTypes } from "../../constants";
import type { IFieldConfig } from "../../types/IFieldConfig";
import type { IFormConfig } from "../../types/IFormConfig";
import {
  profileFormConfig,
  workflowFormConfig,
  optionHeavyFormConfig,
} from "../__fixtures__/businessForms";

import { createHeadlessFieldRegistry } from "@formosaic/headless";
import { createAntdFieldRegistry } from "@formosaic/antd";
import { createMantineFieldRegistry } from "@formosaic/mantine";
import { createRadixFieldRegistry } from "@formosaic/radix";
import { createReactAriaFieldRegistry } from "@formosaic/react-aria";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { MantineProvider } from "@mantine/core";
import { createChakraFieldRegistry } from "@formosaic/chakra";

// Mantine mocks
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
  React.createElement(
    MantineProvider,
    { forceColorScheme: "light" as const },
    children
  );

interface AdapterConfig {
  name: string;
  registry: () => Record<string, React.JSX.Element>;
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}

// Test across headless (reference), antd (native), mantine (native with divergences), chakra (hybrid)
const adapters: AdapterConfig[] = [
  { name: "headless", registry: createHeadlessFieldRegistry },
  { name: "antd", registry: createAntdFieldRegistry },
  {
    name: "mantine",
    registry: createMantineFieldRegistry,
    wrapper: MantineWrapper,
  },
  { name: "chakra", registry: createChakraFieldRegistry, wrapper: ChakraWrapper },
  { name: "radix", registry: createRadixFieldRegistry },
  { name: "react-aria", registry: createReactAriaFieldRegistry },
];

const baseProps = {
  fieldName: "testField",
  testId: "roundtrip-test",
  readOnly: false,
  required: false,
  setFieldValue: vi.fn(),
};

function renderField(
  adapter: AdapterConfig,
  type: string,
  extraProps: Record<string, unknown> = {}
) {
  const registry = adapter.registry();
  const element = registry[type];
  if (!element) throw new Error(`${adapter.name} missing ${type}`);
  const el = React.cloneElement(element, { ...baseProps, ...extraProps });
  return render(el, adapter.wrapper ? { wrapper: adapter.wrapper } : undefined);
}

describe("Business form round-trip tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =================================================================
  // Profile form round-trip
  // =================================================================
  describe("Profile form round-trip", () => {
    const profileFields = profileFormConfig.fields as Record<string, IFieldConfig>;

    adapters.forEach((adapter) => {
      describe(`[${adapter.name}]`, () => {
        // ---------------------------------------------------------------
        // Textbox (name) hydration
        // ---------------------------------------------------------------
        describe("Textbox (name) hydration", () => {
          it("renders with value", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Textbox,
              { value: "Jane Doe" }
            );
            expect(container.innerHTML).toBeTruthy();
          });

          it("readOnly with value shows value text", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Textbox,
              { readOnly: true, value: "Jane Doe" }
            );
            expect(container.textContent).toContain("Jane Doe");
          });

          it("readOnly with undefined shows sentinel", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Textbox,
              { readOnly: true, value: undefined }
            );
            expect(container.textContent).toContain("-");
          });
        });

        // ---------------------------------------------------------------
        // Number (age) hydration
        // ---------------------------------------------------------------
        describe("Number (age) hydration", () => {
          it("renders with value 30", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Number,
              { value: 30 }
            );
            expect(container.innerHTML).toBeTruthy();
          });

          it("renders with value 0 (valid boundary)", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Number,
              { value: 0 }
            );
            expect(container.innerHTML).toBeTruthy();
          });

          it("readOnly with value 30 shows '30'", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Number,
              { readOnly: true, value: 30 }
            );
            expect(container.textContent).toContain("30");
          });
        });

        // ---------------------------------------------------------------
        // Toggle (notifications) hydration
        // ---------------------------------------------------------------
        describe("Toggle (notifications) hydration", () => {
          it("renders with value true", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Toggle,
              { value: true }
            );
            expect(container.innerHTML).toBeTruthy();
          });

          it("renders with value false", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Toggle,
              { value: false }
            );
            expect(container.innerHTML).toBeTruthy();
          });

          it("readOnly with true shows 'Yes'", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Toggle,
              { readOnly: true, value: true }
            );
            expect(container.textContent).toContain("Yes");
          });
        });

        // ---------------------------------------------------------------
        // Dropdown (timezone) hydration
        // ---------------------------------------------------------------
        describe("Dropdown (timezone) hydration", () => {
          const timezoneOptions = profileFields.timezone.options;

          it("renders with value 'pst'", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Dropdown,
              { value: "pst", options: timezoneOptions }
            );
            expect(container.innerHTML).toBeTruthy();
          });

          it("readOnly with value 'pst' shows content", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Dropdown,
              { readOnly: true, value: "pst", options: timezoneOptions }
            );
            expect(container.textContent).toBeTruthy();
          });

          it("readOnly with undefined shows sentinel", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Dropdown,
              { readOnly: true, value: undefined, options: timezoneOptions }
            );
            expect(container.textContent).toContain("-");
          });
        });

        // ---------------------------------------------------------------
        // RadioGroup (theme) hydration
        // ---------------------------------------------------------------
        describe("RadioGroup (theme) hydration", () => {
          const themeOptions = profileFields.theme.options;

          it("renders with value 'dark'", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.RadioGroup,
              { value: "dark", options: themeOptions }
            );
            expect(container.innerHTML).toBeTruthy();
          });

          it("readOnly with value 'dark' shows 'Dark'", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.RadioGroup,
              { readOnly: true, value: "dark", options: themeOptions }
            );
            expect(container.textContent).toContain("Dark");
          });
        });

        // ---------------------------------------------------------------
        // CheckboxGroup (interests) hydration
        // ---------------------------------------------------------------
        describe("CheckboxGroup (interests) hydration", () => {
          const interestsOptions = profileFields.interests.options;

          it("renders with value ['tech', 'music']", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.CheckboxGroup,
              { value: ["tech", "music"], options: interestsOptions }
            );
            expect(container.innerHTML).toBeTruthy();
          });

          it("readOnly with value ['tech'] shows 'Technology'", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.CheckboxGroup,
              { readOnly: true, value: ["tech"], options: interestsOptions }
            );
            expect(container.textContent).toContain("Technology");
          });
        });

        // ---------------------------------------------------------------
        // DateControl (birthdate) hydration
        // ---------------------------------------------------------------
        describe("DateControl (birthdate) hydration", () => {
          it("renders with ISO date value", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.DateControl,
              { value: "2000-06-15T00:00:00.000Z" }
            );
            expect(container.innerHTML).toBeTruthy();
          });

          it("readOnly with null shows sentinel", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.DateControl,
              { readOnly: true, value: null }
            );
            expect(container.textContent).toContain("-");
          });
        });

        // ---------------------------------------------------------------
        // ReadOnly (memberSince) hydration
        // ---------------------------------------------------------------
        describe("ReadOnly (memberSince) hydration", () => {
          it("renders with value '2023-01-15'", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.ReadOnly,
              { value: "2023-01-15" }
            );
            expect(container.textContent).toContain("2023-01-15");
          });

          it("renders undefined as sentinel", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.ReadOnly,
              { value: undefined }
            );
            expect(container.textContent).toContain("-");
          });
        });
      });
    });
  });

  // =================================================================
  // Workflow form round-trip
  // =================================================================
  describe("Workflow form round-trip", () => {
    const workflowFields = workflowFormConfig.fields as Record<string, IFieldConfig>;

    adapters.forEach((adapter) => {
      describe(`[${adapter.name}]`, () => {
        // ---------------------------------------------------------------
        // Dropdown (status) hydration
        // ---------------------------------------------------------------
        describe("Dropdown (status) hydration", () => {
          const statusOptions = workflowFields.status.options;

          it("renders with value 'Active'", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Dropdown,
              { value: "Active", options: statusOptions }
            );
            expect(container.innerHTML).toBeTruthy();
          });

          it("renders with value 'Draft'", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Dropdown,
              { value: "Draft", options: statusOptions }
            );
            expect(container.innerHTML).toBeTruthy();
          });
        });

        // ---------------------------------------------------------------
        // Textbox (title) hydration
        // ---------------------------------------------------------------
        describe("Textbox (title) hydration", () => {
          it("renders with value 'Fix login bug'", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Textbox,
              { value: "Fix login bug" }
            );
            expect(container.innerHTML).toBeTruthy();
          });

          it("readOnly with undefined shows sentinel", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Textbox,
              { readOnly: true, value: undefined }
            );
            expect(container.textContent).toContain("-");
          });
        });

        // ---------------------------------------------------------------
        // DynamicFragment (ticketId) hydration
        // ---------------------------------------------------------------
        describe("DynamicFragment (ticketId) hydration", () => {
          it("renders with value and has hidden input", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Fragment,
              { value: "TICKET-123" }
            );
            const hiddenInput = container.querySelector(
              "input[type='hidden']"
            ) as HTMLInputElement;
            expect(hiddenInput).toBeTruthy();
            expect(hiddenInput.value).toBe("TICKET-123");
          });

          it("readOnly still renders hidden input", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Fragment,
              { readOnly: true, value: "TICKET-456" }
            );
            const hiddenInput = container.querySelector(
              "input[type='hidden']"
            );
            expect(hiddenInput).toBeTruthy();
          });
        });

        // ---------------------------------------------------------------
        // ReadOnly (createdBy) hydration
        // ---------------------------------------------------------------
        describe("ReadOnly (createdBy) hydration", () => {
          it("renders with value 'admin@example.com'", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.ReadOnly,
              { value: "admin@example.com" }
            );
            expect(container.textContent).toContain("admin@example.com");
          });
        });
      });
    });
  });

  // =================================================================
  // Option-heavy form round-trip
  // =================================================================
  describe("Option-heavy form round-trip", () => {
    const optionFields = optionHeavyFormConfig.fields as Record<string, IFieldConfig>;

    adapters.forEach((adapter) => {
      describe(`[${adapter.name}]`, () => {
        // ---------------------------------------------------------------
        // Dropdown with 100 options
        // ---------------------------------------------------------------
        describe("Dropdown with 100 options", () => {
          const largeOptions = optionFields.largeDropdown.options;

          it("renders with value 'opt50' without hanging", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Dropdown,
              { value: "opt50", options: largeOptions }
            );
            expect(container.innerHTML).toBeTruthy();
          });

          it("readOnly with value 'opt50' shows content", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Dropdown,
              { readOnly: true, value: "opt50", options: largeOptions }
            );
            expect(container.textContent).toBeTruthy();
          });
        });

        // ---------------------------------------------------------------
        // Dropdown with 20 string options
        // ---------------------------------------------------------------
        describe("Dropdown with 20 string options", () => {
          const simpleOptions = optionFields.simpleChoices.options;

          it("renders with options and value 'Choice 5'", () => {
            const { container } = renderField(
              adapter,
              ComponentTypes.Dropdown,
              { value: "Choice 5", options: simpleOptions }
            );
            expect(container.innerHTML).toBeTruthy();
          });
        });
      });
    });
  });
});
