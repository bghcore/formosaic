import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const RadioGroup = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, options, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.target.value);
  };

  if (readOnly) {
    const label = options?.find(o => String(o.value) === String(value))?.label ?? (value as string);
    return <ReadOnlyText fieldName={fieldName} value={label} />;
  }

  return (
    <div
      role="radiogroup"
      style={{ display: "flex", flexDirection: "column", gap: "8px" }}
      aria-invalid={!!error}
      aria-required={required}
      data-field-type="RadioGroup"
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
            type="radio"
            name={fieldName}
            value={String(option.value)}
            checked={String(value) === String(option.value)}
            onChange={onChange}
            disabled={option.disabled}
            style={{ accentColor: "var(--chakra-colors-blue-500, #3182CE)" }}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default RadioGroup;
