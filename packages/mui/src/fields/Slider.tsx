import { IFieldProps } from "@bghcore/dynamic-forms-core";
import { Slider as MuiSlider } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface ISliderProps {
  max?: number;
  min?: number;
  step?: number;
}

const Slider = (props: IFieldProps<ISliderProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, config, error, required, setFieldValue } = props;

  const onChange = (_: Event, newValue: number | number[]) => {
    setFieldValue(fieldName, newValue as number);
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={String(value)} />
  ) : (
    <MuiSlider
      className={FieldClassName("hook-slider", error)}
      value={(value as number) ?? 0}
      onChange={onChange}
      max={config?.max}
      min={config?.min}
      step={config?.step}
      valueLabelDisplay="auto"
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    />
  );
};

export default Slider;
