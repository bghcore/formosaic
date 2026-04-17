import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface ITextareaProps {
  autoAdjustHeight?: boolean;
  numberOfRows?: number;
  ellipsifyTextCharacters?: number;
  maxLimit?: number;
  placeHolder?: string;
}

const Textarea = (props: IFieldProps<ITextareaProps>) => {
  const {
    fieldName, testId, value, readOnly, config, error, required, setFieldValue, placeholder,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText,
    ...rest
  } = props;

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
    <textarea
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className={FieldClassName("fe-textarea", error)}
      autoComplete="off"
      value={value ? `${value}` : ""}
      onChange={onChange}
      rows={config?.numberOfRows ?? 4}
      maxLength={config?.maxLimit}
      placeholder={placeholder ?? config?.placeHolder}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default Textarea;
