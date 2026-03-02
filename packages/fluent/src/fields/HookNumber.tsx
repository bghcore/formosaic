import { IHookFieldSharedProps, isNull } from "@bghcore/dynamic-forms-core";
import { Input } from "@fluentui/react-components";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const HookNumber = (props: IHookFieldSharedProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, meta, error, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const number = Number(event.target.value);
    if (!isNaN(number)) {
      setFieldValue(fieldName, number, false, 1500);
    }
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={String(value)} />
  ) : (
    <Input
      className={FieldClassName("hook-number", error)}
      autoComplete="off"
      type="number"
      value={!isNull(value) ? String(value) : ""}
      onChange={onChange}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    />
  );
};

export default HookNumber;
