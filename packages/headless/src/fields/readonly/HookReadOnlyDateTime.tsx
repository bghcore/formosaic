import { IFieldProps } from "@bghcore/dynamic-forms-core";
import React from "react";
import { formatDateTime } from "../../helpers";

interface IHookReadOnlyDateTimeProps {
  isListView?: boolean;
  hidetimeStamp?: boolean;
}

const HookReadOnlyDateTime = (props: IFieldProps<IHookReadOnlyDateTimeProps>) => {
  const { config, value } = props;

  if (!value) {
    return <span className="df-read-only-text" data-field-type="ReadOnlyDateTime">-</span>;
  }

  return (
    <time
      className="df-read-only-date-time"
      dateTime={value as string}
      data-field-type="ReadOnlyDateTime"
      data-field-state="readonly"
    >
      {formatDateTime(value as string, { hideTimestamp: config?.hidetimeStamp })}
    </time>
  );
};

export default HookReadOnlyDateTime;
