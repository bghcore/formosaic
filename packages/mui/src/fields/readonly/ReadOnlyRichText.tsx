import { IFieldProps } from "@form-eng/core";
import React from "react";

const ReadOnlyRichText = (props: IFieldProps<{}>) => {
  const { value } = props;
  return (
    <div
      className="hook-read-only-rich-text-editor"
      dangerouslySetInnerHTML={{ __html: value as string || "" }}
    />
  );
};

export default ReadOnlyRichText;
