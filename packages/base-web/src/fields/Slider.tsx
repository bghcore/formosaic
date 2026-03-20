import { IFieldProps } from "@formosaic/core";
import { Slider as BaseSlider } from "baseui/slider";
import type { Params as SliderParams } from "baseui/slider";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, isNull } from "../helpers";

interface ISliderProps {
  max?: number;
  min?: number;
  step?: number;
}

const Slider = (props: IFieldProps<ISliderProps>) => {
  const { fieldName, testId, value, readOnly, config, error, required, setFieldValue } = props;

  const onChange = (params: SliderParams) => {
    setFieldValue(fieldName, params.value[0]);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={!isNull(value) ? String(value) : undefined} />;
  }

  return (
    <div
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      <BaseSlider
        value={[(value as number) ?? 0]}
        onChange={onChange}
        max={config?.max}
        min={config?.min}
        step={config?.step}
      />
    </div>
  );
};

export default Slider;
