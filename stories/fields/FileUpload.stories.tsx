import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import FileUploadField from "@formosaic/fluent/fields/FileUpload";
import { FormDecorator, createFieldProps, FieldStoryWrapper } from "../helpers";

/**
 * **FileUpload** lets users select one or more files for upload.
 * Value type is `File | File[] | null`.
 * Configure via `config.multiple` (default false), `config.accept` (MIME filter),
 * and `config.maxSizeMb` (default 10 MB).
 */
const meta: Meta = {
  title: "Fields/Input/FileUpload",
  decorators: [
    (Story) => (
      <FormDecorator defaultValues={{ storyField: null }}>
        <Story />
      </FormDecorator>
    ),
  ],
  argTypes: {
    label: { control: "text" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;

const FileUploadStory = (args: Record<string, unknown>) => {
  const [value, setValue] = useState<File | File[] | null>(null);
  const props = createFieldProps({
    ...args,
    value,
    setFieldValue: (_name, val) => setValue(val as File | File[] | null),
  });
  return (
    <FieldStoryWrapper label={props.label} required={props.required}>
      <FileUploadField {...props} />
    </FieldStoryWrapper>
  );
};

export const Default: StoryObj = {
  render: (args) => <FileUploadStory {...args} />,
  args: {
    readOnly: false,
    required: false,
    label: "Attachment",
    config: {},
  },
};

export const MultipleFiles: StoryObj = {
  render: (args) => <FileUploadStory {...args} />,
  args: {
    label: "Documents",
    config: { multiple: true },
  },
};

export const ImageOnly: StoryObj = {
  render: (args) => <FileUploadStory {...args} />,
  args: {
    label: "Profile Photo",
    config: { accept: "image/*" },
  },
};

export const WithSizeLimit: StoryObj = {
  render: (args) => <FileUploadStory {...args} />,
  args: {
    label: "Small File (max 1 MB)",
    config: { maxSizeMb: 1 },
  },
};

export const ReadOnly: StoryObj = {
  render: (args) => <FileUploadStory {...args} />,
  args: {
    value: null,
    readOnly: true,
    label: "Attachment",
    config: {},
  },
};

export const Required: StoryObj = {
  render: (args) => <FileUploadStory {...args} />,
  args: {
    required: true,
    label: "Required Document",
    config: {},
  },
};

export const WithError: StoryObj = {
  render: (args) => <FileUploadStory {...args} />,
  args: {
    required: true,
    label: "Attachment",
    error: { type: "required", message: "Please upload a file" },
    config: {},
  },
};
