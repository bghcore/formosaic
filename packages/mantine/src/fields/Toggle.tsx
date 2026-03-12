import { IFieldProps } from "@formosaic/core";
import { convertBooleanToYesOrNoText } from "../helpers";
import { Switch } from "@mantine/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

const Toggle = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.currentTarget.checked);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={convertBooleanToYesOrNoText(value as boolean)} />;
  }

  return (
    <Switch
      className="fe-toggle"
      checked={!!value}
      onChange={onChange}
      required={required}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default Toggle;
