import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import MultiSelectSearch from "@formosaic/fluent/fields/MultiSelectSearch";
import { FormDecorator, createFieldProps, FieldStoryWrapper } from "../helpers";

/**
 * **MultiSelectSearch** renders a searchable multi-select using Fluent UI's
 * `<Combobox multiselect freeform>`. Users can type to filter options.
 * In read-only mode it shows a read-only dropdown.
 */
const meta: Meta = {
  title: "Fields/Selection/MultiSelectSearch",
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

const countryOptions = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "UK", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" },
  { value: "AU", label: "Australia" },
  { value: "BR", label: "Brazil" },
];

const MultiSelectSearchStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState(args.value ?? []);
  const props = createFieldProps({
    ...args,
    value,
    options: countryOptions,
    setFieldValue: (_name, val) => setValue(val as string[]),
  });
  return (
    <FieldStoryWrapper label={props.label} required={props.required}>
      <MultiSelectSearch {...props} />
    </FieldStoryWrapper>
  );
};

export const Default: StoryObj = {
  render: (args) => <MultiSelectSearchStory {...args} />,
  args: {
    value: ["US", "CA"],
    readOnly: false,
    label: "Countries",
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <MultiSelectSearchStory {...args} />,
  args: {
    value: ["US", "UK"],
    readOnly: true,
    label: "Countries",
  },
};

export const Empty: StoryObj = {
  render: (args) => <MultiSelectSearchStory {...args} />,
  args: {
    value: [],
    label: "Countries",
  },
};
