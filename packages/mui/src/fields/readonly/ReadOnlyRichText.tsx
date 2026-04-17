import { IFieldProps } from "@formosaic/core";
import React from "react";
import { sanitizeHtml } from "../../helpers";

interface IReadOnlyRichTextConfig {
  sanitize?: (html: string) => string;
}

const ReadOnlyRichText = (props: IFieldProps<IReadOnlyRichTextConfig>) => {
  const { value, config } = props;
  const raw = typeof value === "string" ? value : "";
  const sanitized =
    typeof config?.sanitize === "function" ? config.sanitize(raw) : sanitizeHtml(raw);
  return (
    <div
      className="fe-read-only-rich-text-editor"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

export default ReadOnlyRichText;
