import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const ColorPicker = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  const color = (value as string) ?? "#000000";

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.target.value);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={color} />;
  }

  return (
    <div
      className={FieldClassName("fe-color-picker", error)}
      style={{ display: "flex", alignItems: "center", gap: "8px" }}
    >
      <input
        type="color"
        className="fe-color-picker__input"
        value={color}
        onChange={onChange}
        aria-invalid={!!error}
        aria-required={required}
        data-testid={GetFieldDataTestId(fieldName, testId)}
      />
      <span className="fe-color-picker__value">{color}</span>
    </div>
  );
};

export default ColorPicker;
