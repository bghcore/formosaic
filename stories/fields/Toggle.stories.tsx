import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Toggle from "@form-eng/fluent/fields/Toggle";
import { FormDecorator, createFieldProps } from "../helpers";

/**
 * **Toggle** renders a boolean switch using Fluent UI's `<Switch>`.
 * In read-only mode it displays "Yes" or "No" as text.
 */
const meta: Meta = {
  title: "Fields/Controls/Toggle",
  decorators: [
    (Story) => (
      <FormDecorator defaultValues={{ storyField: false }}>
        <Story />
      </FormDecorator>
    ),
  ],
  argTypes: {
    value: { control: "boolean" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;

const ToggleStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState(args.value ?? false);
  const props = createFieldProps({
    ...args,
    value,
    setFieldValue: (_name, val) => setValue(val as boolean),
  });
  return <Toggle {...props} />;
};

export const Default: StoryObj = {
  render: (args) => <ToggleStory {...args} />,
  args: {
    value: false,
    readOnly: false,
    label: "Active",
  },
};

export const Checked: StoryObj = {
  render: (args) => <ToggleStory {...args} />,
  args: {
    value: true,
    readOnly: false,
    label: "Active",
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <ToggleStory {...args} />,
  args: {
    value: true,
    readOnly: true,
    label: "Active",
  },
};
