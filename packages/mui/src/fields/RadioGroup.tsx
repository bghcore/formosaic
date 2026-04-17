import { IFieldProps } from "@formosaic/core";
import { FormControl, FormControlLabel, Radio, RadioGroup as MuiRadioGroup } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const RadioGroup = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, options, setFieldValue,
    errorCount, saving, savePending, optionsLoading, label, type, description, helpText, placeholder, config,
    ...rest
  } = props;

  const onChange = (_: React.ChangeEvent<HTMLInputElement>, newValue: string) => {
    setFieldValue(fieldName, newValue);
  };

  if (readOnly) {
    const optLabel = options?.find(o => String(o.value) === String(value))?.label ?? (value as string);
    return <ReadOnlyText fieldName={fieldName} value={optLabel} />;
  }

  return (
    <FormControl {...rest} error={!!error} required={required}>
      <MuiRadioGroup
        aria-invalid={!!error}
        aria-required={required}
        className={FieldClassName("fe-radio-group", error)}
        value={value ? String(value) : ""}
        onChange={onChange}
        data-testid={GetFieldDataTestId(fieldName, testId)}
      >
        {options?.map(option => (
          <FormControlLabel
            key={String(option.value)}
            value={String(option.value)}
            label={option.label}
            disabled={option.disabled}
            control={<Radio />}
          />
        ))}
      </MuiRadioGroup>
    </FormControl>
  );
};

export default RadioGroup;
