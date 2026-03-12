import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

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
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      {options?.map(option => (
        <label key={String(option.value)}>
          <input
            type="checkbox"
            value={String(option.value)}
            checked={selected.includes(String(option.value))}
            onChange={onChange(String(option.value))}
            disabled={option.disabled}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
};

export default CheckboxGroup;
