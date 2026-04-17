import { IFieldProps } from "@formosaic/core";
import { convertBooleanToYesOrNoText } from "../helpers";
import { Switch, FormControlLabel } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

const Toggle = (props: IFieldProps<{}>) => {
  const {
    fieldName, testId, value, readOnly, error, required, setFieldValue,
    errorCount, saving, savePending, options, optionsLoading, label, type, description, helpText, placeholder, config,
    ...rest
  } = props;

  const onChange = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setFieldValue(fieldName, checked);
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={convertBooleanToYesOrNoText(value as boolean)} />
  ) : (
    <FormControlLabel
      {...rest}
      className="fe-toggle"
      control={
        <Switch
          aria-invalid={!!error}
          aria-required={required}
          checked={value as boolean}
          onChange={onChange}
          data-testid={GetFieldDataTestId(fieldName, testId)}
        />
      }
      label=""
    />
  );
};

export default Toggle;
