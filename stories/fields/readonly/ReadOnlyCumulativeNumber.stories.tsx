import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import ReadOnlyCumulativeNumber from "@formosaic/fluent/fields/readonly/ReadOnlyCumulativeNumber";
import { FormDecorator, createFieldProps, FieldStoryWrapper } from "../../helpers";

/**
 * **ReadOnlyCumulativeNumber** displays a computed sum of other numeric fields.
 * The fields to sum are specified in `config.dependencyFields` as a `string[]`.
 * The component watches the form state and recalculates automatically.
 */
const meta: Meta = {
  title: "Fields/Read-Only/ReadOnlyCumulativeNumber",
  decorators: [
    (Story) => (
      <FormDecorator
        defaultValues={{ hours1: 10, hours2: 20, hours3: 30, storyField: 0 }}
      >
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
  render: (args) => {
    const props = createFieldProps({
      ...args,
      config: { dependencyFields: ["hours1", "hours2", "hours3"] },
    });
    return (
      <FieldStoryWrapper label={props.label} required={props.required}>
        <div>
          <p style={{ color: "#666", fontSize: "13px", marginBottom: "8px" }}>
            Sums hours1 (10) + hours2 (20) + hours3 (30):
          </p>
          <ReadOnlyCumulativeNumber {...props} />
        </div>
      </FieldStoryWrapper>
    );
  },
  args: {
    label: "Total Hours",
  },
};
