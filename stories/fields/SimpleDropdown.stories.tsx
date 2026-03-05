import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import HookSimpleDropdown from "@bghcore/dynamic-forms-fluent/fields/HookSimpleDropdown";
import { FormDecorator, createFieldProps } from "../helpers";

/**
 * **SimpleDropdown** renders a dropdown where options come from a plain
 * `string[]` in `config.dropdownOptions` instead of `IOption[]`.
 * Useful for simple enum-like selections.
 */
const meta: Meta = {
  title: "Fields/Selection/SimpleDropdown",
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
  },
};

export default meta;

const SimpleDropdownStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState(args.value ?? "");
  const props = createFieldProps({
    ...args,
    value,
    config: { dropdownOptions: ["Small", "Medium", "Large", "Extra Large"] },
    setFieldValue: (_name, val) => setValue(val as string),
  });
  return <HookSimpleDropdown {...props} />;
};

export const Default: StoryObj = {
  render: (args) => <SimpleDropdownStory {...args} />,
  args: {
    value: "Medium",
    readOnly: false,
    label: "Size",
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <SimpleDropdownStory {...args} />,
  args: {
    value: "Large",
    readOnly: true,
    label: "Size",
  },
};
