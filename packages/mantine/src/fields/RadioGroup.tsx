import { IFieldProps } from "@formosaic/core";
import { Radio, Group } from "@mantine/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

const RadioGroup = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, options, setFieldValue } = props;

  const onChange = (val: string) => {
    setFieldValue(fieldName, val);
  };

  if (readOnly) {
    const label = options?.find(o => String(o.value) === String(value))?.label ?? (value as string);
    return <ReadOnlyText fieldName={fieldName} value={label} />;
  }

  return (
    <Radio.Group
      className="fe-radio-group"
      value={value ? String(value) : ""}
      onChange={onChange}
      required={required}
      aria-invalid={!!error}
      aria-required={required}
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
