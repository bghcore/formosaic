import { runAdapterContractTests, TIER_1_FIELDS } from "@form-eng/core/testing";
import { createChakraFieldRegistry } from "../registry";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import React from "react";

const ChakraWrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(ChakraProvider, { value: defaultSystem }, children);

runAdapterContractTests(createChakraFieldRegistry, {
  suiteName: "Chakra UI",
  onlyTypes: [...TIER_1_FIELDS, "Rating", "Autocomplete", "DateTime", "DateRange", "PhoneInput", "FileUpload", "ColorPicker", "MultiSelectSearch", "StatusDropdown", "ReadOnlyArray", "ReadOnlyDateTime", "ReadOnlyRichText", "ReadOnlyWithButton"],
  wrapper: ChakraWrapper,
});
