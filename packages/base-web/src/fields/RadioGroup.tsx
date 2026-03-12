import { IFieldProps } from "@formosaic/core";
import { RadioGroup as BaseRadioGroup, Radio } from "baseui/radio";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

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
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      <BaseRadioGroup value={value as string} onChange={onChange} name={fieldName}>
        {options?.map(option => (
          <Radio key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
            {option.label}
          </Radio>
        ))}
      </BaseRadioGroup>
    </div>
  );
};

export default RadioGroup;
