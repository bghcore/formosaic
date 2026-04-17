import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import { TextField, Input } from "react-aria-components";

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
    <TextField
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className="df-textbox"
      value={(value as string) ?? ""}
      onChange={(val) => setFieldValue(fieldName, val, false, 3000)}
      isInvalid={!!error}
      isRequired={required}
      data-field-type="Textbox"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <Input
        autoComplete="off"
        placeholder={placeholder ?? config?.placeHolder}
        data-testid={GetFieldDataTestId(fieldName, testId)}
      />
    </TextField>
  );
};

export default Textbox;
