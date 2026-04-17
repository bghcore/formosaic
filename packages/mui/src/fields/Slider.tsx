import { IFieldProps } from "@formosaic/core";
import { Slider as MuiSlider } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId, isNull } from "../helpers";

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

  const onChange = (_: Event, newValue: number | number[]) => {
    setFieldValue(fieldName, newValue as number);
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={!isNull(value) ? String(value) : undefined} />
  ) : (
    <MuiSlider
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className={FieldClassName("fe-slider", error)}
      value={(value as number) ?? 0}
      onChange={onChange}
      max={config?.max}
      min={config?.min}
      step={config?.step}
      valueLabelDisplay="auto"
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default Slider;
