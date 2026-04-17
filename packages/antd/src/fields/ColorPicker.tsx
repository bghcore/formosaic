import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";
import { ColorPicker as AntdColorPicker } from "antd";

const ColorPicker = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText, placeholder, config,
    ...rest
  } = props;
  const color = (value as string) ?? "#000000";
  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={color} />;
  }
  return (
    <AntdColorPicker
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      className="fe-color-picker"
      value={color}
      onChange={(_, hex) => setFieldValue(fieldName, hex)}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};
export default ColorPicker;
