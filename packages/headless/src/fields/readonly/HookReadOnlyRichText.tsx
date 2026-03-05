import { IFieldProps } from "@bghcore/dynamic-forms-core";
import React from "react";

const HookReadOnlyRichText = (props: IFieldProps<{}>) => {
  const { value } = props;
  return (
    <div
      className="df-read-only-rich-text"
      data-field-type="ReadOnlyRichText"
      data-field-state="readonly"
      dangerouslySetInnerHTML={{ __html: value as string || "" }}
    />
  );
};

export default HookReadOnlyRichText;
