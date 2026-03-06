import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ReadOnlyWithButton from "@form-eng/fluent/fields/readonly/ReadOnlyWithButton";
import { FormDecorator, createFieldProps } from "../../helpers";

/**
 * **ReadOnlyWithButton** displays a read-only text value alongside an action button.
 * The button text and click handler are provided via `config.buttonText` and
 * `config.onButtonClick`.
 */
const meta: Meta = {
  title: "Fields/Read-Only/ReadOnlyWithButton",
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

export const Default: StoryObj = {
  render: (args) => {
    const props = createFieldProps({
      ...args,
      config: {
        buttonText: "View Details",
        onButtonClick: () => alert("Button clicked!"),
      },
    });
    return <ReadOnlyWithButton {...props} />;
  },
  args: {
    value: "PRJ-2025-001",
    label: "Project ID",
  },
};

export const WithoutButton: StoryObj = {
  render: (args) => {
    const props = createFieldProps({ ...args, config: {} });
    return <ReadOnlyWithButton {...props} />;
  },
  args: {
    value: "PRJ-2025-002",
    label: "Project ID",
  },
};
