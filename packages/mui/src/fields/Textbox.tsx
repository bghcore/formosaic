import { IFieldProps } from "@formosaic/core";
import { TextField } from "@mui/material";
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
    <TextField
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className={FieldClassName("fe-textbox", error)}
      autoComplete="off"
      value={(value as string) ?? ""}
      onChange={onChange}
      size="small"
      fullWidth
      error={!!error}
      placeholder={placeholder ?? config?.placeHolder}
      inputProps={{
        "data-testid": GetFieldDataTestId(fieldName, testId),
      }}
    />
  );
};

export default Textbox;
