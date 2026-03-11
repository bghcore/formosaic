import { IFieldProps, IDateRangeConfig, IDateRangeValue, formatDateRange } from "@form-eng/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const DateRange = (props: IFieldProps<IDateRangeConfig>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, config, setFieldValue } = props;

  const rangeValue = (value as IDateRangeValue | null) ?? { start: "", end: "" };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={formatDateRange(value)} />;
  }

  const dayjsValue: [dayjs.Dayjs | null, dayjs.Dayjs | null] = [
    rangeValue.start ? dayjs(rangeValue.start) : null,
    rangeValue.end ? dayjs(rangeValue.end) : null,
  ];

  const onChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (!dates) {
      setFieldValue(fieldName, { start: "", end: "" });
      return;
    }
    setFieldValue(fieldName, {
      start: dates[0]?.format("YYYY-MM-DD") ?? "",
      end: dates[1]?.format("YYYY-MM-DD") ?? "",
    });
  };

  return (
    <RangePicker
      className="fe-date-range"
      value={dayjsValue}
      onChange={onChange}
      status={error ? "error" : undefined}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    />
  );
};

export default DateRange;
