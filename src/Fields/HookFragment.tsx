import { IHookFieldSharedProps } from "../Interfaces/IHookFieldSharedProps";

import React from "react";

const HookFragment = (props: IHookFieldSharedProps<{}>) => {
  const { value } = props;

  return <input type="hidden" value={value as string} />;
};

export default HookFragment;
