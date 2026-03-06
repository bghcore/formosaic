import { IFieldProps } from "@form-eng/core";
import React from "react";
import { ReadOnlyText, IReadOnlyFieldProps } from "../../components/ReadOnlyText";

const ReadOnly = (props: IFieldProps<IReadOnlyFieldProps>) => {
  const { fieldName, value, config } = props;
  return <ReadOnlyText fieldName={fieldName} value={value as string} {...config} />;
};

export default ReadOnly;
