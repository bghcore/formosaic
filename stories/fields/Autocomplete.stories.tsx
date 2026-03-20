import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import AutocompleteField from "@formosaic/fluent/fields/Autocomplete";
import { FormDecorator, createFieldProps, FieldStoryWrapper } from "../helpers";

/**
 * **Autocomplete** renders a searchable single-selection input.
 * Options are provided via the `options` prop as `IOption[]`.
 * Value type is `string`. Uses Fluent UI's `Combobox` with `freeform` enabled.
 */
const meta: Meta = {
  title: "Fields/Selection/Autocomplete",
  decorators: [
    (Story) => (
      <FormDecorator defaultValues={{ storyField: "" }}>
        <Story />
      </FormDecorator>
    ),
  ],
  argTypes: {
    value: { control: "text" },
    label: { control: "text" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;

const countries = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "gb", label: "United Kingdom" },
  { value: "au", label: "Australia" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
  { value: "jp", label: "Japan" },
  { value: "br", label: "Brazil" },
];

const AutocompleteStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState((args.value as string) ?? "");
  const props = createFieldProps({
    ...args,
    value,
    options: (args.options as typeof countries) ?? countries,
    setFieldValue: (_name, val) => setValue(val as string),
  });
  return (
    <FieldStoryWrapper label={props.label} required={props.required}>
      <AutocompleteField {...props} />
    </FieldStoryWrapper>
  );
};

export const Default: StoryObj = {
  render: (args) => <AutocompleteStory {...args} />,
  args: {
    value: "us",
    readOnly: false,
    required: false,
    label: "Country",
    placeholder: "Search countries...",
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <AutocompleteStory {...args} />,
  args: {
    value: "gb",
    readOnly: true,
    label: "Country",
  },
};

export const Required: StoryObj = {
  render: (args) => <AutocompleteStory {...args} />,
  args: {
    value: "",
    required: true,
    label: "Country",
    placeholder: "Search countries...",
  },
};

export const WithError: StoryObj = {
  render: (args) => <AutocompleteStory {...args} />,
  args: {
    value: "",
    required: true,
    label: "Country",
    placeholder: "Search countries...",
    error: { type: "required", message: "Please select a country" },
  },
};

export const WithDisabledOption: StoryObj = {
  render: (args) => <AutocompleteStory {...args} />,
  args: {
    value: "",
    label: "Country",
    placeholder: "Search countries...",
    options: [
      { value: "us", label: "United States" },
      { value: "ca", label: "Canada" },
      { value: "xx", label: "Restricted Region", disabled: true },
    ],
  },
};
