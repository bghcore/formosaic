import { IFieldProps, FormStrings } from "@formosaic/core";
import { Input } from "@chakra-ui/react";
import React from "react";
import { GetFieldDataTestId, getFieldState, formatDateTime } from "../helpers";

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
        data-field-type="DateControl"
        data-field-state="readonly"
      >
        {formatDateTime(value as string, { hideTimestamp: true })}
      </time>
    ) : (
      <span className="fe-read-only-text">-</span>
    );
  }

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: "8px" }}
      data-field-type="DateControl"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <Input
        type="date"
        value={dateInputValue}
        onChange={onChange}
        aria-invalid={!!error}
        aria-required={required}
        {...rest}
        data-testid={GetFieldDataTestId(fieldName, testId)}
      />
      <button
        type="button"
        onClick={onClear}
        title={FormStrings.clickToClear}
        aria-label={`${fieldName} ${FormStrings.clear}`}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          color: "var(--chakra-colors-gray-500, #718096)",
          padding: "4px 8px",
        }}
      >
        &times;
      </button>
    </div>
  );
};

export default DateControl;
