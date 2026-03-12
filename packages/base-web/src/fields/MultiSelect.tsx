import { IFieldProps } from "@formosaic/core";
import { Select } from "baseui/select";
import type { OnChangeParams } from "baseui/select";
import React from "react";
import { GetFieldDataTestId } from "../helpers";

const MultiSelect = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, options, setFieldValue } = props;

  const selectedValues = (value as string[]) ?? [];

  const selectOptions = options?.map(option => ({
    id: String(option.value),
    label: option.label,
    disabled: option.disabled,
  })) ?? [];

  const selectedOptions = selectOptions.filter(o => selectedValues.includes(o.id));

  const onChange = (params: OnChangeParams) => {
    setFieldValue(fieldName, params.value.map(o => o.id), false, 1500);
  };

  if (readOnly) {
    return selectedValues.length > 0 ? (
      <span className="fe-read-only-text">{selectedValues.join(", ")}</span>
    ) : (
      <span className="fe-read-only-text">-</span>
    );
  }

  return (
    <Select
      multi
      options={selectOptions}
      value={selectedOptions}
      onChange={onChange}
      error={!!error}
      overrides={{
        Root: {
          props: {
            "aria-invalid": !!error,
            "aria-required": required,
            "data-testid": GetFieldDataTestId(fieldName, testId),
          },
        },
      }}
    />
  );
};

export default MultiSelect;
