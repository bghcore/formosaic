import { IFieldProps } from "@formosaic/core";
import React from "react";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const MultiSelect = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, options, setFieldValue,
    errorCount, saving, savePending, optionsLoading, label, type, description, helpText, placeholder, config,
    ...rest
  } = props;

  const selectedValues = (value as string[]) ?? [];

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(event.target.selectedOptions, opt => opt.value);
    setFieldValue(fieldName, selected, false, 1500);
  };

  if (readOnly) {
    return selectedValues.length > 0 ? (
      <span className="fe-read-only-text">{selectedValues.join(", ")}</span>
    ) : (
      <span className="fe-read-only-text">-</span>
    );
  }

  return (
    <select
      multiple
      className={FieldClassName("fe-multiselect", error)}
      value={selectedValues}
      onChange={onChange}
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      {options?.map(option => (
        <option key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default MultiSelect;
