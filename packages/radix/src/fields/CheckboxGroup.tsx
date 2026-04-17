import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import * as Checkbox from "@radix-ui/react-checkbox";

const CheckboxGroup = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, options, setFieldValue,
    errorCount, saving, savePending, optionsLoading, label, type, description, helpText, placeholder, config,
    ...rest
  } = props;

  const selected = Array.isArray(value) ? (value as string[]) : [];

  const onCheckedChange = (optionValue: string) => (checked: boolean | "indeterminate") => {
    const next = checked
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
      className="df-checkbox-group"
      data-field-type="CheckboxGroup"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      {options?.map(option => (
        <label key={String(option.value)} className="df-checkbox-group__option">
          <Checkbox.Root
            className="df-checkbox-group__input"
            checked={selected.includes(String(option.value))}
            onCheckedChange={onCheckedChange(String(option.value))}
            disabled={option.disabled}
          >
            <Checkbox.Indicator className="df-checkbox-group__indicator" />
          </Checkbox.Root>
          <span className="df-checkbox-group__label">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default CheckboxGroup;
