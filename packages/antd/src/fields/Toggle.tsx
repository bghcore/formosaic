import { IFieldProps } from "@formosaic/core";
import { convertBooleanToYesOrNoText } from "../helpers";
import { Switch } from "antd";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

const Toggle = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText, placeholder, config,
    ...rest
  } = props;

  const onChange = (checked: boolean) => {
    setFieldValue(fieldName, checked);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={convertBooleanToYesOrNoText(value as boolean)} />;
  }

  return (
    <Switch
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      checked={!!value}
      onChange={onChange}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default Toggle;
