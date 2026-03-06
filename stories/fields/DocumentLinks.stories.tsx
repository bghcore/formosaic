import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import DocumentLinksField from "@form-eng/fluent/fields/DocumentLinks";
import { FormDecorator, createFieldProps } from "../helpers";

/**
 * **DocumentLinks** renders a list of named URL links with add/edit/delete
 * controls. In read-only mode the links are shown without editing controls.
 */
const meta: Meta = {
  title: "Fields/Compound/DocumentLinks",
  decorators: [
    (Story) => (
      <FormDecorator
        defaultValues={{
          storyField: [
            { name: "Design Spec", url: "https://example.com/design" },
            { name: "API Docs", url: "https://example.com/api" },
          ],
        }}
      >
        <Story />
      </FormDecorator>
    ),
  ],
  argTypes: {
    readOnly: { control: "boolean" },
  },
};

export default meta;

const sampleLinks = [
  { name: "Design Spec", url: "https://example.com/design" },
  { name: "API Docs", url: "https://example.com/api" },
];

const DocumentLinksStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState(args.value ?? sampleLinks);
  const props = createFieldProps({
    ...args,
    value,
    setFieldValue: (_name, val) => setValue(val as typeof sampleLinks),
  });
  return <DocumentLinksField {...props} />;
};

export const Default: StoryObj = {
  render: (args) => <DocumentLinksStory {...args} />,
  args: {
    value: sampleLinks,
    readOnly: false,
    label: "Documents",
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <DocumentLinksStory {...args} />,
  args: {
    value: sampleLinks,
    readOnly: true,
    label: "Documents",
  },
};

export const Empty: StoryObj = {
  render: (args) => <DocumentLinksStory {...args} />,
  args: {
    value: [],
    label: "Documents",
  },
};
