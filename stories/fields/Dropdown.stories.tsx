import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import DropdownField from "@form-eng/fluent/fields/Dropdown";
import { FormDecorator, createFieldProps } from "../helpers";

/**
 * **Dropdown** renders a single-select dropdown using Fluent UI's `<Dropdown>`.
 * Options are provided via the `options` prop as `IOption[]`.
 * Supports auto-selection when only one option exists (via `config.setDefaultKeyIfOnlyOneOption`).
 */
const meta: Meta = {
  title: "Fields/Selection/Dropdown",
  decorators: [
    (Story) => (
      <FormDecorator defaultValues={{ storyField: "" }}>
        <Story />
      </FormDecorator>
    ),
  ],
  argTypes: {
    value: { control: "text" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;

const sampleOptions = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Pending", label: "Pending" },
];

const DropdownStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState(args.value ?? "");
  const props = createFieldProps({
    ...args,
    value,
    options: (args.options as typeof sampleOptions) ?? sampleOptions,
    setFieldValue: (_name, val) => setValue(val as string),
  });
  return <DropdownField {...props} />;
};

export const Default: StoryObj = {
  render: (args) => <DropdownStory {...args} />,
  args: {
    value: "Active",
    readOnly: false,
    required: false,
    label: "Status",
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <DropdownStory {...args} />,
  args: {
    value: "Active",
    readOnly: true,
    label: "Status",
  },
};

export const WithError: StoryObj = {
  render: (args) => <DropdownStory {...args} />,
  args: {
    value: "",
    required: true,
    label: "Status",
    error: { type: "required", message: "Please select a status" },
  },
};

export const WithDisabledOptions: StoryObj = {
  render: (args) => <DropdownStory {...args} />,
  args: {
    value: "",
    label: "Status",
    options: [
      { value: "Active", label: "Active" },
      { value: "Deprecated", label: "Deprecated (not available)", disabled: true },
      { value: "Pending", label: "Pending" },
    ],
  },
};
