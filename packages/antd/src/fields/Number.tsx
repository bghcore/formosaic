import { IFieldProps } from "@formosaic/core";
import { isNull } from "../helpers";
import { InputNumber } from "antd";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const NumberField = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText, placeholder, config,
    ...rest
  } = props;

  const onChange = (val: number | null) => {
    setFieldValue(fieldName, val, false, 1500);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={!isNull(value) ? String(value) : undefined} />;
  }

  return (
    <InputNumber
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className={FieldClassName("fe-number", error)}
      autoComplete="off"
      value={!isNull(value) ? (value as number) : null}
      onChange={onChange}
      status={error ? "error" : undefined}
      style={{ width: "100%" }}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default NumberField;
