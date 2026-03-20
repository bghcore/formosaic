import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import CheckboxGroupField from "@formosaic/fluent/fields/CheckboxGroup";
import { FormDecorator, createFieldProps, FieldStoryWrapper } from "../helpers";

/**
 * **CheckboxGroup** renders a set of checkboxes for multi-selection.
 * Options are provided via the `options` prop as `IOption[]`.
 * Value type is `string[]`.
 */
const meta: Meta = {
  title: "Fields/Selection/CheckboxGroup",
  decorators: [
    (Story) => (
      <FormDecorator defaultValues={{ storyField: [] }}>
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

const sampleOptions = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "svelte", label: "Svelte" },
];

const CheckboxGroupStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState<string[]>((args.value as string[]) ?? []);
  const props = createFieldProps({
    ...args,
    value,
    options: (args.options as typeof sampleOptions) ?? sampleOptions,
    setFieldValue: (_name, val) => setValue(val as string[]),
  });
  return (
    <FieldStoryWrapper label={props.label} required={props.required}>
      <CheckboxGroupField {...props} />
    </FieldStoryWrapper>
  );
};

export const Default: StoryObj = {
  render: (args) => <CheckboxGroupStory {...args} />,
  args: {
    value: ["react", "vue"],
    readOnly: false,
    required: false,
    label: "Frameworks",
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <CheckboxGroupStory {...args} />,
  args: {
    value: ["react", "angular"],
    readOnly: true,
    label: "Frameworks",
  },
};

export const Required: StoryObj = {
  render: (args) => <CheckboxGroupStory {...args} />,
  args: {
    value: [],
    required: true,
    label: "Frameworks",
  },
};

export const WithError: StoryObj = {
  render: (args) => <CheckboxGroupStory {...args} />,
  args: {
    value: [],
    required: true,
    label: "Frameworks",
    error: { type: "required", message: "Please select at least one framework" },
  },
};

export const WithDisabledOption: StoryObj = {
  render: (args) => <CheckboxGroupStory {...args} />,
  args: {
    value: [],
    label: "Frameworks",
    options: [
      { value: "react", label: "React" },
      { value: "vue", label: "Vue" },
      { value: "angular", label: "Angular (deprecated)", disabled: true },
    ],
  },
};
