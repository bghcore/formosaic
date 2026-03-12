import { IFieldProps } from "@formosaic/core";
import { MultiSelect as MantineMultiSelect } from "@mantine/core";
import React from "react";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const MultiSelect = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, options, setFieldValue } = props;

  const selectedValues = (value as string[]) ?? [];

  const onChange = (val: string[]) => {
    setFieldValue(fieldName, val, false, 1500);
  };

  if (readOnly) {
    return selectedValues.length > 0 ? (
      <ul className="fe-multiselect-readonly">
        {selectedValues.map((v, i) => (
          <li key={i}>{v}</li>
        ))}
      </ul>
    ) : (
      <span className="fe-read-only-text">-</span>
    );
  }

  const data = options?.map(option => ({
    value: String(option.value),
    label: option.label,
    disabled: option.disabled,
  })) ?? [];

  return (
    <MantineMultiSelect
      className={FieldClassName("fe-multi-select", error)}
      value={selectedValues}
      onChange={onChange}
      data={data}
      clearable
      required={required}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default MultiSelect;
