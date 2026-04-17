import { IFieldProps } from "@formosaic/core";
import { Radio, Group } from "@mantine/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

const RadioGroup = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, options, setFieldValue,
    errorCount, saving, savePending, optionsLoading, label, type, description, helpText, placeholder, config,
    ...rest
  } = props;

  const onChange = (val: string) => {
    setFieldValue(fieldName, val);
  };

  if (readOnly) {
    const optLabel = options?.find(o => String(o.value) === String(value))?.label ?? (value as string);
    return <ReadOnlyText fieldName={fieldName} value={optLabel} />;
  }

  return (
    <Radio.Group
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className="fe-radio-group"
      value={value ? String(value) : ""}
      onChange={onChange}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      <Group mt="xs">
        {options?.map(option => (
          <Radio
            key={String(option.value)}
            value={String(option.value)}
            label={option.label}
            disabled={option.disabled}
          />
        ))}
      </Group>
    </Radio.Group>
  );
};

export default RadioGroup;
