import { IFieldProps } from "@formosaic/core";
import { convertBooleanToYesOrNoText } from "../helpers";
import { Switch } from "@fluentui/react-components";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

const Toggle = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  const onChange = (_: React.ChangeEvent<HTMLInputElement>, data: { checked: boolean }) => {
    setFieldValue(fieldName, data.checked);
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={convertBooleanToYesOrNoText(value as boolean)} />
  ) : (
    <Switch
      className="fe-toggle"
      checked={value as boolean}
      onChange={onChange}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default Toggle;
