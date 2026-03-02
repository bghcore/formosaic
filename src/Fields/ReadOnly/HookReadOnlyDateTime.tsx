import { DisplayDateTime, IDisplayDateTimeProps, IHookFieldSharedProps } from "@cxpui/commoncontrols";
import React from "react";

interface IHookReadOnlyDateTimeProps extends IDisplayDateTimeProps {}

const HookReadOnlyDateTime = (props: IHookFieldSharedProps<IHookReadOnlyDateTimeProps>) => {
  const { meta, value } = props;

  return (
    <>{value ? <DisplayDateTime date={value as string} className="hook-read-only-date-time" {...meta} /> : <>-</>}</>
  );
};

export default HookReadOnlyDateTime;
