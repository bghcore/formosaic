import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import HookReadOnlyArray from "@bghcore/dynamic-forms-fluent/fields/readonly/HookReadOnlyArray";
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
    return <HookReadOnlyArray {...props} />;
  },
  args: {
    value: ["Frontend", "Backend", "DevOps"],
    label: "Teams",
  },
};

export const SingleItem: StoryObj = {
  render: (args) => {
    const props = createFieldProps({ ...args });
    return <HookReadOnlyArray {...props} />;
  },
  args: {
    value: ["Only item"],
    label: "Tags",
  },
};

export const Empty: StoryObj = {
  render: (args) => {
    const props = createFieldProps({ ...args });
    return <HookReadOnlyArray {...props} />;
  },
  args: {
    value: [],
    label: "Tags",
  },
};
