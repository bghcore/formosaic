import { IFieldProps } from "@formosaic/core";
import { isNull } from "../helpers";
import { Input } from "@fluentui/react-components";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const NumberField = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, config, error, required, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const number = Number(event.target.value);
    if (!isNaN(number)) {
      setFieldValue(fieldName, number, false, 1500);
    }
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={String(value)} />
  ) : (
    <Input
      className={FieldClassName("fe-number", error)}
      autoComplete="off"
      type="number"
      value={!isNull(value) ? String(value) : ""}
      onChange={onChange}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default NumberField;
