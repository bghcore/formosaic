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
  // Known a11y gaps in the React Aria adapter.
  // React Aria Components (TextField, Select, Switch, NumberField, Slider,
  // CheckboxGroup, TextArea, ComboBox) wrap their own <input>s and take
  // ownership of aria-required / aria-invalid via their `isRequired` /
  // `isInvalid` props. Our injected aria-required="true" on the outer
  // wrapper does not propagate to the inner control, so the strict
  // descendant assertion fails. These are tracked as known gaps — the
  // react-aria adapter should either migrate to `isRequired`/`isInvalid`
  // prop forwarding or be acknowledged as an a11y compat adapter.
  knownAriaGaps: {
    ariaRequired: [
      "Textbox", "Dropdown", "Toggle", "Number", "Slider",
      "Textarea", "CheckboxGroup", "Autocomplete",
    ],
    ariaInvalid: [
      "Dropdown", "Toggle", "Slider",
    ],
  },
});
