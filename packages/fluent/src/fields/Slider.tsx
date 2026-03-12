import { IFieldProps } from "@formosaic/core";
import { Slider } from "@fluentui/react-components";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface ISliderProps {
  max?: number;
  min?: number;
  step?: number;
}

const SliderField = (props: IFieldProps<ISliderProps>) => {
  const { fieldName, testId, value, readOnly, config, error, required, setFieldValue } = props;

  const onChange = (_: unknown, data: { value: number }) => {
    setFieldValue(fieldName, data.value);
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={String(value)} />
  ) : (
    <Slider
      className={FieldClassName("fe-slider", error)}
      value={(value as number) ?? 0}
      onChange={onChange}
      max={config?.max}
      min={config?.min}
      step={config?.step}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default SliderField;
