import { IFieldProps, Dictionary } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

export interface IStatusDropdownProps {
  placeHolder?: string;
  statusColors?: Dictionary<string>;
}

const StatusDropdown = (props: IFieldProps<IStatusDropdownProps>) => {
  const { fieldName, testId, value, readOnly, error, required, config, options, placeholder, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setFieldValue(fieldName, event.target.value);
  };

  const statusColor = config?.statusColors?.[value as string];

  if (readOnly) {
    return (
      <div
        className="fe-status-dropdown fe-status-dropdown--readonly"
        data-field-type="StatusDropdown"
        data-field-state="readonly"
      >
        {statusColor && (
          <span
            className="fe-status-dropdown__indicator"
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
      className="fe-status-dropdown"
      data-field-type="StatusDropdown"
    >
      {statusColor && (
        <span
          className="fe-status-dropdown__indicator"
          style={{ backgroundColor: statusColor }}
          aria-hidden="true"
        />
      )}
      <select
        className="fe-status-dropdown__select"
        value={(value as string) ?? ""}
        onChange={onChange}
        aria-invalid={!!error}
        aria-required={required}
        data-testid={GetFieldDataTestId(fieldName, testId)}
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
