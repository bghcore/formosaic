import { IFieldProps } from "@formosaic/core";
import React from "react";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const MultiSelect = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, options, setFieldValue } = props;

  const selectedValues = (value as string[]) ?? [];

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(event.target.selectedOptions, opt => opt.value);
    setFieldValue(fieldName, selected, false, 1500);
  };

  if (readOnly) {
    return selectedValues.length > 0 ? (
      <ul
        className="df-multiselect-readonly"
        data-field-type="MultiSelect"
        data-field-state="readonly"
      >
        {selectedValues.map((v, i) => (
          <li key={i}>{v}</li>
        ))}
      </ul>
    ) : (
      <span className="df-read-only-text">-</span>
    );
  }

  return (
    <select
      multiple
      className="df-multiselect"
      value={selectedValues}
      onChange={onChange}
      aria-invalid={!!error}
      aria-required={required}
      data-field-type="MultiSelect"
      data-field-state={getFieldState({ error, required, readOnly })}
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
