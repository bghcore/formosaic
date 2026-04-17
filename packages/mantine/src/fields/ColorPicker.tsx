import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import { ColorInput } from "@mantine/core";

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
    <ColorInput
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
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
