import { IHookFieldSharedProps } from "@bghcore/dynamic-forms-core";
import { Slider } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface IHookSliderProps {
  max?: number;
  min?: number;
  step?: number;
}

const HookSlider = (props: IHookFieldSharedProps<IHookSliderProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, meta, error, setFieldValue } = props;

  const onChange = (_: Event, newValue: number | number[]) => {
    setFieldValue(fieldName, newValue as number);
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={String(value)} />
  ) : (
    <Slider
      className={FieldClassName("hook-slider", error)}
      value={(value as number) ?? 0}
      onChange={onChange}
      max={meta?.max}
      min={meta?.min}
      step={meta?.step}
      valueLabelDisplay="auto"
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    />
  );
};

export default HookSlider;
