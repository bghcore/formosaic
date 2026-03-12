import { IFieldProps, IDateTimeConfig, formatDateTimeValue } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";
import { DateTimePicker } from "@mantine/dates";

const DateTime = (props: IFieldProps<IDateTimeConfig>) => {
  const { fieldName, testId, value, readOnly, error, required, config, setFieldValue } = props;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={formatDateTimeValue(value)} />;
  }

  const dateValue = value ? new Date(value as string) : null;

  const onChange = (date: Date | null) => {
    setFieldValue(fieldName, date ? date.toISOString() : null);
  };

  return (
    <DateTimePicker
      className="fe-date-time"
      value={dateValue}
      onChange={onChange}
      error={!!error}
      required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default DateTime;
