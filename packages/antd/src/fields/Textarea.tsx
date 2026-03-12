import { IFieldProps } from "@formosaic/core";
import { Input } from "antd";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface ITextareaProps {
  autoAdjustHeight?: boolean;
  numberOfRows?: number;
  ellipsifyTextCharacters?: number;
  maxLimit?: number;
}

const Textarea = (props: IFieldProps<ITextareaProps>) => {
  const { fieldName, testId, value, readOnly, config, error, required, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFieldValue(fieldName, event.target.value, false, 3000);
  };

  if (readOnly) {
    return (
      <ReadOnlyText
        fieldName={fieldName}
        value={value ? `${value}` : ""}
        ellipsifyTextCharacters={config?.ellipsifyTextCharacters}
      />
    );
  }

  return (
    <Input.TextArea
      className={FieldClassName("fe-textarea", error)}
      autoComplete="off"
      value={value ? `${value}` : ""}
      onChange={onChange}
      rows={config?.numberOfRows ?? 4}
      autoSize={config?.autoAdjustHeight ? { minRows: config?.numberOfRows ?? 4 } : undefined}
      maxLength={config?.maxLimit}
      showCount={!!config?.maxLimit}
      status={error ? "error" : undefined}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default Textarea;
