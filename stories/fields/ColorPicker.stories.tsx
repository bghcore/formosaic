import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ColorPickerField from "@formosaic/fluent/fields/ColorPicker";
import { FormDecorator, createFieldProps, FieldStoryWrapper } from "../helpers";

/**
 * **ColorPicker** renders a native `<input type="color">` with the selected hex value displayed.
 * Value type is `string` (hex color, e.g. `"#ff0000"`).
 */
const meta: Meta = {
  title: "Fields/Input/ColorPicker",
  decorators: [
    (Story) => (
      <FormDecorator defaultValues={{ storyField: "#000000" }}>
        <Story />
      </FormDecorator>
    ),
  ],
  argTypes: {
    value: { control: "color" },
    label: { control: "text" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;

const ColorPickerStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState((args.value as string) ?? "#000000");
  const props = createFieldProps({
    ...args,
    value,
    setFieldValue: (_name, val) => setValue(val as string),
  });
  return (
    <FieldStoryWrapper label={props.label} required={props.required}>
      <ColorPickerField {...props} />
    </FieldStoryWrapper>
  );
};

export const Default: StoryObj = {
  render: (args) => <ColorPickerStory {...args} />,
  args: {
    value: "#3b82f6",
    readOnly: false,
    required: false,
    label: "Brand Color",
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <ColorPickerStory {...args} />,
  args: {
    value: "#22c55e",
    readOnly: true,
    label: "Brand Color",
  },
};

export const Required: StoryObj = {
  render: (args) => <ColorPickerStory {...args} />,
  args: {
    value: "#000000",
    required: true,
    label: "Brand Color",
  },
};

export const WithError: StoryObj = {
  render: (args) => <ColorPickerStory {...args} />,
  args: {
    value: "",
    required: true,
    label: "Brand Color",
    error: { type: "required", message: "Please select a color" },
  },
};
