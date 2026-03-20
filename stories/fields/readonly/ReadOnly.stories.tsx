import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ReadOnly from "@formosaic/fluent/fields/readonly/ReadOnly";
import { FormDecorator, createFieldProps, FieldStoryWrapper } from "../../helpers";

/**
 * **ReadOnly** displays a plain text value. Supports optional text truncation
 * via `config.ellipsifyTextCharacters`.
 */
const meta: Meta = {
  title: "Fields/Read-Only/ReadOnly",
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
        <ReadOnly {...props} />
      </FieldStoryWrapper>
    );
  },
  args: {
    value: "John Doe",
    label: "Created By",
  },
};

export const LongText: StoryObj = {
  render: (args) => {
    const props = createFieldProps({ ...args });
    return (
      <FieldStoryWrapper label={props.label} required={props.required}>
        <ReadOnly {...props} />
      </FieldStoryWrapper>
    );
  },
  args: {
    value: "This is a very long text value that demonstrates how read-only fields display extended content without any truncation by default.",
    label: "Description",
  },
};

export const Truncated: StoryObj = {
  render: (args) => {
    const props = createFieldProps({
      ...args,
      config: { ellipsifyTextCharacters: 30 },
    });
    return (
      <FieldStoryWrapper label={props.label} required={props.required}>
        <ReadOnly {...props} />
      </FieldStoryWrapper>
    );
  },
  args: {
    value: "This is a very long text value that will be truncated after 30 characters.",
    label: "Description",
  },
};
