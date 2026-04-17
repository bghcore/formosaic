import { IFieldProps } from "@formosaic/core";
import { Slider as MantineSlider } from "@mantine/core";
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

  const onChange = (val: number) => {
    setFieldValue(fieldName, val);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={!isNull(value) ? String(value) : undefined} />;
  }

  return (
    <div
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className={FieldClassName("fe-slider", error)}
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
