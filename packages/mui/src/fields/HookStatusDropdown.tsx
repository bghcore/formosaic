import { IHookFieldSharedProps, Dictionary } from "@bghcore/dynamic-forms-core";
import { FormControl, Select, MenuItem, Chip } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

export interface IHookStatusDropdownProps {
  placeHolder?: string;
  statusColors?: Dictionary<string>;
}

const StatusDot = ({ color }: { color?: string }) => (
  <span
    className="status-color"
    style={{
      display: "inline-block",
      backgroundColor: color || "transparent",
      width: "12px",
      height: "12px",
      borderRadius: "50%",
      flexShrink: 0,
      marginRight: "8px",
    }}
  />
);

const HookStatusDropdown = (props: IHookFieldSharedProps<IHookStatusDropdownProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, meta, dropdownOptions, setFieldValue } = props;

  const statusColors = (meta?.statusColors ?? {}) as Dictionary<string>;

  const onChange = (event: SelectChangeEvent<string>) => {
    setFieldValue(fieldName, event.target.value);
  };

  return readOnly ? (
    <div className="hook-read-only-status-dropdown" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <StatusDot color={statusColors && value ? statusColors[value as string] : undefined} />
      <ReadOnlyText fieldName={fieldName} value={value as string} />
    </div>
  ) : (
    <div className={FieldClassName("hook-status-dropdown", error)} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <StatusDot color={statusColors && value ? statusColors[value as string] : undefined} />
      <FormControl fullWidth size="small" error={!!error}>
        <Select
          value={value ? String(value) : ""}
          onChange={onChange}
          displayEmpty
          data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
          renderValue={(selected) => {
            const option = dropdownOptions?.find(o => String(o.key) === selected);
            return option?.text ?? "";
          }}
        >
          {dropdownOptions?.map(option => (
            <MenuItem key={String(option.key)} value={String(option.key)} disabled={option.disabled}>
              <StatusDot color={statusColors[String(option.key)]} />
              {option.text}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default HookStatusDropdown;
