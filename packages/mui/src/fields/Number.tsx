import { IFieldProps } from "@formosaic/core";
import { isNull } from "../helpers";
import { TextField } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const NumberField = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, config, error, required, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText, placeholder,
    ...rest
  } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const number = Number(event.target.value);
    if (!isNaN(number)) {
      setFieldValue(fieldName, number, false, 1500);
    }
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={!isNull(value) ? String(value) : undefined} />
  ) : (
    <TextField
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className={FieldClassName("fe-number", error)}
      autoComplete="off"
      type="number"
      value={!isNull(value) ? String(value) : ""}
      onChange={onChange}
      size="small"
      fullWidth
      error={!!error}
      inputProps={{
        "data-testid": GetFieldDataTestId(fieldName, testId),
      }}
    />
  );
};

export default NumberField;
