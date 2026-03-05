import { IFieldProps, FormStrings } from "@bghcore/dynamic-forms-core";
import React from "react";
import { GetFieldDataTestId, getFieldState, formatDateTime } from "../helpers";

const HookDateControl = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value);
    if (!isNaN(date.getTime())) {
      setFieldValue(fieldName, date.toISOString());
    }
  };

  const onClear = () => {
    setFieldValue(fieldName, null);
  };

  const dateInputValue = value ? new Date(value as string).toISOString().split("T")[0] : "";

  if (readOnly) {
    return value ? (
      <time
        className="df-read-only-date"
        dateTime={value as string}
        data-field-type="DateControl"
        data-field-state="readonly"
      >
        {formatDateTime(value as string, { hideTimestamp: true })}
      </time>
    ) : (
      <span className="df-read-only-text">-</span>
    );
  }

  return (
    <div
      className="df-date-control"
      data-field-type="DateControl"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <input
        type="date"
        className="df-date-control__input"
        value={dateInputValue}
        onChange={onChange}
        aria-invalid={!!error}
        aria-required={required}
        data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
      />
      <button
        type="button"
        className="df-date-control__clear"
        onClick={onClear}
        title={FormStrings.clickToClear}
        aria-label={`${fieldName} ${FormStrings.clear}`}
      >
        &times;
      </button>
    </div>
  );
};

export default HookDateControl;
