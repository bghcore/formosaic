import { IFieldProps } from "@formosaic/core";
import { Input } from "@fluentui/react-components";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface ITextboxProps {
  ellipsifyTextCharacters?: number;
  placeHolder?: string;
  multiline?: boolean;
}

const Textbox = (props: IFieldProps<ITextboxProps>) => {
  const {
    fieldName, testId, value, readOnly, config, error, required, placeholder, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText,
    ...rest
  } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.target.value, false, 3000);
  };

  return readOnly ? (
    <ReadOnlyText
      fieldName={fieldName}
      value={value as string}
      ellipsifyTextCharacters={config?.ellipsifyTextCharacters}
    />
  ) : (
    <Input
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className={FieldClassName("fe-textbox", error)}
      autoComplete="off"
      value={(value as string) ?? ""}
      onChange={onChange}
      placeholder={placeholder ?? config?.placeHolder}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default Textbox;
