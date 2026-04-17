import { IFieldProps } from "@formosaic/core";
import { FormControl, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface IDropdownProps {
  placeHolder?: string;
  setDefaultKeyIfOnlyOneOption?: boolean;
}

const Dropdown = (props: IFieldProps<IDropdownProps>) => {
  const {
    fieldName, testId, value, readOnly, config, error, required, placeholder, options, setFieldValue,
    errorCount, saving, savePending, optionsLoading, label, type, description, helpText,
    ...rest
  } = props;

  const onChange = (event: SelectChangeEvent<string>) => {
    setFieldValue(fieldName, event.target.value);
  };

  React.useEffect(() => {
    if (!value && !readOnly && config?.setDefaultKeyIfOnlyOneOption && options?.length === 1) {
      setFieldValue(fieldName, String(options[0].value));
    }
  }, [options]);

  const selectedLabel = options?.find(o => String(o.value) === String(value))?.label;

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={selectedLabel ?? (value as string)} />
  ) : (
    <FormControl {...rest} fullWidth size="small" error={!!error} required={required}>
      <Select
        aria-invalid={!!error}
        aria-required={required}
        className={FieldClassName("fe-dropdown", error)}
        value={value ? String(value) : ""}
        onChange={onChange}
        displayEmpty
        data-testid={GetFieldDataTestId(fieldName, testId)}
      >
        {!value && (placeholder ?? config?.placeHolder) && (
          <MenuItem value="" disabled>{placeholder ?? config?.placeHolder}</MenuItem>
        )}
        {options?.map(option => (
          <MenuItem key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default Dropdown;
