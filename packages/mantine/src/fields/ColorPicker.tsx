import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import { ColorInput } from "@mantine/core";

const ColorPicker = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;
  const color = (value as string) ?? "#000000";
  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={color} />;
  }
  return (
    <ColorInput
      className="fe-color-picker"
      value={color}
      onChange={(val) => setFieldValue(fieldName, val)}
      error={!!error}
      required={required}
      data-field-type="ColorPicker"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};
export default ColorPicker;
