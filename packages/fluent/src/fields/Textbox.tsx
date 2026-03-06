import { IFieldProps } from "@bghcore/dynamic-forms-core";
import { Input } from "@fluentui/react-components";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface IHookTextboxProps {
  ellipsifyTextCharacters?: number;
  placeHolder?: string;
  multiline?: boolean;
}

const Textbox = (props: IFieldProps<IHookTextboxProps>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, config, error, required, placeholder, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.target.value, false, 3000);
  };

  return readOnly ? (
    <ReadOnlyText
      fieldName={fieldName}
      value={value as string}
      ellipsifyTextCharacters={config?.ellipsifyTextCharacters}
    />
  ) : (
    <Input
      className={FieldClassName("hook-textbox", error)}
      autoComplete="off"
      value={(value as string) ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    />
  );
};

export default Textbox;
