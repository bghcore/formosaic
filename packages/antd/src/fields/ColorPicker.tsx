import { IFieldProps } from "@form-eng/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";
import { ColorPicker as AntdColorPicker } from "antd";

const ColorPicker = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, setFieldValue } = props;
  const color = (value as string) ?? "#000000";
  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={color} />;
  }
  return (
    <AntdColorPicker
      className="fe-color-picker"
      value={color}
      onChange={(_, hex) => setFieldValue(fieldName, hex)}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    />
  );
};
export default ColorPicker;
