import { IFieldProps } from "@form-eng/core";
import React from "react";
import { ReadOnlyText, IReadOnlyFieldProps } from "../../components/ReadOnlyText";

const ReadOnlyArray = (props: IFieldProps<IReadOnlyFieldProps>) => {
  const { fieldName, value, config } = props;
  return (
    <>
      {(value as string[])?.map((v, i) => (
        <ReadOnlyText key={i} fieldName={fieldName} value={v} {...config} />
      ))}
    </>
  );
};

export default ReadOnlyArray;
