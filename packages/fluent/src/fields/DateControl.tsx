import { IFieldProps, FormStrings } from "@formosaic/core";
import { Input, Button } from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";
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
      <Input
        aria-invalid={!!error}
        aria-required={required}
        {...rest}
        className={FieldClassName("fe-date-control", error)}
        type="date"
        value={dateInputValue}
        onChange={onChange}
        data-testid={GetFieldDataTestId(fieldName, testId)}
      />
      <Button
        appearance="subtle"
        icon={<DismissRegular />}
        onClick={onClearDate}
        title={FormStrings.clickToClear}
        aria-label={`${fieldName} ${FormStrings.clear}`}
      />
      {error?.message && (
        <span className="fe-date-control-error" role="alert" style={{ color: "var(--colorPaletteRedForeground1, #bc2f32)", fontSize: "12px" }}>
          {error.message}
        </span>
      )}
    </div>
  );
};

export default DateControl;
