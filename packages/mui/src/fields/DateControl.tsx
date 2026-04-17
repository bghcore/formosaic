import { IFieldProps, FormStrings } from "@formosaic/core";
import { TextField, IconButton } from "@mui/material";
import React from "react";
import { FieldClassName, GetFieldDataTestId, formatDateTime } from "../helpers";

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

  const onClearDate = () => {
    setFieldValue(fieldName, null);
  };

  const dateInputValue = value ? new Date(value as string).toISOString().split("T")[0] : "";

  return readOnly ? (
    <>
      {value ? (
        <span className="fe-read-only-date">{formatDateTime(value as string, { hideTimestamp: true })}</span>
      ) : (
        <>-</>
      )}
    </>
  ) : (
    <div className="fe-date-control-container" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      <TextField
        aria-invalid={!!error}
        aria-required={required}
        {...rest}
        className={FieldClassName("fe-date-control", error)}
        type="date"
        value={dateInputValue}
        onChange={onChange}
        size="small"
        fullWidth
        error={!!error}
        helperText={error?.message}
        InputLabelProps={{ shrink: true }}
        inputProps={{
          "data-testid": GetFieldDataTestId(fieldName, testId),
        }}
      />
      <IconButton
        size="small"
        onClick={onClearDate}
        title={FormStrings.clickToClear}
        aria-label={`${fieldName} ${FormStrings.clear}`}
      >
        &#10005;
      </IconButton>
    </div>
  );
};

export default DateControl;
