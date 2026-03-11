import { IFieldProps } from "@form-eng/core";
import React from "react";

const ReadOnlyRichText = (props: IFieldProps<{}>) => {
  const { value } = props;
  return (
    <div className="fe-read-only-rich-text" data-field-type="ReadOnlyRichText" data-field-state="readonly" dangerouslySetInnerHTML={{ __html: value as string || "" }} />
  );
};
export default ReadOnlyRichText;
