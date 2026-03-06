import { IFieldProps } from "@form-eng/core";
import { Button } from "@mui/material";
import React from "react";
import { ReadOnlyText, IReadOnlyFieldProps } from "../../components/ReadOnlyText";

interface IReadOnlyWithButtonProps extends IReadOnlyFieldProps {
  containerClassName?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const ReadOnlyWithButton = (props: IFieldProps<IReadOnlyWithButtonProps>) => {
  const { fieldName, value, config } = props;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className={config?.containerClassName}>
      <ReadOnlyText fieldName={fieldName} value={`${value}`} />
      {config?.buttonText && (
        <Button variant="outlined" size="small" onClick={config.onButtonClick}>
          {config.buttonText}
        </Button>
      )}
    </div>
  );
};

export default ReadOnlyWithButton;
