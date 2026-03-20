import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import PhoneInputField from "@formosaic/fluent/fields/PhoneInput";
import { FormDecorator, createFieldProps, FieldStoryWrapper } from "../helpers";

/**
 * **PhoneInput** renders a telephone input with inline number formatting.
 * Value type is `string`. No external dependencies — formatting is built-in.
 * Configure via `config.format`:
 * - `"us"` (default): `(XXX) XXX-XXXX`
 * - `"international"`: `+X XXX XXX XXXX`
 * - `"raw"`: digits only, no formatting
 */
const meta: Meta = {
  title: "Fields/Input/PhoneInput",
  decorators: [
    (Story) => (
      <FormDecorator defaultValues={{ storyField: "" }}>
        <Story />
      </FormDecorator>
    ),
  ],
  argTypes: {
    label: { control: "text" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;

const PhoneInputStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState<string>((args.value as string) ?? "");
  const props = createFieldProps({
    ...args,
    value,
    setFieldValue: (_name, val) => setValue(val as string),
  });
  return (
    <FieldStoryWrapper label={props.label} required={props.required}>
      <PhoneInputField {...props} />
    </FieldStoryWrapper>
  );
};

export const USFormat: StoryObj = {
  render: (args) => <PhoneInputStory {...args} />,
  args: {
    readOnly: false,
    required: false,
    label: "Phone Number",
    value: "",
    config: { format: "us" },
  },
};

export const InternationalFormat: StoryObj = {
  render: (args) => <PhoneInputStory {...args} />,
  args: {
    label: "Phone Number",
    value: "",
    config: { format: "international" },
  },
};

export const RawFormat: StoryObj = {
  render: (args) => <PhoneInputStory {...args} />,
  args: {
    label: "Phone Number (digits only)",
    value: "",
    config: { format: "raw" },
  },
};

export const PreFilled: StoryObj = {
  render: (args) => <PhoneInputStory {...args} />,
  args: {
    label: "Phone Number",
    value: "(555) 123-4567",
    config: { format: "us" },
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <PhoneInputStory {...args} />,
  args: {
    label: "Phone Number",
    value: "(555) 123-4567",
    readOnly: true,
    config: { format: "us" },
  },
};

export const Required: StoryObj = {
  render: (args) => <PhoneInputStory {...args} />,
  args: {
    required: true,
    label: "Phone Number",
    value: "",
    config: { format: "us" },
  },
};

export const WithError: StoryObj = {
  render: (args) => <PhoneInputStory {...args} />,
  args: {
    required: true,
    label: "Phone Number",
    error: { type: "required", message: "Please enter a phone number" },
    config: { format: "us" },
  },
};
