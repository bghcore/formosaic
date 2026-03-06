import { IFieldProps } from "@bghcore/dynamic-forms-core";
import { FormControl, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface ISimpleDropdownProps {
  dropdownOptions?: string[];
  placeHolder?: string;
}

const SimpleDropdown = (props: IFieldProps<ISimpleDropdownProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, config, error, required, placeholder, setFieldValue } = props;

  const simpleOptions = config?.dropdownOptions ?? [];

  const onChange = (event: SelectChangeEvent<string>) => {
    setFieldValue(fieldName, event.target.value);
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={value as string} />
  ) : (
    <FormControl fullWidth size="small" error={!!error} required={required}>
      <Select
        className={FieldClassName("hook-dropdown", error)}
        value={(value as string) ?? ""}
        onChange={onChange}
        displayEmpty
        aria-required={required}
        data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
      >
        {!value && (placeholder ?? config?.placeHolder) && (
          <MenuItem value="" disabled>{placeholder ?? config?.placeHolder}</MenuItem>
        )}
        {simpleOptions.map(option => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SimpleDropdown;
