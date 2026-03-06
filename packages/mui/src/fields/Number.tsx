import { IFieldProps, isNull } from "@form-eng/core";
import { TextField } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const NumberField = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, config, error, required, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const number = Number(event.target.value);
    if (!isNaN(number)) {
      setFieldValue(fieldName, number, false, 1500);
    }
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={String(value)} />
  ) : (
    <TextField
      className={FieldClassName("fe-number", error)}
      autoComplete="off"
      type="number"
      value={!isNull(value) ? String(value) : ""}
      onChange={onChange}
      size="small"
      fullWidth
      error={!!error}
      required={required}
      helperText={error?.message}
      inputProps={{
        "data-testid": GetFieldDataTestId(fieldName, programName, entityType, entityId),
      }}
    />
  );
};

export default NumberField;
