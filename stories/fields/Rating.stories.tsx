import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import RatingField from "@formosaic/fluent/fields/Rating";
import { FormDecorator, createFieldProps, FieldStoryWrapper } from "../helpers";

/**
 * **Rating** renders a star-based rating input.
 * Value type is `number`. Defaults to 1–5 stars.
 * Configure via `config.max` (default 5) and `config.allowHalf` (default false).
 */
const meta: Meta = {
  title: "Fields/Input/Rating",
  decorators: [
    (Story) => (
      <FormDecorator defaultValues={{ storyField: 0 }}>
        <Story />
      </FormDecorator>
    ),
  ],
  argTypes: {
    value: { control: { type: "number", min: 0, max: 10 } },
    label: { control: "text" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;

const RatingStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState<number>((args.value as number) ?? 0);
  const props = createFieldProps({
    ...args,
    value,
    setFieldValue: (_name, val) => setValue(val as number),
  });
  return (
    <FieldStoryWrapper label={props.label} required={props.required}>
      <RatingField {...props} />
    </FieldStoryWrapper>
  );
};

export const Default: StoryObj = {
  render: (args) => <RatingStory {...args} />,
  args: {
    value: 3,
    readOnly: false,
    required: false,
    label: "Rating",
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <RatingStory {...args} />,
  args: {
    value: 4,
    readOnly: true,
    label: "Rating",
  },
};

export const Required: StoryObj = {
  render: (args) => <RatingStory {...args} />,
  args: {
    value: 0,
    required: true,
    label: "Rating",
  },
};

export const WithError: StoryObj = {
  render: (args) => <RatingStory {...args} />,
  args: {
    value: 0,
    required: true,
    label: "Rating",
    error: { type: "required", message: "Please provide a rating" },
  },
};

export const CustomMax: StoryObj = {
  render: (args) => <RatingStory {...args} />,
  args: {
    value: 7,
    label: "Rating (out of 10)",
    config: { max: 10 },
  },
};
