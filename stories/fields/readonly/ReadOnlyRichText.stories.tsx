import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import HookReadOnlyRichText from "@bghcore/dynamic-forms-fluent/fields/readonly/HookReadOnlyRichText";
import { FormDecorator, createFieldProps } from "../../helpers";

/**
 * **ReadOnlyRichText** renders HTML content using `dangerouslySetInnerHTML`.
 * Intended for displaying pre-sanitized rich text content stored in the form data.
 */
const meta: Meta = {
  title: "Fields/Read-Only/ReadOnlyRichText",
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
    const props = createFieldProps({ ...args });
    return <HookReadOnlyRichText {...props} />;
  },
  args: {
    value:
      "<h3>Project Summary</h3><p>This project involves <strong>three phases</strong>:</p><ul><li>Discovery</li><li>Development</li><li>Deployment</li></ul>",
    label: "Summary",
  },
};

export const PlainText: StoryObj = {
  render: (args) => {
    const props = createFieldProps({ ...args });
    return <HookReadOnlyRichText {...props} />;
  },
  args: {
    value: "Just a plain text string with no HTML formatting.",
    label: "Notes",
  },
};

export const Empty: StoryObj = {
  render: (args) => {
    const props = createFieldProps({ ...args });
    return <HookReadOnlyRichText {...props} />;
  },
  args: {
    value: "",
    label: "Content",
  },
};
