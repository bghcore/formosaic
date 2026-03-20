import { IFieldProps } from "@formosaic/core";
import { isNull } from "../helpers";
import { NumberInput } from "@mantine/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const NumberField = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  const onChange = (val: number | string) => {
    // Mantine NumberInput passes number or empty string
    if (typeof val === "number") {
      setFieldValue(fieldName, val, false, 1500);
    } else if (val === "") {
      setFieldValue(fieldName, null, false, 1500);
    }
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={!isNull(value) ? String(value) : undefined} />;
  }

  return (
    <NumberInput
      className={FieldClassName("fe-number", error)}
      autoComplete="off"
      value={!isNull(value) ? (value as number) : ""}
      onChange={onChange}
      required={required}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default NumberField;
