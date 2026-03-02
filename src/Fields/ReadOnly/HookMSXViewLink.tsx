import { AnchorTag, IDynamicFieldWrapper, IHookFieldSharedProps } from "@cxpui/commoncontrols";
import React from "react";
import { HookInlineFormStrings } from "../../Strings";

interface IHookMSXViewLinkProps extends IDynamicFieldWrapper {
  text?: string;
}

const HookMSXViewLink = (props: IHookFieldSharedProps<IHookMSXViewLinkProps>) => {
  const { value, meta } = props;
  const url = value ? `${value}` : undefined;
  return url ? (
    <AnchorTag
      text={(meta?.text && `${meta.text}`) || HookInlineFormStrings.msxView.linkText}
      url={url}
      customCss="cpj-anchor-tag"
    />
  ) : (
    <></>
  );
};

export default HookMSXViewLink;
