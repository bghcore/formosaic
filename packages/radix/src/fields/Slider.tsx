import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState, isNull } from "../helpers";
import * as RadixSlider from "@radix-ui/react-slider";

interface ISliderProps {
  max?: number;
  min?: number;
  step?: number;
}

const Slider = (props: IFieldProps<ISliderProps>) => {
  const {
    fieldName, testId, value, readOnly, config, error, required, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText, placeholder,
    ...rest
  } = props;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={!isNull(value) ? String(value) : undefined} />;
  }

  return (
    <div
      className="df-slider"
      data-field-type="Slider"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <RadixSlider.Root
        className="df-slider__root"
        value={[(value as number) ?? 0]}
        onValueChange={([num]) => setFieldValue(fieldName, num)}
        max={config?.max}
        min={config?.min}
        step={config?.step}
        aria-invalid={!!error}
        aria-required={required}
        {...rest}
        data-testid={GetFieldDataTestId(fieldName, testId)}
      >
        <RadixSlider.Track className="df-slider__track">
          <RadixSlider.Range className="df-slider__range" />
        </RadixSlider.Track>
        <RadixSlider.Thumb className="df-slider__thumb" />
      </RadixSlider.Root>
      <output className="df-slider__value">{String(value)}</output>
    </div>
  );
};

export default Slider;
