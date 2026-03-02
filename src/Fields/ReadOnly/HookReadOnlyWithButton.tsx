import { DynamicButton, IDynamicButtonProps, IHookFieldSharedProps } from "@cxpui/commoncontrols";
import React from "react";
import ReadOnlyText, { IReadOnlyFieldProps } from "../../Components/ReadOnlyText";

interface HookReadOnlyWithButton extends IReadOnlyFieldProps {
  containerClassName?: string;
  buttonConfig?: IDynamicButtonProps;
}

const HookReadOnlyWithButton = (props: IHookFieldSharedProps<HookReadOnlyWithButton>) => {
  const { fieldName, value, meta } = props;

  return (
    <div className={`flexBox ${meta?.containerClassName}`}>
      <ReadOnlyText fieldName={fieldName} value={`${value}`} />
      <DynamicButton {...meta.buttonConfig} entityId={props.entityId} />
    </div>
  );
};

export default HookReadOnlyWithButton;
