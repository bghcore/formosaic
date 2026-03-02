import { IHookFieldSharedProps } from "../../Interfaces/IHookFieldSharedProps";

import React from "react";
import ReadOnlyText, { IReadOnlyFieldProps } from "../../Components/ReadOnlyText";

interface IHookReadOnlyArrayProps extends IReadOnlyFieldProps {}

const HookReadOnlyArray = (props: IHookFieldSharedProps<IHookReadOnlyArrayProps>) => {
  const { fieldName, value, meta } = props;

  return (
    <>
      {(value as string[])?.map(value => (
        <ReadOnlyText fieldName={fieldName} value={value} {...meta} />
      ))}
    </>
  );
};

export default HookReadOnlyArray;
