import { Dictionary } from "@form-eng/core";
import React from "react";

interface IStatusColorProps {
  statusColors: Dictionary<string>;
  status: string;
}

const StatusColor = (props: IStatusColorProps) => {
  const { statusColors, status } = props;
  return (
    <div
      className="status-color"
      style={{
        backgroundColor: statusColors && status && statusColors[status],
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        flexShrink: 0
      }}
    />
  );
};

export default StatusColor;
