import { IFieldProps } from "@formosaic/core";
import { Checkbox } from "baseui/checkbox";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

const CheckboxGroup = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, options, setFieldValue,
    errorCount, saving, savePending, optionsLoading, label, type, description, helpText, placeholder, config,
    ...rest
  } = props;

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
      role="group"
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      {options?.map(option => (
        <Checkbox
          key={String(option.value)}
          checked={selected.includes(String(option.value))}
          onChange={onChange(String(option.value))}
          disabled={option.disabled}
        >
          {option.label}
        </Checkbox>
      ))}
    </div>
  );
};

export default CheckboxGroup;
