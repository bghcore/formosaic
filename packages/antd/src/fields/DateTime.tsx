import { IFieldProps, IDateTimeConfig, formatDateTimeValue } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const DateTime = (props: IFieldProps<IDateTimeConfig>) => {
  const {
    fieldName, testId, value, readOnly, error, required, config, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText, placeholder,
    ...rest
  } = props;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={formatDateTimeValue(value)} />;
  }

  const dayjsValue = value ? dayjs(value as string) : null;

  const onChange = (date: dayjs.Dayjs | null) => {
    setFieldValue(fieldName, date ? date.toISOString() : null);
  };

  return (
    <DatePicker
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className="fe-date-time"
      showTime
      value={dayjsValue}
      onChange={onChange}
      status={error ? "error" : undefined}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default DateTime;
