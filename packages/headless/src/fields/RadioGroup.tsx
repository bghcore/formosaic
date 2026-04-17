import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const RadioGroup = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, options, setFieldValue,
    errorCount, saving, savePending, optionsLoading, label, type, description, helpText, placeholder, config,
    ...rest
  } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.target.value);
  };

  if (readOnly) {
    const optLabel = options?.find(o => String(o.value) === String(value))?.label ?? (value as string);
    return <ReadOnlyText fieldName={fieldName} value={optLabel} />;
  }

  return (
    <div
      role="radiogroup"
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className="df-radio-group"
      data-field-type="RadioGroup"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      {options?.map(option => (
        <label key={String(option.value)} className="df-radio-group__option">
          <input
            type="radio"
            className="df-radio-group__input"
            name={fieldName}
            value={String(option.value)}
            checked={String(value) === String(option.value)}
            onChange={onChange}
            disabled={option.disabled}
          />
          <span className="df-radio-group__label">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default RadioGroup;
