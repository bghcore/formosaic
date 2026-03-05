import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import HookNumber from "@bghcore/dynamic-forms-fluent/fields/HookNumber";
import { FormDecorator, createFieldProps } from "../helpers";

/**
 * **Number** renders a numeric input using Fluent UI's `<Input type="number">`.
 * Non-numeric input is silently ignored. In read-only mode it shows the value as text.
 */
const meta: Meta = {
  title: "Fields/Text Inputs/Number",
  decorators: [
    (Story) => (
      <FormDecorator defaultValues={{ storyField: 0 }}>
        <Story />
      </FormDecorator>
    ),
  ],
  argTypes: {
    value: { control: "number" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
    label: { control: "text" },
  },
};

export default meta;

const NumberStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState(args.value ?? 0);
  const props = createFieldProps({
    ...args,
    value,
    setFieldValue: (_name, val) => setValue(val as number),
  });
  return <HookNumber {...props} />;
};

export const Default: StoryObj = {
  render: (args) => <NumberStory {...args} />,
  args: {
    value: 42,
    readOnly: false,
    required: false,
    label: "Quantity",
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <NumberStory {...args} />,
  args: {
    value: 100,
    readOnly: true,
    label: "Quantity",
  },
};

export const WithError: StoryObj = {
  render: (args) => <NumberStory {...args} />,
  args: {
    value: -1,
    label: "Quantity",
    error: { type: "validate", message: "Must be a positive number" },
  },
};
