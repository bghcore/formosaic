import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ReadOnlyDateTime from "@formosaic/fluent/fields/readonly/ReadOnlyDateTime";
import { FormDecorator, createFieldProps, FieldStoryWrapper } from "../../helpers";

/**
 * **ReadOnlyDateTime** formats and displays a date/time string.
 * Supports `config.hidetimeStamp` to show only the date portion.
 */
const meta: Meta = {
  title: "Fields/Read-Only/ReadOnlyDateTime",
  decorators: [
    (Story) => (
      <FormDecorator>
        <Story />
      </FormDecorator>
    ),
  ],
  argTypes: {
    value: { control: "text" },
    label: { control: "text" },
  },
};

export default meta;

export const WithTimestamp: StoryObj = {
  render: (args) => {
    const props = createFieldProps({ ...args });
    return (
      <FieldStoryWrapper label={props.label} required={props.required}>
        <ReadOnlyDateTime {...props} />
      </FieldStoryWrapper>
    );
  },
  args: {
    value: "2025-06-15T14:30:00.000Z",
    label: "Created On",
  },
};

export const DateOnly: StoryObj = {
  render: (args) => {
    const props = createFieldProps({
      ...args,
      config: { hidetimeStamp: true },
    });
    return (
      <FieldStoryWrapper label={props.label} required={props.required}>
        <ReadOnlyDateTime {...props} />
      </FieldStoryWrapper>
    );
  },
  args: {
    value: "2025-06-15T14:30:00.000Z",
    label: "Created On",
  },
};

export const NoValue: StoryObj = {
  render: (args) => {
    const props = createFieldProps({ ...args });
    return (
      <FieldStoryWrapper label={props.label} required={props.required}>
        <ReadOnlyDateTime {...props} />
      </FieldStoryWrapper>
    );
  },
  args: {
    value: null,
    label: "Modified On",
  },
};
