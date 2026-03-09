import { IFieldProps } from "@form-eng/core";
import { FormControl, FormControlLabel, Radio, RadioGroup as MuiRadioGroup } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const RadioGroup = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, options, setFieldValue } = props;

  const onChange = (_: React.ChangeEvent<HTMLInputElement>, newValue: string) => {
    setFieldValue(fieldName, newValue);
  };

  if (readOnly) {
    const label = options?.find(o => String(o.value) === String(value))?.label ?? (value as string);
    return <ReadOnlyText fieldName={fieldName} value={label} />;
  }

  return (
    <FormControl error={!!error} required={required}>
      <MuiRadioGroup
        className={FieldClassName("fe-radio-group", error)}
        value={value ? String(value) : ""}
        onChange={onChange}
        aria-invalid={!!error}
        aria-required={required}
        data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
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
