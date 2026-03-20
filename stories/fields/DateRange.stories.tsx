import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import DateRangeField from "@formosaic/fluent/fields/DateRange";
import { FormDecorator, createFieldProps, FieldStoryWrapper } from "../helpers";

interface IDateRangeValue {
  start: string;
  end: string;
}

/**
 * **DateRange** renders two date inputs side by side (From / To).
 * Value type is `{ start: string; end: string } | null` (ISO date strings).
 * Validates that start <= end.
 * Configure via `config.minDate` and `config.maxDate`.
 */
const meta: Meta = {
  title: "Fields/Input/DateRange",
  decorators: [
    (Story) => (
      <FormDecorator defaultValues={{ storyField: null }}>
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

const DateRangeStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState<IDateRangeValue | null>(
    (args.value as IDateRangeValue | null) ?? null
  );
  const props = createFieldProps({
    ...args,
    value,
    setFieldValue: (_name, val) => setValue(val as IDateRangeValue | null),
  });
  return (
    <FieldStoryWrapper label={props.label} required={props.required}>
      <DateRangeField {...props} />
    </FieldStoryWrapper>
  );
};

export const Default: StoryObj = {
  render: (args) => <DateRangeStory {...args} />,
  args: {
    readOnly: false,
    required: false,
    label: "Date Range",
    config: {},
  },
};

export const PreFilled: StoryObj = {
  render: (args) => <DateRangeStory {...args} />,
  args: {
    label: "Project Duration",
    value: { start: "2024-01-01", end: "2024-06-30" },
    config: {},
  },
};

export const WithMinMaxConstraints: StoryObj = {
  render: (args) => <DateRangeStory {...args} />,
  args: {
    label: "Booking Window",
    config: { minDate: "2024-01-01", maxDate: "2024-12-31" },
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <DateRangeStory {...args} />,
  args: {
    label: "Date Range",
    value: { start: "2024-03-01", end: "2024-03-15" },
    readOnly: true,
    config: {},
  },
};

export const Required: StoryObj = {
  render: (args) => <DateRangeStory {...args} />,
  args: {
    required: true,
    label: "Required Date Range",
    config: {},
  },
};

export const WithError: StoryObj = {
  render: (args) => <DateRangeStory {...args} />,
  args: {
    required: true,
    label: "Date Range",
    error: { type: "required", message: "Please select a date range" },
    config: {},
  },
};
