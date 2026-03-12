import { IFieldProps } from "@formosaic/core";
import { Select } from "antd";
import React from "react";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const MultiSelect = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, options, setFieldValue } = props;

  const selectedValues = (value as string[]) ?? [];

  const onChange = (vals: string[]) => {
    setFieldValue(fieldName, vals, false, 1500);
  };

  if (readOnly) {
    return selectedValues.length > 0 ? (
      <span className="fe-read-only-text">{selectedValues.join(", ")}</span>
    ) : (
      <span className="fe-read-only-text">-</span>
    );
  }

  const selectOptions = options?.map(option => ({
    value: String(option.value),
    label: option.label,
    disabled: option.disabled,
  }));

  return (
    <Select
      mode="multiple"
      className={FieldClassName("fe-multiselect", error)}
      value={selectedValues}
      onChange={onChange}
      options={selectOptions}
      status={error ? "error" : undefined}
      style={{ width: "100%" }}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default MultiSelect;
