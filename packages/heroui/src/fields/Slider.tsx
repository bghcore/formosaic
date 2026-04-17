import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, isNull } from "../helpers";

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

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, Number(event.target.value));
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={!isNull(value) ? String(value) : undefined} />;
  }

  return (
    <div data-testid={GetFieldDataTestId(fieldName, testId)}>
      <input
        type="range"
        value={(value as number) ?? 0}
        onChange={onChange}
        max={config?.max}
        min={config?.min}
        step={config?.step}
        aria-invalid={!!error}
        aria-required={required}
        {...rest}
      />
    </div>
  );
};

export default Slider;
