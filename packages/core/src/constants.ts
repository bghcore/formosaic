export const FIELD_PARENT_PREFIX = "Parent.";

/** Component type constants */
export const ComponentTypes = {
  Textbox: "Textbox",
  Dropdown: "Dropdown",
  Toggle: "Toggle",
  Number: "Number",
  MultiSelect: "Multiselect",
  DateControl: "DateControl",
  Slider: "Slider",
  Fragment: "DynamicFragment",
  MultiSelectSearch: "MultiSelectSearch",
  Textarea: "Textarea",
  DocumentLinks: "DocumentLinks",
  StatusDropdown: "StatusDropdown",
  ReadOnly: "ReadOnly",
  ReadOnlyArray: "ReadOnlyArray",
  ReadOnlyDateTime: "ReadOnlyDateTime",
  ReadOnlyCumulativeNumber: "ReadOnlyCumulativeNumber",
  ReadOnlyRichText: "ReadOnlyRichText",
  ReadOnlyWithButton: "ReadOnlyWithButton",
  FieldArray: "FieldArray",
  RadioGroup: "RadioGroup",
  CheckboxGroup: "CheckboxGroup",
  Rating: "Rating",
  ColorPicker: "ColorPicker",
  Autocomplete: "Autocomplete",
  FileUpload: "FileUpload",
  DateRange: "DateRange",
  DateTime: "DateTime",
  PhoneInput: "PhoneInput",
} as const;

/** Form-level constants */
export const FormConstants = {
  defaultExpandCutoffCount: 12,
  loadingShimmerCount: 12,
  loadingFieldShimmerHeight: 32,
  na: "n/a",
  urlRegex: /(http(s?)):\/\//i,
} as const;

