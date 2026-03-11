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
import { createRadixFieldRegistry } from "@form-eng/radix";
import { createReactAriaFieldRegistry } from "@form-eng/react-aria";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { MantineProvider } from "@mantine/core";
import React from "react";

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
const FLUENT_SKIP_REQUIRED = ["Textarea", "StatusDropdown"];
const MUI_SKIP_REQUIRED = ["Textarea", "CheckboxGroup", "StatusDropdown"];
// Antd native components (Rate, AutoComplete, DatePicker, RangePicker, Upload, ColorPicker)
// don't surface aria-required/required attribute in jsdom rendering
const ANTD_SKIP_REQUIRED = ["Rating", "Autocomplete", "DateTime", "DateRange", "FileUpload", "ColorPicker"];
// Mantine native Rating doesn't surface required indicator in jsdom
const MANTINE_SKIP_REQUIRED = ["Rating"];

// Provider wrappers for Chakra and Mantine
const ChakraWrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(ChakraProvider, { value: defaultSystem }, children);

const MantineWrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(MantineProvider, { forceColorScheme: "light" as const }, children);

const adapters: IParityAdapterConfig[] = [
  { name: "fluent", registry: createFluentFieldRegistry, contextDependentFields: FORM_CONTEXT_FIELDS, skipRequiredCheck: FLUENT_SKIP_REQUIRED },
  { name: "mui", registry: createMuiFieldRegistry, contextDependentFields: FORM_CONTEXT_FIELDS, skipRequiredCheck: MUI_SKIP_REQUIRED },
  { name: "headless", registry: createHeadlessFieldRegistry },
  { name: "antd", registry: createAntdFieldRegistry, skipRequiredCheck: ANTD_SKIP_REQUIRED },
  { name: "chakra", registry: createChakraFieldRegistry, wrapper: ChakraWrapper },
  { name: "mantine", registry: createMantineFieldRegistry, wrapper: MantineWrapper, skipRequiredCheck: MANTINE_SKIP_REQUIRED },
  { name: "atlaskit", registry: createAtlaskitFieldRegistry },
  { name: "base-web", registry: createBaseWebFieldRegistry },
  { name: "heroui", registry: createHeroUIFieldRegistry },
  { name: "radix", registry: createRadixFieldRegistry },
  { name: "react-aria", registry: createReactAriaFieldRegistry },
];

describe("Cross-adapter parity tests", () => {
  runParityTests(fixtures.PARITY_TEXT_FORM, "Text fields", { adapters });
  runParityTests(fixtures.PARITY_NUMBER_FORM, "Number fields", { adapters });
  runParityTests(fixtures.PARITY_BOOLEAN_FORM, "Boolean fields", { adapters });
  runParityTests(fixtures.PARITY_SELECT_FORM, "Select fields", { adapters });
  runParityTests(fixtures.PARITY_DATE_FORM, "Date fields", { adapters });
  runParityTests(fixtures.PARITY_CHOICE_FORM, "Choice fields", { adapters });
  runParityTests(fixtures.PARITY_MIXED_FORM, "Mixed fields", { adapters });
  runParityTests(fixtures.PARITY_READONLY_FORM, "ReadOnly fields", { adapters });
  runParityTests(fixtures.PARITY_RATING_FORM, "Rating fields", { adapters });
  runParityTests(fixtures.PARITY_AUTOCOMPLETE_FORM, "Autocomplete fields", { adapters });
  runParityTests(fixtures.PARITY_DATETIME_FORM, "DateTime fields", { adapters });
  runParityTests(fixtures.PARITY_DATERANGE_FORM, "DateRange fields", { adapters });
  runParityTests(fixtures.PARITY_PHONEINPUT_FORM, "PhoneInput fields", { adapters });
  runParityTests(fixtures.PARITY_FILEUPLOAD_FORM, "FileUpload fields", { adapters });
  runParityTests(fixtures.PARITY_COLORPICKER_FORM, "ColorPicker fields", { adapters });
  runParityTests(fixtures.PARITY_MULTISELECTSEARCH_FORM, "MultiSelectSearch fields", { adapters });
  runParityTests(fixtures.PARITY_STATUSDROPDOWN_FORM, "StatusDropdown fields", { adapters });
  runParityTests(fixtures.PARITY_READONLY_VARIANTS_FORM, "ReadOnly variant fields", { adapters });
});
