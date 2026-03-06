import { IFieldProps } from "@form-eng/core";
import { FormControl, Select, MenuItem, Chip, Box } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import React from "react";
import { useFormContext } from "react-hook-form";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const MultiSelect = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, options, setFieldValue } = props;

  const { watch } = useFormContext();
  const selectedOptions = (watch(`${fieldName}` as const) as string[]) ?? [];

  const onChange = (event: SelectChangeEvent<string[]>) => {
    const newValue = event.target.value;
    setFieldValue(fieldName, typeof newValue === "string" ? newValue.split(",") : newValue, false, 1500);
  };

  return readOnly ? (
    <>
      {value && (value as string[]).length > 0 ? (
        <Box className="fe-multi-select-read-only" sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {(value as string[]).map(v => (
            <Chip key={v} label={v} size="small" />
          ))}
        </Box>
      ) : null}
    </>
  ) : (
    <FormControl fullWidth size="small" error={!!error} required={required}>
      <Select
        className={FieldClassName("fe-multi-select", error)}
        multiple
        value={selectedOptions}
        onChange={onChange}
        aria-invalid={!!error}
        aria-required={required}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {(selected as string[]).map((val) => (
              <Chip key={val} label={val} size="small" />
            ))}
          </Box>
        )}
        data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
      >
        {options?.map(option => (
          <MenuItem key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MultiSelect;
