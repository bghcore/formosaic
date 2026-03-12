import { IFieldProps } from "@formosaic/core";
import React from "react";
import { formatDateTime, GetFieldDataTestId } from "../helpers";

const DateControl = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(event.target.value);
    if (!isNaN(date.getTime())) {
      setFieldValue(fieldName, date.toISOString());
    } else {
      setFieldValue(fieldName, null);
    }
  };

  const dateInputValue = value ? new Date(value as string).toISOString().split("T")[0] : "";

  if (readOnly) {
    return value ? (
      <span className="fe-read-only-date">{formatDateTime(value as string, { hideTimestamp: true })}</span>
    ) : (
      <span className="fe-read-only-text">-</span>
    );
  }

  return (
    <input
      type="date"
      value={dateInputValue}
      onChange={onChange}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default DateControl;
