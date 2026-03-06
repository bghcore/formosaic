import { IFieldProps, Dictionary } from "@form-eng/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

export interface IStatusDropdownProps {
  placeHolder?: string;
  statusColors?: Dictionary<string>;
}

const StatusDropdown = (props: IFieldProps<IStatusDropdownProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, config, options, placeholder, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFieldValue(fieldName, event.target.value);
  };

  const statusColor = config?.statusColors?.[value as string];

  if (readOnly) {
    return (
      <div
        className="df-status-dropdown df-status-dropdown--readonly"
        data-field-type="StatusDropdown"
        data-field-state="readonly"
      >
        {statusColor && (
          <span
            className="df-status-dropdown__indicator"
            style={{ backgroundColor: statusColor }}
            aria-hidden="true"
          />
        )}
        <ReadOnlyText fieldName={fieldName} value={value as string} />
      </div>
    );
  }

  return (
    <div
      className="df-status-dropdown"
      data-field-type="StatusDropdown"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      {statusColor && (
        <span
          className="df-status-dropdown__indicator"
          style={{ backgroundColor: statusColor }}
          aria-hidden="true"
        />
      )}
      <select
        className="df-status-dropdown__select"
        value={(value as string) ?? ""}
        onChange={onChange}
        aria-invalid={!!error}
        aria-required={required}
        data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
      >
        <option value="">{placeholder ?? config?.placeHolder ?? ""}</option>
        {options?.map(option => (
          <option key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StatusDropdown;
