import { IFieldProps } from "@form-eng/core";
import { Typography } from "@mui/material";
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
      <Typography variant="body2" className="hook-read-only-date-time" component="span">
        {formatDateTime(value as string, { hideTimestamp: config?.hidetimeStamp })}
      </Typography>
    ) : <>-</>}</>
  );
};

export default ReadOnlyDateTime;
