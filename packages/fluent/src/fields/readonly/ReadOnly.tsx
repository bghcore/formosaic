import { IFieldProps } from "@form-eng/core";
import React from "react";
import { ReadOnlyText, IReadOnlyFieldProps } from "../../components/ReadOnlyText";

interface IHookReadOnlyProps extends IReadOnlyFieldProps {}

const ReadOnly = (props: IFieldProps<IHookReadOnlyProps>) => {
  const { fieldName, value, config } = props;
  return <ReadOnlyText fieldName={fieldName} value={value as string} {...config} />;
};

export default ReadOnly;
