import { IFieldProps } from "@formosaic/core";
import { Slider as MantineSlider } from "@mantine/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface ISliderProps {
  max?: number;
  min?: number;
  step?: number;
}

const Slider = (props: IFieldProps<ISliderProps>) => {
  const { fieldName, testId, value, readOnly, config, error, required, setFieldValue } = props;

  const onChange = (val: number) => {
    setFieldValue(fieldName, val);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={String(value)} />;
  }

  return (
    <div
      className={FieldClassName("fe-slider", error)}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    >
      <MantineSlider
        value={(value as number) ?? 0}
        onChange={onChange}
        max={config?.max}
        min={config?.min}
        step={config?.step}
        label={(val) => String(val)}
      />
    </div>
  );
};

export default Slider;
