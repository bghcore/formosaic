import { IFieldProps } from "@formosaic/core";
import { isNull } from "../helpers";
import { Input } from "baseui/input";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

const NumberField = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText, placeholder, config,
    ...rest
  } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const num = Number(event.target.value);
    if (!isNaN(num)) {
      setFieldValue(fieldName, num, false, 1500);
    }
  };

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={!isNull(value) ? String(value) : undefined} />;
  }

  return (
    <Input
      aria-invalid={!!error}
      aria-required={required}
      {...rest}
      type="number"
      autoComplete="off"
      value={!isNull(value) ? String(value) : ""}
      onChange={onChange}
      error={!!error}
      overrides={{
        Root: {
          props: {
            "data-testid": GetFieldDataTestId(fieldName, testId),
          },
        },
      }}
    />
  );
};

export default NumberField;
