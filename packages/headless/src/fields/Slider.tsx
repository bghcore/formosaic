import { IFieldProps } from "@form-eng/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

interface IHookSliderProps {
  max?: number;
  min?: number;
  step?: number;
}

const Slider = (props: IFieldProps<IHookSliderProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, config, error, required, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, Number(event.target.value));
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={String(value)} />;
  }

  return (
    <div
      className="df-slider"
      data-field-type="Slider"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <input
        type="range"
        className="df-slider__input"
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
        data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
      />
      <output className="df-slider__value">{String(value)}</output>
    </div>
  );
};

export default Slider;
