import { IFieldProps, IDateTimeConfig, formatDateTimeValue } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const DateTime = (props: IFieldProps<IDateTimeConfig>) => {
  const { fieldName, testId, value, readOnly, error, required, config, setFieldValue } = props;

  const minDateTime = config?.minDateTime;
  const maxDateTime = config?.maxDateTime;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={formatDateTimeValue(value)} />;
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.target.value || null);
  };

  return (
    <input
      type="datetime-local"
      className={FieldClassName("fe-date-time", error)}
      value={(value as string) ?? ""}
      min={minDateTime}
      max={maxDateTime}
      onChange={onChange}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default DateTime;
