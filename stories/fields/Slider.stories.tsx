import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import HookSlider from "@bghcore/dynamic-forms-fluent/fields/HookSlider";
import { FormDecorator, createFieldProps } from "../helpers";

/**
 * **Slider** renders a range slider using Fluent UI's `<Slider>`.
 * Min, max, and step are configured via `config.min`, `config.max`, `config.step`.
 * In read-only mode it displays the numeric value as text.
 */
const meta: Meta = {
  title: "Fields/Controls/Slider",
  decorators: [
    (Story) => (
      <FormDecorator defaultValues={{ storyField: 50 }}>
        <Story />
      </FormDecorator>
    ),
  ],
  argTypes: {
    value: { control: "number" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;

const SliderStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState(args.value ?? 50);
  const props = createFieldProps({
    ...args,
    value,
    config: { min: 0, max: 100, step: 1, ...(args.config as object) },
    setFieldValue: (_name, val) => setValue(val as number),
  });
  return <HookSlider {...props} />;
};

export const Default: StoryObj = {
  render: (args) => <SliderStory {...args} />,
  args: {
    value: 50,
    readOnly: false,
    label: "Volume",
  },
};

export const CustomRange: StoryObj = {
  render: (args) => <SliderStory {...args} />,
  args: {
    value: 25,
    label: "Progress",
    config: { min: 0, max: 200, step: 5 },
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <SliderStory {...args} />,
  args: {
    value: 75,
    readOnly: true,
    label: "Volume",
  },
};
