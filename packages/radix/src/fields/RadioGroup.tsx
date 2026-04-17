import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import * as RadixRadioGroup from "@radix-ui/react-radio-group";

const RadioGroup = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, options, setFieldValue,
    errorCount, saving, savePending, optionsLoading, label, type, description, helpText, placeholder, config,
    ...rest
  } = props;

  if (readOnly) {
    const label = options?.find(o => String(o.value) === String(value))?.label ?? (value as string);
    return <ReadOnlyText fieldName={fieldName} value={label} />;
  }

  return (
    <RadixRadioGroup.Root
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className="df-radio-group"
      value={value as string}
      onValueChange={(val) => setFieldValue(fieldName, val)}
      data-field-type="RadioGroup"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      {options?.map(option => (
        <label key={String(option.value)} className="df-radio-group__option">
          <RadixRadioGroup.Item
            className="df-radio-group__input"
            value={String(option.value)}
            disabled={option.disabled}
          >
            <RadixRadioGroup.Indicator className="df-radio-group__indicator" />
          </RadixRadioGroup.Item>
          <span className="df-radio-group__label">{option.label}</span>
        </label>
      ))}
    </RadixRadioGroup.Root>
  );
};

export default RadioGroup;
