import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const ColorPicker = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText, placeholder, config,
    ...rest
  } = props;

  const color = (value as string) ?? "#000000";

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.target.value);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={color} />;
  }

  return (
    <div
      className="df-color-picker"
      data-field-type="ColorPicker"
      data-field-state={getFieldState({ error, required, readOnly })}
      style={{ display: "flex", alignItems: "center", gap: "8px" }}
    >
      <input
        aria-invalid={!!error}
        aria-required={required}
        {...rest}
        type="color"
        className="df-color-picker__input"
        value={color}
        onChange={onChange}
        data-testid={GetFieldDataTestId(fieldName, testId)}
      />
      <span className="df-color-picker__value">{color}</span>
    </div>
  );
};

export default ColorPicker;
