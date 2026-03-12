import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface ITextboxProps {
  ellipsifyTextCharacters?: number;
  placeHolder?: string;
  multiline?: boolean;
}

const Textbox = (props: IFieldProps<ITextboxProps>) => {
  const { fieldName, testId, value, readOnly, config, error, required, placeholder, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.target.value, false, 3000);
  };

  if (readOnly) {
    return (
      <ReadOnlyText
        fieldName={fieldName}
        value={value as string}
        ellipsifyTextCharacters={config?.ellipsifyTextCharacters}
      />
    );
  }

  return (
    <input
      type="text"
      className={FieldClassName("fe-textbox", error)}
      autoComplete="off"
      value={(value as string) ?? ""}
      onChange={onChange}
      placeholder={placeholder ?? config?.placeHolder}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default Textbox;
