import { IFieldProps } from "@bghcore/dynamic-forms-core";
import React from "react";

const HookDynamicFragment = (props: IFieldProps<{}>) => {
  const { value } = props;
  return <input type="hidden" value={value as string} />;
};

export default HookDynamicFragment;
