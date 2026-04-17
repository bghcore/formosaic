import { runAdapterContractTests, TIER_1_FIELDS } from "@formosaic/core/testing";
import { createMantineFieldRegistry } from "../registry";
import { MantineProvider } from "@mantine/core";
import React from "react";
import { beforeAll } from "vitest";

// Mock browser APIs not available in jsdom that Mantine requires
beforeAll(() => {
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

  // ResizeObserver mock for Mantine's Combobox
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const MantineWrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(MantineProvider, { forceColorScheme: "light" }, children);

runAdapterContractTests(createMantineFieldRegistry, {
  suiteName: "Mantine",
  onlyTypes: [...TIER_1_FIELDS, "Rating", "Autocomplete", "DateTime", "DateRange", "PhoneInput", "FileUpload", "ColorPicker", "MultiSelectSearch", "StatusDropdown", "ReadOnlyArray", "ReadOnlyDateTime", "ReadOnlyRichText", "ReadOnlyWithButton"],
  wrapper: MantineWrapper,
  // Known a11y gaps in Mantine adapter. Mantine components expose the
  // error state via `error` prop that adds aria-describedby + a dedicated
  // error node rather than aria-invalid on the input itself. Tracked as
  // a known gap for follow-up.
  knownAriaGaps: {
    ariaInvalid: ["Textbox", "Number", "Dropdown", "Multiselect", "Textarea"],
  },
});
