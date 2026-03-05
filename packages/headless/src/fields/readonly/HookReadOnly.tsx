import { IFieldProps } from "@bghcore/dynamic-forms-core";
import React from "react";
import { ReadOnlyText, IReadOnlyFieldProps } from "../../components/ReadOnlyText";

const HookReadOnly = (props: IFieldProps<IReadOnlyFieldProps>) => {
  const { fieldName, value, config } = props;
  return <ReadOnlyText fieldName={fieldName} value={value as string} {...config} />;
};

export default HookReadOnly;
