import { IHookFieldSharedProps } from "@bghcore/dynamic-forms-core";
import { Typography } from "@mui/material";
import React from "react";
import { formatDateTime } from "../../helpers";

interface IHookReadOnlyDateTimeProps {
  isListView?: boolean;
  hidetimeStamp?: boolean;
}

const HookReadOnlyDateTime = (props: IHookFieldSharedProps<IHookReadOnlyDateTimeProps>) => {
  const { meta, value } = props;
  return (
    <>{value ? (
      <Typography variant="body2" className="hook-read-only-date-time" component="span">
        {formatDateTime(value as string, { hideTimestamp: meta?.hidetimeStamp })}
      </Typography>
    ) : <>-</>}</>
  );
};

export default HookReadOnlyDateTime;
