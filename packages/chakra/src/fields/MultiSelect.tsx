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
        style={{ listStyle: "none", padding: 0, margin: 0 }}
        data-field-type="MultiSelect"
        data-field-state="readonly"
      >
        {selectedValues.map((v, i) => (
          <li key={i} style={{ padding: "2px 0" }}>{v}</li>
        ))}
      </ul>
    ) : (
      <span className="fe-read-only-text">-</span>
    );
  }

  return (
    <select
      multiple
      style={{
        width: "100%",
        minHeight: "80px",
        padding: "8px",
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: error ? "var(--chakra-colors-red-500, #E53E3E)" : "var(--chakra-colors-gray-200, #E2E8F0)",
        borderRadius: "var(--chakra-radii-md, 6px)",
        fontSize: "var(--chakra-fontSizes-md, 16px)",
        background: "var(--chakra-colors-white, #FFFFFF)",
      }}
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
