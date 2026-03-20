import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import PopOutEditor from "@formosaic/fluent/fields/PopOutEditor";
import { FormDecorator, createFieldProps, FieldStoryWrapper } from "../helpers";

/**
 * **Textarea** (PopOutEditor) renders a multi-line text area with an expand
 * button that opens a full-screen dialog for longer content editing.
 * Uses Fluent UI's `<Textarea>` and `<Dialog>`.
 */
const meta: Meta = {
  title: "Fields/Text Inputs/Textarea",
  decorators: [
    (Story) => (
      <FormDecorator defaultValues={{ storyField: "" }}>
        <Story />
      </FormDecorator>
    ),
  ],
  argTypes: {
    value: { control: "text" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
    label: { control: "text" },
  },
};

export default meta;

const TextareaStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState(args.value ?? "");
  const props = createFieldProps({
    ...args,
    value,
    setFieldValue: (_name, val) => setValue(val as string),
  });
  return (
    <FieldStoryWrapper label={props.label} required={props.required}>
      <PopOutEditor {...props} />
    </FieldStoryWrapper>
  );
};

export const Default: StoryObj = {
  render: (args) => <TextareaStory {...args} />,
  args: {
    value: "Some longer text content that might benefit from the pop-out editor.",
    readOnly: false,
    required: false,
    label: "Description",
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <TextareaStory {...args} />,
  args: {
    value: "This content cannot be edited.",
    readOnly: true,
    label: "Description",
  },
};

export const WithRowConfig: StoryObj = {
  render: (args) => <TextareaStory {...args} />,
  args: {
    value: "",
    label: "Notes",
    config: { numberOfRows: 8 },
  },
};
