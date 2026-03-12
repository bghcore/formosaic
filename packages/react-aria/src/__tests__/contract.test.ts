import { runAdapterContractTests, ALL_FIELD_TYPES } from "@formosaic/core/testing";
import { createReactAriaFieldRegistry } from "../registry";

// Only test Tier 1 fields present in the React Aria registry
const INCLUDED = [
  "Textbox", "Number", "Toggle", "Dropdown",
  "Multiselect", "DateControl", "Slider", "RadioGroup", "CheckboxGroup",
  "Textarea", "DynamicFragment", "ReadOnly",
  "Rating", "Autocomplete", "DateTime",
  "DateRange", "PhoneInput", "FileUpload",
  "ColorPicker", "MultiSelectSearch", "StatusDropdown",
  "ReadOnlyArray", "ReadOnlyDateTime", "ReadOnlyRichText", "ReadOnlyWithButton",
];

runAdapterContractTests(createReactAriaFieldRegistry, {
  suiteName: "React Aria",
  onlyTypes: ALL_FIELD_TYPES.filter(t => INCLUDED.includes(t)),
});
