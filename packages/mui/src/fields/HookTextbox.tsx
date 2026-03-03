import { IHookFieldSharedProps } from "@bghcore/dynamic-forms-core";
import { TextField } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface IHookTextboxProps {
  ellipsifyTextCharacters?: number;
  placeHolder?: string;
  multiline?: boolean;
}

const HookTextbox = (props: IHookFieldSharedProps<IHookTextboxProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, meta, error, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.target.value, false, 3000);
  };

  return readOnly ? (
    <ReadOnlyText
      fieldName={fieldName}
      value={value as string}
      ellipsifyTextCharacters={meta?.ellipsifyTextCharacters}
    />
  ) : (
    <TextField
      className={FieldClassName("hook-textbox", error)}
      autoComplete="off"
      value={(value as string) ?? ""}
      onChange={onChange}
      size="small"
      fullWidth
      error={!!error}
      helperText={error?.message}
      inputProps={{
        "data-testid": GetFieldDataTestId(fieldName, programName, entityType, entityId),
      }}
    />
  );
};

export default HookTextbox;
