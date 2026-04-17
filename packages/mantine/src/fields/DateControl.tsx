import { IFieldProps, FormStrings } from "@formosaic/core";
import React from "react";
import { GetFieldDataTestId, formatDateTime } from "../helpers";

const DateControl = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText, placeholder, config,
    ...rest
  } = props;

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
        className="fe-read-only-date"
        dateTime={value as string}
      >
        {formatDateTime(value as string, { hideTimestamp: true })}
      </time>
    ) : (
      <span className="fe-read-only-text">-</span>
    );
  }

  return (
    <div className="fe-date-control">
      <input
        aria-invalid={!!error}
        aria-required={required}
        {...rest}
        type="date"
        className="fe-date-control__input"
        value={dateInputValue}
        onChange={onChange}
        data-testid={GetFieldDataTestId(fieldName, testId)}
      />
      <button
        type="button"
        className="fe-date-control__clear"
        onClick={onClear}
        title={FormStrings.clickToClear}
        aria-label={`${fieldName} ${FormStrings.clear}`}
      >
        &times;
      </button>
    </div>
  );
};

export default DateControl;
