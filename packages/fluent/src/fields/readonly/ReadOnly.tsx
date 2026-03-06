import { IFieldProps } from "@form-eng/core";
import React from "react";
import { ReadOnlyText, IReadOnlyFieldProps } from "../../components/ReadOnlyText";

interface IReadOnlyFieldComponentProps extends IReadOnlyFieldProps {}

const ReadOnly = (props: IFieldProps<IReadOnlyFieldComponentProps>) => {
  const { fieldName, value, config } = props;
  return <ReadOnlyText fieldName={fieldName} value={value as string} {...config} />;
};

export default ReadOnly;
