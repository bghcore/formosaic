import { IHookFieldSharedProps } from "@bghcore/dynamic-forms-core";
import React from "react";
import { ReadOnlyText, IReadOnlyFieldProps } from "../../components/ReadOnlyText";

const HookReadOnlyArray = (props: IHookFieldSharedProps<IReadOnlyFieldProps>) => {
  const { fieldName, value, meta } = props;
  return (
    <>
      {(value as string[])?.map((v, i) => (
        <ReadOnlyText key={i} fieldName={fieldName} value={v} {...meta} />
      ))}
    </>
  );
};

export default HookReadOnlyArray;
