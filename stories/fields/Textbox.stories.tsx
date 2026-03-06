import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Textbox from "@form-eng/fluent/fields/Textbox";
import { FormDecorator, createFieldProps } from "../helpers";

/**
 * **Textbox** renders a single-line text input using Fluent UI's `<Input>`.
 * In read-only mode it falls back to a plain text display.
 */
const meta: Meta = {
  title: "Fields/Text Inputs/Textbox",
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
    label: { control: "text" },
  },
};

export default meta;

const TextboxStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState(args.value ?? "");
  const props = createFieldProps({
    ...args,
    value,
    setFieldValue: (_name, val) => setValue(val as string),
  });
  return <Textbox {...props} />;
};

export const Default: StoryObj = {
  render: (args) => <TextboxStory {...args} />,
  args: {
    value: "Hello world",
    readOnly: false,
    required: false,
    label: "Name",
  },
};

export const Required: StoryObj = {
  render: (args) => <TextboxStory {...args} />,
  args: {
    value: "",
    required: true,
    label: "Name",
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <TextboxStory {...args} />,
  args: {
    value: "Read-only value",
    readOnly: true,
    label: "Name",
  },
};

export const WithError: StoryObj = {
  render: (args) => <TextboxStory {...args} />,
  args: {
    value: "",
    required: true,
    label: "Name",
    error: { type: "required", message: "This field is required" },
  },
};
