import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import StatusDropdownField from "@form-eng/fluent/fields/StatusDropdown";
import { FormDecorator, createFieldProps } from "../helpers";

/**
 * **StatusDropdown** renders a dropdown with colored status indicators.
 * Each option can be mapped to a color via `config.statusColors`.
 * In read-only mode it shows the status color dot alongside the text.
 */
const meta: Meta = {
  title: "Fields/Selection/StatusDropdown",
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

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "On Hold", label: "On Hold" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

const statusColors = {
  Active: "#0f7b0f",
  "On Hold": "#f7a800",
  Completed: "#0078d4",
  Cancelled: "#d13438",
};

const StatusDropdownStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState(args.value ?? "");
  const props = createFieldProps({
    ...args,
    value,
    options: statusOptions,
    config: { statusColors },
    setFieldValue: (_name, val) => setValue(val as string),
  });
  return <StatusDropdownField {...props} />;
};

export const Default: StoryObj = {
  render: (args) => <StatusDropdownStory {...args} />,
  args: {
    value: "Active",
    readOnly: false,
    label: "Project Status",
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <StatusDropdownStory {...args} />,
  args: {
    value: "Completed",
    readOnly: true,
    label: "Project Status",
  },
};

export const OnHold: StoryObj = {
  render: (args) => <StatusDropdownStory {...args} />,
  args: {
    value: "On Hold",
    readOnly: true,
    label: "Project Status",
  },
};
