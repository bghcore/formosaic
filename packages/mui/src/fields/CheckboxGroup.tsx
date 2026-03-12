import { IFieldProps } from "@formosaic/core";
import { Checkbox, FormControl, FormControlLabel, FormGroup } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const CheckboxGroup = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, options, setFieldValue } = props;

  const selected = Array.isArray(value) ? (value as string[]) : [];

  const onChange = (optionValue: string) => (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const next = checked
      ? [...selected, optionValue]
      : selected.filter(v => v !== optionValue);
    setFieldValue(fieldName, next);
  };

  if (readOnly) {
    const labels = options
      ?.filter(o => selected.includes(String(o.value)))
      .map(o => o.label)
      .join(", ");
    return <ReadOnlyText fieldName={fieldName} value={labels ?? ""} />;
  }

  return (
    <FormControl
      error={!!error}
      required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      <FormGroup className={FieldClassName("fe-checkbox-group", error)}>
        {options?.map(option => (
          <FormControlLabel
            key={String(option.value)}
            label={option.label}
            disabled={option.disabled}
            control={
              <Checkbox
                checked={selected.includes(String(option.value))}
                onChange={onChange(String(option.value))}
              />
            }
          />
        ))}
      </FormGroup>
    </FormControl>
  );
};

export default CheckboxGroup;
