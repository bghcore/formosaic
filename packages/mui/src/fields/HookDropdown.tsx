import { IHookFieldSharedProps } from "@bghcore/dynamic-forms-core";
import { FormControl, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface IHookDropdownProps {
  placeHolder?: string;
  setDefaultKeyIfOnlyOneOption?: boolean;
}

const HookDropdown = (props: IHookFieldSharedProps<IHookDropdownProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, meta, error, dropdownOptions, setFieldValue } = props;

  const onChange = (event: SelectChangeEvent<string>) => {
    setFieldValue(fieldName, event.target.value);
  };

  React.useEffect(() => {
    if (!value && !readOnly && meta?.setDefaultKeyIfOnlyOneOption && dropdownOptions?.length === 1) {
      setFieldValue(fieldName, String(dropdownOptions[0].key));
    }
  }, [dropdownOptions]);

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={value as string} />
  ) : (
    <FormControl fullWidth size="small" error={!!error}>
      <Select
        className={FieldClassName("hook-dropdown", error)}
        value={value ? String(value) : ""}
        onChange={onChange}
        displayEmpty
        data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
      >
        {dropdownOptions?.map(option => (
          <MenuItem key={String(option.key)} value={String(option.key)} disabled={option.disabled}>
            {option.text}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default HookDropdown;
