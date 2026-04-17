import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import { RadioGroup as AriaRadioGroup, Radio } from "react-aria-components";

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
    <AriaRadioGroup
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className="df-radio-group"
      value={(value as string) ?? ""}
      onChange={(val) => setFieldValue(fieldName, val)}
      isInvalid={!!error}
      isRequired={required}
      data-field-type="RadioGroup"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      {options?.map(option => (
        <Radio
          key={String(option.value)}
          value={String(option.value)}
          className="df-radio-group__option"
          isDisabled={option.disabled}
        >
          {option.label}
        </Radio>
      ))}
    </AriaRadioGroup>
  );
};

export default RadioGroup;
