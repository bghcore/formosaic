import { IFieldProps, convertBooleanToYesOrNoText } from "@form-eng/core";
import { Switch, FormControlLabel } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

const Toggle = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, setFieldValue } = props;

  const onChange = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setFieldValue(fieldName, checked);
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={convertBooleanToYesOrNoText(value as boolean)} />
  ) : (
    <FormControlLabel
      className="fe-toggle"
      control={
        <Switch
          checked={value as boolean}
          onChange={onChange}
          aria-invalid={!!error}
          aria-required={required}
          data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
        />
      }
      label=""
    />
  );
};

export default Toggle;
