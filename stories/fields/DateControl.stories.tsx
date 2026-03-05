import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import HookDateControl from "@bghcore/dynamic-forms-fluent/fields/HookDateControl";
import { FormDecorator, createFieldProps } from "../helpers";

/**
 * **DateControl** renders a date picker using a native HTML `<input type="date">`
 * wrapped in Fluent UI's `<Input>`, with a clear button.
 * In read-only mode it formats and displays the date as text.
 */
const meta: Meta = {
  title: "Fields/Controls/DateControl",
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

const DateControlStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState(args.value ?? "");
  const props = createFieldProps({
    ...args,
    value,
    setFieldValue: (_name, val) => setValue(val as string),
  });
  return <HookDateControl {...props} />;
};

export const Default: StoryObj = {
  render: (args) => <DateControlStory {...args} />,
  args: {
    value: new Date().toISOString(),
    readOnly: false,
    label: "Start Date",
  },
};

export const Empty: StoryObj = {
  render: (args) => <DateControlStory {...args} />,
  args: {
    value: "",
    label: "Due Date",
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <DateControlStory {...args} />,
  args: {
    value: "2025-06-15T00:00:00.000Z",
    readOnly: true,
    label: "Created Date",
  },
};

export const WithError: StoryObj = {
  render: (args) => <DateControlStory {...args} />,
  args: {
    value: "",
    required: true,
    label: "Due Date",
    error: { type: "required", message: "Due date is required" },
  },
};
