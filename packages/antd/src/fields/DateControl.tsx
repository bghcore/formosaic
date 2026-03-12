import { IFieldProps, FormStrings } from "@formosaic/core";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import React from "react";
import { FieldClassName, GetFieldDataTestId, formatDateTime } from "../helpers";

const DateControl = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  const onChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setFieldValue(fieldName, date.toISOString());
    } else {
      setFieldValue(fieldName, null);
    }
  };

  const dayjsValue = value ? dayjs(value as string) : null;

  if (readOnly) {
    return value ? (
      <span className="fe-read-only-date">{formatDateTime(value as string, { hideTimestamp: true })}</span>
    ) : (
      <span className="fe-read-only-text">-</span>
    );
  }

  return (
    <DatePicker
      className={FieldClassName("fe-date-control", error)}
      value={dayjsValue}
      onChange={onChange}
      allowClear
      status={error ? "error" : undefined}
      style={{ width: "100%" }}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default DateControl;
