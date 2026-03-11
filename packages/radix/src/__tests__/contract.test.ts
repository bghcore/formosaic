import { runAdapterContractTests, ALL_FIELD_TYPES } from "@form-eng/core/testing";
import { createRadixFieldRegistry } from "../registry";

// Radix Slider uses @radix-ui/react-use-size which requires ResizeObserver
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Only test Tier 1 fields present in the Radix registry
const INCLUDED = [
  "Textbox", "Number", "Toggle", "Dropdown", "SimpleDropdown",
  "Multiselect", "DateControl", "Slider", "RadioGroup", "CheckboxGroup",
  "Textarea", "DynamicFragment", "ReadOnly",
  "Rating", "Autocomplete", "DateTime",
  "DateRange", "PhoneInput", "FileUpload",
  "ColorPicker", "MultiSelectSearch", "StatusDropdown",
  "ReadOnlyArray", "ReadOnlyDateTime", "ReadOnlyRichText", "ReadOnlyWithButton",
];

runAdapterContractTests(createRadixFieldRegistry, {
  suiteName: "Radix",
  onlyTypes: ALL_FIELD_TYPES.filter(t => INCLUDED.includes(t)),
});
