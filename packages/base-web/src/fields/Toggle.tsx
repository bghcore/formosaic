import { IFieldProps } from "@formosaic/core";
import { convertBooleanToYesOrNoText } from "../helpers";
import { Checkbox, STYLE_TYPE } from "baseui/checkbox";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

const Toggle = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.target.checked);
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={convertBooleanToYesOrNoText(value as boolean)} />;
  }

  return (
    <Checkbox
      checked={!!value}
      onChange={onChange}
      checkmarkType={STYLE_TYPE.toggle}
      error={!!error}
      required={required}
      overrides={{
        Root: {
          props: {
            "aria-invalid": !!error,
            "aria-required": required,
            "data-testid": GetFieldDataTestId(fieldName, testId),
          },
        },
      }}
    />
  );
};

export default Toggle;
