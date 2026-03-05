import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import HookMultiSelect from "@bghcore/dynamic-forms-fluent/fields/HookMultiSelect";
import { FormDecorator, createFieldProps } from "../helpers";

/**
 * **Multiselect** renders a multi-select dropdown using Fluent UI's
 * `<Dropdown multiselect>`. Selected values are stored as a `string[]`.
 * In read-only mode it shows a read-only dropdown with the selected values.
 */
const meta: Meta = {
  title: "Fields/Selection/Multiselect",
  decorators: [
    (Story) => (
      <FormDecorator defaultValues={{ storyField: [] }}>
        <Story />
      </FormDecorator>
    ),
  ],
  argTypes: {
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;

const tagOptions = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "design", label: "Design" },
  { value: "devops", label: "DevOps" },
  { value: "qa", label: "QA" },
];

const MultiselectStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState(args.value ?? []);
  const props = createFieldProps({
    ...args,
    value,
    options: tagOptions,
    setFieldValue: (_name, val) => setValue(val as string[]),
  });
  return <HookMultiSelect {...props} />;
};

export const Default: StoryObj = {
  render: (args) => <MultiselectStory {...args} />,
  args: {
    value: ["frontend", "backend"],
    readOnly: false,
    label: "Tags",
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <MultiselectStory {...args} />,
  args: {
    value: ["frontend", "design"],
    readOnly: true,
    label: "Tags",
  },
};

export const Empty: StoryObj = {
  render: (args) => <MultiselectStory {...args} />,
  args: {
    value: [],
    label: "Tags",
  },
};
