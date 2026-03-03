import { Typography } from "@mui/material";
import React from "react";

export interface IReadOnlyFieldProps {
  readonly value?: string;
  readonly fieldName?: string;
  readonly labelClassName?: string;
  readonly valueClassName?: string;
  readonly showControlOnSide?: boolean;
  readonly containerClassName?: string;
  readonly ellipsifyTextCharacters?: number;
}

export const ReadOnlyText: React.FunctionComponent<IReadOnlyFieldProps> = (props: IReadOnlyFieldProps) => {
  const { value, fieldName, valueClassName, showControlOnSide, containerClassName, ellipsifyTextCharacters } = props;
  const classNameValue = valueClassName === undefined ? "read-only-field" : valueClassName;
  const cutoff = (ellipsifyTextCharacters || 0) - 3;

  return (
    <div className={`${showControlOnSide ? "flexBox" : ""} ${containerClassName ?? ""}`}>
      <Typography
        variant="body2"
        id={`${fieldName}-read-only`}
        className={classNameValue}
        title={value}
        component="span"
      >
        {value ? (
          <>
            {ellipsifyTextCharacters && value.length > ellipsifyTextCharacters
              ? `${value.substring(0, cutoff)}...`
              : value}
          </>
        ) : (
          <>-</>
        )}
      </Typography>
    </div>
  );
};

export default ReadOnlyText;
