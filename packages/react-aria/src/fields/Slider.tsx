import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import { Slider as AriaSlider, SliderTrack, SliderThumb, SliderOutput } from "react-aria-components";

interface ISliderProps {
  max?: number;
  min?: number;
  step?: number;
}

const Slider = (props: IFieldProps<ISliderProps>) => {
  const { fieldName, testId, value, readOnly, config, error, required, setFieldValue } = props;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={String(value)} />;
  }

  return (
    <AriaSlider
      className="df-slider"
      value={(value as number) ?? 0}
      onChange={(num) => setFieldValue(fieldName, num)}
      maxValue={config?.max}
      minValue={config?.min}
      step={config?.step}
      data-field-type="Slider"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      <SliderTrack className="df-slider__track">
        <SliderThumb className="df-slider__thumb" />
      </SliderTrack>
      <SliderOutput className="df-slider__value" />
    </AriaSlider>
  );
};

export default Slider;
