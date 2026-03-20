import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ReadOnlyRichText from "@formosaic/fluent/fields/readonly/ReadOnlyRichText";
import { FormDecorator, createFieldProps, FieldStoryWrapper } from "../../helpers";

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
    label: { control: "text" },
  },
};

export default meta;

export const Default: StoryObj = {
  render: (args) => {
    const props = createFieldProps({ ...args });
    return (
      <FieldStoryWrapper label={props.label} required={props.required}>
        <ReadOnlyRichText {...props} />
      </FieldStoryWrapper>
    );
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
    return (
      <FieldStoryWrapper label={props.label} required={props.required}>
        <ReadOnlyRichText {...props} />
      </FieldStoryWrapper>
    );
  },
  args: {
    value: "Just a plain text string with no HTML formatting.",
    label: "Notes",
  },
};

export const Empty: StoryObj = {
  render: (args) => {
    const props = createFieldProps({ ...args });
    return (
      <FieldStoryWrapper label={props.label} required={props.required}>
        <ReadOnlyRichText {...props} />
      </FieldStoryWrapper>
    );
  },
  args: {
    value: "",
    label: "Content",
  },
};
