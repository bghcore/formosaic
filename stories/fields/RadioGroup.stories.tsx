import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import RadioGroupField from "@formosaic/fluent/fields/RadioGroup";
import { FormDecorator, createFieldProps, FieldStoryWrapper } from "../helpers";

/**
 * **RadioGroup** renders a set of radio buttons for single-selection.
 * Options are provided via the `options` prop as `IOption[]`.
 * Value type is `string`.
 */
const meta: Meta = {
  title: "Fields/Selection/RadioGroup",
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

const sampleOptions = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const RadioGroupStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState(args.value ?? "");
  const props = createFieldProps({
    ...args,
    value,
    options: (args.options as typeof sampleOptions) ?? sampleOptions,
    setFieldValue: (_name, val) => setValue(val as string),
  });
  return (
    <FieldStoryWrapper label={props.label} required={props.required}>
      <RadioGroupField {...props} />
    </FieldStoryWrapper>
  );
};

export const Default: StoryObj = {
  render: (args) => <RadioGroupStory {...args} />,
  args: {
    value: "medium",
    readOnly: false,
    required: false,
    label: "Size",
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <RadioGroupStory {...args} />,
  args: {
    value: "medium",
    readOnly: true,
    label: "Size",
  },
};

export const Required: StoryObj = {
  render: (args) => <RadioGroupStory {...args} />,
  args: {
    value: "",
    required: true,
    label: "Size",
  },
};

export const WithError: StoryObj = {
  render: (args) => <RadioGroupStory {...args} />,
  args: {
    value: "",
    required: true,
    label: "Size",
    error: { type: "required", message: "Please select a size" },
  },
};

export const WithDisabledOption: StoryObj = {
  render: (args) => <RadioGroupStory {...args} />,
  args: {
    value: "",
    label: "Size",
    options: [
      { value: "small", label: "Small" },
      { value: "medium", label: "Medium" },
      { value: "large", label: "Large (out of stock)", disabled: true },
    ],
  },
};
