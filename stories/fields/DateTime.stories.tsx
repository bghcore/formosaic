import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import DateTimeField from "@formosaic/fluent/fields/DateTime";
import { FormDecorator, createFieldProps, FieldStoryWrapper } from "../helpers";

/**
 * **DateTime** renders a combined date+time input.
 * Value type is `string | null` (ISO datetime-local string, e.g. "2024-06-15T14:30").
 * Configure via `config.minDateTime` and `config.maxDateTime`.
 */
const meta: Meta = {
  title: "Fields/Input/DateTime",
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

const DateTimeStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState<string | null>((args.value as string | null) ?? null);
  const props = createFieldProps({
    ...args,
    value,
    setFieldValue: (_name, val) => setValue(val as string | null),
  });
  return (
    <FieldStoryWrapper label={props.label} required={props.required}>
      <DateTimeField {...props} />
    </FieldStoryWrapper>
  );
};

export const Default: StoryObj = {
  render: (args) => <DateTimeStory {...args} />,
  args: {
    readOnly: false,
    required: false,
    label: "Date & Time",
    config: {},
  },
};

export const PreFilled: StoryObj = {
  render: (args) => <DateTimeStory {...args} />,
  args: {
    label: "Event Start",
    value: "2024-06-15T14:30",
    config: {},
  },
};

export const WithConstraints: StoryObj = {
  render: (args) => <DateTimeStory {...args} />,
  args: {
    label: "Appointment Time",
    config: { minDateTime: "2024-01-01T09:00", maxDateTime: "2024-12-31T17:00" },
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <DateTimeStory {...args} />,
  args: {
    label: "Date & Time",
    value: "2024-06-15T14:30",
    readOnly: true,
    config: {},
  },
};

export const Required: StoryObj = {
  render: (args) => <DateTimeStory {...args} />,
  args: {
    required: true,
    label: "Required Date & Time",
    config: {},
  },
};

export const WithError: StoryObj = {
  render: (args) => <DateTimeStory {...args} />,
  args: {
    required: true,
    label: "Date & Time",
    error: { type: "required", message: "Please select a date and time" },
    config: {},
  },
};
