import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ReadOnlyDateTime from "@form-eng/fluent/fields/readonly/ReadOnlyDateTime";
import { FormDecorator, createFieldProps } from "../../helpers";

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
  },
};

export default meta;

export const WithTimestamp: StoryObj = {
  render: (args) => {
    const props = createFieldProps({ ...args });
    return <ReadOnlyDateTime {...props} />;
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
    return <ReadOnlyDateTime {...props} />;
  },
  args: {
    value: "2025-06-15T14:30:00.000Z",
    label: "Created On",
  },
};

export const NoValue: StoryObj = {
  render: (args) => {
    const props = createFieldProps({ ...args });
    return <ReadOnlyDateTime {...props} />;
  },
  args: {
    value: null,
    label: "Modified On",
  },
};
