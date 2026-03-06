import { IFieldProps } from "@form-eng/core";
import React from "react";
import { formatDateTime } from "../../helpers";

interface IHookReadOnlyDateTimeProps {
  isListView?: boolean;
  hidetimeStamp?: boolean;
}

const ReadOnlyDateTime = (props: IFieldProps<IHookReadOnlyDateTimeProps>) => {
  const { config, value } = props;
  return (
    <>{value ? (
      <span className="hook-read-only-date-time">
        {formatDateTime(value as string, { hideTimestamp: config?.hidetimeStamp })}
      </span>
    ) : <>-</>}</>
  );
};

export default ReadOnlyDateTime;
