import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

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
    return <ReadOnlyText fieldName={fieldName} value={String(value)} />;
  }

  return (
    <div
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      <input
        type="range"
        value={(value as number) ?? 0}
        onChange={onChange}
        max={config?.max}
        min={config?.min}
        step={config?.step}
      />
    </div>
  );
};

export default Slider;
