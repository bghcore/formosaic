import { runAdapterContractTests, TIER_1_FIELDS } from "@formosaic/core/testing";
import { createBaseWebFieldRegistry } from "../registry";
import { Client as Styletron } from "styletron-engine-monolithic";
import { Provider as StyletronProvider } from "styletron-react";
import React from "react";

const engine = new Styletron();
const BaseWebWrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(StyletronProvider, { value: engine }, children);

runAdapterContractTests(createBaseWebFieldRegistry, {
  suiteName: "Base Web",
  onlyTypes: [...TIER_1_FIELDS, "Rating", "Autocomplete", "DateTime", "DateRange", "PhoneInput", "FileUpload", "ColorPicker", "MultiSelectSearch", "StatusDropdown", "ReadOnlyArray", "ReadOnlyDateTime", "ReadOnlyRichText", "ReadOnlyWithButton"],
  wrapper: BaseWebWrapper,
  // Known a11y gaps in base-web adapter. Base Web's <Input> and <NumberInput>
  // own their own aria-required on an inner input — our injected
  // aria-required="true" on the wrapper does not propagate. Tracked as a
  // known adapter gap.
  knownAriaGaps: {
    ariaRequired: ["Textbox", "Number"],
  },
});
