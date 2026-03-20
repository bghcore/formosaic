import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState, isNull } from "../helpers";

interface ISliderProps {
  max?: number;
  min?: number;
  step?: number;
}

const Slider = (props: IFieldProps<ISliderProps>) => {
  const { fieldName, testId, value, readOnly, config, error, required, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, Number(event.target.value));
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={!isNull(value) ? String(value) : undefined} />;
  }

  return (
    <div
      className="ak-slider"
      data-field-type="Slider"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <input
        type="range"
        className="ak-slider__input"
        value={(value as number) ?? 0}
        onChange={onChange}
        max={config?.max}
        min={config?.min}
        step={config?.step}
        aria-invalid={!!error}
        aria-required={required}
        aria-valuenow={(value as number) ?? 0}
        aria-valuemin={config?.min}
        aria-valuemax={config?.max}
        data-testid={GetFieldDataTestId(fieldName, testId)}
      />
      <output className="ak-slider__value">{String(value)}</output>
    </div>
  );
};

export default Slider;
