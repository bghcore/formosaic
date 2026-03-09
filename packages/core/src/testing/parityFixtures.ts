/**
 * IFormConfig v2 fixtures for cross-adapter parity testing.
 *
 * Each fixture exercises a specific field-type category across all adapters.
 * All configs are valid IFormConfig v2 with explicit fieldOrder arrays.
 */
import type { IFormConfig } from "../types/IFormConfig";

/** Text and textarea fields with required, empty, and pre-filled states */
export const PARITY_TEXT_FORM: IFormConfig = {
  version: 2,
  fields: {
    textRequired: { type: "Textbox", label: "Name", required: true },
    textEmpty: { type: "Textbox", label: "Empty Text" },
    textValue: { type: "Textbox", label: "With Value" },
    textareaField: { type: "Textarea", label: "Notes" },
  },
  fieldOrder: ["textRequired", "textEmpty", "textValue", "textareaField"],
};

/** Number field with zero, null, negative, and decimal values */
export const PARITY_NUMBER_FORM: IFormConfig = {
  version: 2,
  fields: {
    numberZero: { type: "Number", label: "Zero Value" },
    numberEmpty: { type: "Number", label: "Empty Number" },
    numberNegative: { type: "Number", label: "Negative" },
    numberDecimal: { type: "Number", label: "Decimal" },
  },
  fieldOrder: ["numberZero", "numberEmpty", "numberNegative", "numberDecimal"],
};

/** Toggle field with true, false, and undefined states */
export const PARITY_BOOLEAN_FORM: IFormConfig = {
  version: 2,
  fields: {
    toggleTrue: { type: "Toggle", label: "Enabled" },
    toggleFalse: { type: "Toggle", label: "Disabled" },
    toggleEmpty: { type: "Toggle", label: "Unset" },
  },
  fieldOrder: ["toggleTrue", "toggleFalse", "toggleEmpty"],
};

/** Dropdown, SimpleDropdown, and Multiselect with shared options */
export const PARITY_SELECT_FORM: IFormConfig = {
  version: 2,
  fields: {
    dropdown: {
      type: "Dropdown",
      label: "Dropdown",
      options: [
        { value: "opt1", label: "Option 1" },
        { value: "opt2", label: "Option 2" },
        { value: "opt3", label: "Option 3" },
      ],
    },
    simpleDropdown: {
      type: "SimpleDropdown",
      label: "Simple Dropdown",
      options: [
        { value: "opt1", label: "Option 1" },
        { value: "opt2", label: "Option 2" },
      ],
    },
    multiselect: {
      type: "Multiselect",
      label: "Multi Select",
      options: [
        { value: "opt1", label: "Option 1" },
        { value: "opt2", label: "Option 2" },
        { value: "opt3", label: "Option 3" },
      ],
    },
  },
  fieldOrder: ["dropdown", "simpleDropdown", "multiselect"],
};

/** DateControl with ISO string and empty value */
export const PARITY_DATE_FORM: IFormConfig = {
  version: 2,
  fields: {
    dateWithValue: { type: "DateControl", label: "Start Date" },
    dateEmpty: { type: "DateControl", label: "End Date" },
  },
  fieldOrder: ["dateWithValue", "dateEmpty"],
};

/** RadioGroup and CheckboxGroup with shared options */
export const PARITY_CHOICE_FORM: IFormConfig = {
  version: 2,
  fields: {
    radioGroup: {
      type: "RadioGroup",
      label: "Priority",
      options: [
        { value: "low", label: "Low" },
        { value: "med", label: "Medium" },
        { value: "high", label: "High" },
      ],
    },
    checkboxGroup: {
      type: "CheckboxGroup",
      label: "Categories",
      options: [
        { value: "a", label: "Category A" },
        { value: "b", label: "Category B" },
        { value: "c", label: "Category C" },
      ],
    },
  },
  fieldOrder: ["radioGroup", "checkboxGroup"],
};

