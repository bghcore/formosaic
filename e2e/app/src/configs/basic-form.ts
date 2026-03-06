import type { IFormConfig } from "@form-eng/core";

/**
 * Basic form with text, dropdown, toggle, and number fields.
 * No rules -- tests baseline rendering, fill, and submit.
 */
export const basicFormConfig: IFormConfig = {
  version: 2,
  fields: {
    firstName: {
      type: "Textbox",
      label: "First Name",
      required: true,
      placeholder: "Enter first name",
    },
    lastName: {
      type: "Textbox",
      label: "Last Name",
      required: true,
      placeholder: "Enter last name",
    },
    age: {
      type: "Number",
      label: "Age",
      required: false,
      placeholder: "Enter age",
    },
    country: {
      type: "Dropdown",
      label: "Country",
      required: true,
      options: [
        { value: "US", label: "United States" },
        { value: "CA", label: "Canada" },
        { value: "UK", label: "United Kingdom" },
        { value: "AU", label: "Australia" },
      ],
    },
    newsletter: {
      type: "Toggle",
      label: "Subscribe to newsletter",
      required: false,
      defaultValue: false,
    },
  },
  fieldOrder: ["firstName", "lastName", "age", "country", "newsletter"],
  settings: {
    manualSave: true,
  },
};

export const basicFormDefaults: Record<string, unknown> = {
  firstName: "",
  lastName: "",
  age: null,
  country: "",
  newsletter: false,
};
