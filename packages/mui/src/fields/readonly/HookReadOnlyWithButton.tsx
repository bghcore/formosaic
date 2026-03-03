import { IHookFieldSharedProps } from "@bghcore/dynamic-forms-core";
import { Button } from "@mui/material";
import React from "react";
import { ReadOnlyText, IReadOnlyFieldProps } from "../../components/ReadOnlyText";

interface HookReadOnlyWithButtonProps extends IReadOnlyFieldProps {
  containerClassName?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const HookReadOnlyWithButton = (props: IHookFieldSharedProps<HookReadOnlyWithButtonProps>) => {
  const { fieldName, value, meta } = props;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className={meta?.containerClassName}>
      <ReadOnlyText fieldName={fieldName} value={`${value}`} />
      {meta?.buttonText && (
        <Button variant="outlined" size="small" onClick={meta.onButtonClick}>
          {meta.buttonText}
        </Button>
      )}
    </div>
  );
};

export default HookReadOnlyWithButton;
