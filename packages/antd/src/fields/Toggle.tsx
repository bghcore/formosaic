import { IFieldProps } from "@formosaic/core";
import { convertBooleanToYesOrNoText } from "../helpers";
import { Switch } from "antd";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

const Toggle = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  const onChange = (checked: boolean) => {
    setFieldValue(fieldName, checked);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={convertBooleanToYesOrNoText(value as boolean)} />;
  }

  return (
    <Switch
      checked={!!value}
      onChange={onChange}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default Toggle;
