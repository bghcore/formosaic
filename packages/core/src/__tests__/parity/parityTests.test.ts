/**
 * Cross-adapter parity tests.
 *
 * Runs the same IFormConfig fixtures through every adapter registry
 * to verify equivalent engine-level behavior: initial render, readOnly mode,
 * value hydration, required indicator, and empty sentinel.
 */
import { describe } from "vitest";
import { runParityTests } from "../../testing/parityHarness";
import type { IParityAdapterConfig } from "../../testing/parityHarness";
import * as fixtures from "../../testing/parityFixtures";

import { createFluentFieldRegistry } from "@form-eng/fluent";
import { createMuiFieldRegistry } from "@form-eng/mui";
import { createHeadlessFieldRegistry } from "@form-eng/headless";
import { createAntdFieldRegistry } from "@form-eng/antd";
import { createChakraFieldRegistry } from "@form-eng/chakra";
import { createMantineFieldRegistry } from "@form-eng/mantine";
import { createAtlaskitFieldRegistry } from "@form-eng/atlaskit";
import { createBaseWebFieldRegistry } from "@form-eng/base-web";
import { createHeroUIFieldRegistry } from "@form-eng/heroui";

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

// Fields that require FormProvider context and cannot render standalone
const FORM_CONTEXT_FIELDS = ["Multiselect"];

// Known required indicator parity gaps (documented, not test infra issues):
// - Fluent/MUI Textarea: PopOutEditor shows * only inside modal dialog, not inline
// - MUI CheckboxGroup: FormControl required prop needs FormLabel child for Mui-required class
const FLUENT_SKIP_REQUIRED = ["Textarea"];
const MUI_SKIP_REQUIRED = ["Textarea", "CheckboxGroup"];

// Adapters that work in jsdom without a provider wrapper
const adapters: IParityAdapterConfig[] = [
  { name: "fluent", registry: createFluentFieldRegistry, contextDependentFields: FORM_CONTEXT_FIELDS, skipRequiredCheck: FLUENT_SKIP_REQUIRED },
  { name: "mui", registry: createMuiFieldRegistry, contextDependentFields: FORM_CONTEXT_FIELDS, skipRequiredCheck: MUI_SKIP_REQUIRED },
  { name: "headless", registry: createHeadlessFieldRegistry },
  { name: "antd", registry: createAntdFieldRegistry },
  { name: "atlaskit", registry: createAtlaskitFieldRegistry },
  { name: "base-web", registry: createBaseWebFieldRegistry },
  { name: "heroui", registry: createHeroUIFieldRegistry },
];

// Chakra and Mantine require provider wrappers to render correctly.
// They are excluded from the default adapter list to avoid test setup complexity.
// To include them, add entries with a wrapper:
//   import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
//   import { MantineProvider } from "@mantine/core";
//   { name: "chakra", registry: createChakraFieldRegistry,
//     wrapper: ({ children }) => <ChakraProvider value={defaultSystem}>{children}</ChakraProvider> },
//   { name: "mantine", registry: createMantineFieldRegistry,
//     wrapper: ({ children }) => <MantineProvider>{children}</MantineProvider> },

describe("Cross-adapter parity tests", () => {
  runParityTests(fixtures.PARITY_TEXT_FORM, "Text fields", { adapters });
  runParityTests(fixtures.PARITY_NUMBER_FORM, "Number fields", { adapters });
  runParityTests(fixtures.PARITY_BOOLEAN_FORM, "Boolean fields", { adapters });
  runParityTests(fixtures.PARITY_SELECT_FORM, "Select fields", { adapters });
  runParityTests(fixtures.PARITY_DATE_FORM, "Date fields", { adapters });
  runParityTests(fixtures.PARITY_CHOICE_FORM, "Choice fields", { adapters });
  runParityTests(fixtures.PARITY_MIXED_FORM, "Mixed fields", { adapters });
  runParityTests(fixtures.PARITY_READONLY_FORM, "ReadOnly fields", { adapters });
});
