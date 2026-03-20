import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Fragment from "@formosaic/fluent/fields/DynamicFragment";
import { FormDecorator, createFieldProps, FieldStoryWrapper } from "../helpers";

/**
 * **DynamicFragment** renders a hidden input that holds a value without
 * any visible UI. Useful for tracking internal state (e.g., computed IDs,
 * parent references) that should be part of the form data but not shown.
 */
const meta: Meta = {
  title: "Fields/Compound/DynamicFragment",
  decorators: [
    (Story) => (
      <FormDecorator defaultValues={{ storyField: "" }}>
        <Story />
      </FormDecorator>
    ),
  ],
  argTypes: {
    label: { control: "text" },
  },
};

export default meta;

export const Default: StoryObj = {
  render: () => {
    const props = createFieldProps({
      value: "hidden-tracking-id-123",
      label: "Fragment",
    });
    return (
      <FieldStoryWrapper label={props.label} required={props.required}>
        <div>
          <p>
            The DynamicFragment renders a hidden input. Inspect the DOM to see it.
          </p>
          <Fragment {...props} />
        </div>
      </FieldStoryWrapper>
    );
  },
};
