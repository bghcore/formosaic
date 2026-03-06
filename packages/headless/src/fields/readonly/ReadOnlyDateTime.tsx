import { IFieldProps } from "@form-eng/core";
import React from "react";
import { formatDateTime } from "../../helpers";

interface IReadOnlyDateTimeProps {
  isListView?: boolean;
  hidetimeStamp?: boolean;
}

const ReadOnlyDateTime = (props: IFieldProps<IReadOnlyDateTimeProps>) => {
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

export default ReadOnlyDateTime;
