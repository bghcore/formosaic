import { IFieldProps } from "@formosaic/core";
import { Checkbox } from "@fluentui/react-components";
import type { CheckboxOnChangeData } from "@fluentui/react-components";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const CheckboxGroup = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, options, setFieldValue } = props;

  const selected = Array.isArray(value) ? (value as string[]) : [];

  const onChange = (optionValue: string) => (_: React.ChangeEvent<HTMLInputElement>, data: CheckboxOnChangeData) => {
    const next = data.checked
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
      className={FieldClassName("fe-checkbox-group", error)}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      {options?.map(option => (
        <Checkbox
          key={String(option.value)}
          label={option.label}
          checked={selected.includes(String(option.value))}
          onChange={onChange(String(option.value))}
          disabled={option.disabled}
        />
      ))}
    </div>
  );
};

export default CheckboxGroup;
