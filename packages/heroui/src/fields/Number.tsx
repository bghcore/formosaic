import { IFieldProps } from "@formosaic/core";
import { isNull } from "../helpers";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const NumberField = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const number = Number(event.target.value);
    if (!isNaN(number)) {
      setFieldValue(fieldName, number, false, 1500);
    }
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={!isNull(value) ? String(value) : undefined} />;
  }

  return (
    <input
      type="number"
      className={FieldClassName("fe-number", error)}
      autoComplete="off"
      value={!isNull(value) ? String(value) : ""}
      onChange={onChange}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default NumberField;
