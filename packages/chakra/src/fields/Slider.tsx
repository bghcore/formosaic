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
    <div
      style={{ display: "flex", alignItems: "center", gap: "12px" }}
      data-field-type="Slider"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <input
        type="range"
        style={{
          flex: 1,
          accentColor: "var(--chakra-colors-blue-500, #3182CE)",
        }}
        value={(value as number) ?? 0}
        onChange={onChange}
        max={config?.max ?? 100}
        min={config?.min ?? 0}
        step={config?.step ?? 1}
        aria-invalid={!!error}
        aria-required={required}
        aria-valuenow={(value as number) ?? 0}
        aria-valuemin={config?.min ?? 0}
        aria-valuemax={config?.max ?? 100}
        {...rest}
        data-testid={GetFieldDataTestId(fieldName, testId)}
      />
      <output style={{ minWidth: "32px", textAlign: "center", fontSize: "var(--chakra-fontSizes-md, 16px)" }}>
        {String(value)}
      </output>
    </div>
  );
};

export default Slider;
