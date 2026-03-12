import { IFieldProps } from "@formosaic/core";
import { Checkbox } from "antd";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

const CheckboxGroup = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, options, setFieldValue } = props;

  const selected = Array.isArray(value) ? (value as string[]) : [];

  const onChange = (checkedValues: string[]) => {
    setFieldValue(fieldName, checkedValues);
  };

  if (readOnly) {
    const labels = options
      ?.filter(o => selected.includes(String(o.value)))
      .map(o => o.label)
      .join(", ");
    return <ReadOnlyText fieldName={fieldName} value={labels ?? ""} />;
  }

  const checkboxOptions = options?.map(option => ({
    label: option.label,
    value: String(option.value),
    disabled: option.disabled,
  }));

  return (
    <div
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      <Checkbox.Group
        value={selected}
        onChange={onChange}
        options={checkboxOptions}
      />
    </div>
  );
};

export default CheckboxGroup;
