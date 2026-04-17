import { IFieldProps } from "@formosaic/core";
import { Radio, RadioGroup as FluentRadioGroup } from "@fluentui/react-components";
import type { RadioGroupOnChangeData } from "@fluentui/react-components";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const RadioGroup = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, options, setFieldValue,
    errorCount, saving, savePending, optionsLoading, label, type, description, helpText, placeholder, config,
    ...rest
  } = props;

  const onChange = (_: React.FormEvent<HTMLDivElement>, data: RadioGroupOnChangeData) => {
    setFieldValue(fieldName, data.value);
  };

  if (readOnly) {
    const optLabel = options?.find(o => String(o.value) === String(value))?.label ?? (value as string);
    return <ReadOnlyText fieldName={fieldName} value={optLabel} />;
  }

  return (
    <FluentRadioGroup
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className={FieldClassName("fe-radio-group", error)}
      value={value ? String(value) : ""}
      onChange={onChange}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      {options?.map(option => (
        <Radio
          key={String(option.value)}
          value={String(option.value)}
          label={option.label}
          disabled={option.disabled}
        />
      ))}
    </FluentRadioGroup>
  );
};

export default RadioGroup;
