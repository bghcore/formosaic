import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const CheckboxGroup = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, options, setFieldValue } = props;

  const selected = Array.isArray(value) ? (value as string[]) : [];

  const onChange = (optionValue: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.checked
      ? [...selected, optionValue]
      : selected.filter(v => v !== optionValue);
    setFieldValue(fieldName, next);
  };

  if (readOnly) {
    const labels = options
      ?.filter(o => selected.includes(String(o.value)))
      .map(o => o.label)
      .join(", ");
    return <ReadOnlyText fieldName={fieldName} value={labels ?? ""} />;
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "8px" }}
      aria-invalid={!!error}
      aria-required={required}
      data-field-type="CheckboxGroup"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      {options?.map(option => (
        <label
          key={String(option.value)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: option.disabled ? "not-allowed" : "pointer",
            opacity: option.disabled ? 0.5 : 1,
            fontSize: "var(--chakra-fontSizes-md, 16px)",
          }}
        >
          <input
            type="checkbox"
            value={String(option.value)}
            checked={selected.includes(String(option.value))}
            onChange={onChange(String(option.value))}
            disabled={option.disabled}
            style={{ accentColor: "var(--chakra-colors-blue-500, #3182CE)" }}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default CheckboxGroup;
