import { IFieldProps } from "@form-eng/core";
import React from "react";
import { formatDateTime } from "../../helpers";

interface IReadOnlyDateTimeProps {
  isListView?: boolean;
  hidetimeStamp?: boolean;
}

const ReadOnlyDateTime = (props: IFieldProps<IReadOnlyDateTimeProps>) => {
  const { config, value } = props;
  return (
    <>{value ? (
      <span className="fe-read-only-date-time">
        {formatDateTime(value as string, { hideTimestamp: config?.hidetimeStamp })}
      </span>
    ) : <>-</>}</>
  );
};

export default ReadOnlyDateTime;
