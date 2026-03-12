import { IFieldProps } from "@formosaic/core";
import { Radio } from "antd";
import type { RadioChangeEvent } from "antd";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

const RadioGroup = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, options, setFieldValue } = props;

  const onChange = (e: RadioChangeEvent) => {
    setFieldValue(fieldName, e.target.value);
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
      <Radio.Group value={value} onChange={onChange}>
        {options?.map(option => (
          <Radio key={String(option.value)} value={option.value} disabled={option.disabled}>
            {option.label}
          </Radio>
        ))}
      </Radio.Group>
    </div>
  );
};

export default RadioGroup;