/** All 13 Tier 1 field types in a single config */
export const PARITY_MIXED_FORM: IFormConfig = {
  version: 2,
  fields: {
    textbox: { type: "Textbox", label: "Name" },
    number: { type: "Number", label: "Age" },
    toggle: { type: "Toggle", label: "Active" },
    dropdown: {
      type: "Dropdown",
      label: "Country",
      options: [
        { value: "us", label: "United States" },
        { value: "uk", label: "United Kingdom" },
      ],
    },
    simpleDropdown: {
      type: "SimpleDropdown",
      label: "Size",
      options: [
        { value: "s", label: "Small" },
        { value: "m", label: "Medium" },
        { value: "l", label: "Large" },
      ],
    },
    multiselect: {
      type: "Multiselect",
      label: "Tags",
      options: [
        { value: "tag1", label: "Tag 1" },
        { value: "tag2", label: "Tag 2" },
      ],
    },
    dateControl: { type: "DateControl", label: "Birthday" },
    slider: { type: "Slider", label: "Rating" },
    radioGroup: {
      type: "RadioGroup",
      label: "Gender",
      options: [
        { value: "m", label: "Male" },
        { value: "f", label: "Female" },
        { value: "o", label: "Other" },
      ],
    },
    checkboxGroup: {
      type: "CheckboxGroup",
      label: "Interests",
      options: [
        { value: "sports", label: "Sports" },
        { value: "music", label: "Music" },
      ],
    },
    textarea: { type: "Textarea", label: "Bio" },
    readOnly: { type: "ReadOnly", label: "ID" },
    dynamicFragment: { type: "DynamicFragment", label: "Fragment" },
  },
  fieldOrder: [
    "textbox",
    "number",
    "toggle",
    "dropdown",
    "simpleDropdown",
    "multiselect",
    "dateControl",
    "slider",
    "radioGroup",
    "checkboxGroup",
    "textarea",
    "readOnly",
    "dynamicFragment",
  ],
};

/** All Tier 1 types forced readOnly with representative values */
export const PARITY_READONLY_FORM: IFormConfig = {
  version: 2,
  fields: {
    textbox: { type: "Textbox", label: "Name", readOnly: true },
    number: { type: "Number", label: "Count", readOnly: true },
    toggle: { type: "Toggle", label: "Enabled", readOnly: true },
    dropdown: {
      type: "Dropdown",
      label: "Status",
      readOnly: true,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    simpleDropdown: {
      type: "SimpleDropdown",
      label: "Type",
      readOnly: true,
      options: [
        { value: "a", label: "Type A" },
        { value: "b", label: "Type B" },
      ],
    },
    multiselect: {
      type: "Multiselect",
      label: "Tags",
      readOnly: true,
      options: [
        { value: "t1", label: "Tag 1" },
        { value: "t2", label: "Tag 2" },
      ],
    },
    dateControl: { type: "DateControl", label: "Created", readOnly: true },
    slider: { type: "Slider", label: "Score", readOnly: true },
    radioGroup: {
      type: "RadioGroup",
      label: "Priority",
      readOnly: true,
      options: [
        { value: "low", label: "Low" },
        { value: "high", label: "High" },
      ],
    },
    checkboxGroup: {
      type: "CheckboxGroup",
      label: "Flags",
      readOnly: true,
      options: [
        { value: "f1", label: "Flag 1" },
        { value: "f2", label: "Flag 2" },
      ],
    },
    textarea: { type: "Textarea", label: "Notes", readOnly: true },
    readOnly: { type: "ReadOnly", label: "Reference" },
    dynamicFragment: { type: "DynamicFragment", label: "Hidden", readOnly: true },
  },
  fieldOrder: [
    "textbox",
    "number",
    "toggle",
    "dropdown",
    "simpleDropdown",
    "multiselect",
    "dateControl",
    "slider",
    "radioGroup",
    "checkboxGroup",
    "textarea",
    "readOnly",
    "dynamicFragment",
  ],
};
