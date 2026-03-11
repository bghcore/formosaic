import { IFieldProps, IDateTimeConfig, formatDateTimeValue } from "@form-eng/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const DateTime = (props: IFieldProps<IDateTimeConfig>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, config, setFieldValue } = props;

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
      className="ak-date-time"
      data-field-type="DateTime"
      data-field-state={getFieldState({ error, required, readOnly })}
      value={(value as string) ?? ""}
      min={minDateTime}
      max={maxDateTime}
      onChange={onChange}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    />
  );
};

export default DateTime;
