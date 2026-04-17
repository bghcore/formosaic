import { IFieldProps, Dictionary } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

export interface IStatusDropdownProps {
  placeHolder?: string;
  statusColors?: Dictionary<string>;
}

const StatusDropdown = (props: IFieldProps<IStatusDropdownProps>) => {
  const {
    fieldName, testId, value, readOnly, error, required, config, options, placeholder, setFieldValue,
    errorCount, saving, savePending, optionsLoading, label, type, description, helpText,
    ...rest
  } = props;

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
        aria-invalid={!!error}
        aria-required={required}
        {...rest}
        className="df-status-dropdown__select"
        value={(value as string) ?? ""}
        onChange={onChange}
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
