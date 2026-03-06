import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ReadOnlyArray from "@form-eng/fluent/fields/readonly/ReadOnlyArray";
import { FormDecorator, createFieldProps } from "../../helpers";

/**
 * **ReadOnlyArray** displays an array of string values, each rendered as
 * a separate read-only text line. Useful for multi-value fields like tags.
 */
const meta: Meta = {
  title: "Fields/Read-Only/ReadOnlyArray",
  decorators: [
    (Story) => (
      <FormDecorator>
        <Story />
      </FormDecorator>
    ),
  ],
};

export default meta;

export const Default: StoryObj = {
  render: (args) => {
    const props = createFieldProps({ ...args });
    return <ReadOnlyArray {...props} />;
  },
  args: {
    value: ["Frontend", "Backend", "DevOps"],
    label: "Teams",
  },
};

export const SingleItem: StoryObj = {
  render: (args) => {
    const props = createFieldProps({ ...args });
    return <ReadOnlyArray {...props} />;
  },
  args: {
    value: ["Only item"],
    label: "Tags",
  },
};

export const Empty: StoryObj = {
  render: (args) => {
    const props = createFieldProps({ ...args });
    return <ReadOnlyArray {...props} />;
  },
  args: {
    value: [],
    label: "Tags",
  },
};
