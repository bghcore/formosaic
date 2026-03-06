import { IFieldProps } from "@form-eng/core";
import React from "react";

const DynamicFragment = (props: IFieldProps<{}>) => {
  const { value } = props;
  return <input type="hidden" value={value as string} />;
};

export default DynamicFragment;
