import { IFieldProps, IDateRangeConfig, IDateRangeValue, formatDateRange } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const DateRange = (props: IFieldProps<IDateRangeConfig>) => {
  const {
    fieldName, testId, value, readOnly, error, required, config, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText, placeholder,
    ...rest
  } = props;

  const rangeValue = (value as IDateRangeValue | null) ?? { start: "", end: "" };
  const minDate = config?.minDate;
  const maxDate = config?.maxDate;

  const rangeError =
    rangeValue.start && rangeValue.end && rangeValue.start > rangeValue.end
      ? "Start date must be on or before end date."
      : undefined;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={formatDateRange(value)} />;
  }

  const onStartChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, { ...rangeValue, start: event.target.value });
  };

  const onEndChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, { ...rangeValue, end: event.target.value });
  };

  return (
    <div
      role="group"
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className="fe-date-range"
      data-field-type="DateRange"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      <div className="fe-date-range__inputs">
        <div className="fe-date-range__from">
          <label htmlFor={`${fieldName}-start`} className="fe-date-range__label">From</label>
          <input
            id={`${fieldName}-start`}
            type="date"
            className="fe-date-range__input fe-date-range__input--start"
            value={rangeValue.start}
            min={minDate}
            max={rangeValue.end || maxDate}
            onChange={onStartChange}
            aria-invalid={!!error}
            aria-required={required}
            aria-label="Start date"
          />
        </div>
        <div className="fe-date-range__to">
          <label htmlFor={`${fieldName}-end`} className="fe-date-range__label">To</label>
          <input
            id={`${fieldName}-end`}
            type="date"
            className="fe-date-range__input fe-date-range__input--end"
            value={rangeValue.end}
            min={rangeValue.start || minDate}
            max={maxDate}
            onChange={onEndChange}
            aria-label="End date"
          />
        </div>
      </div>
      {rangeError && (
        <span className="fe-date-range__range-error" role="alert">{rangeError}</span>
      )}
    </div>
  );
};

export default DateRange;
