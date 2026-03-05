import { IFieldProps } from "@bghcore/dynamic-forms-core";
import React from "react";
import { ReadOnlyText, IReadOnlyFieldProps } from "../../components/ReadOnlyText";

interface HookReadOnlyWithButtonProps extends IReadOnlyFieldProps {
  containerClassName?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const HookReadOnlyWithButton = (props: IFieldProps<HookReadOnlyWithButtonProps>) => {
  const { fieldName, value, config } = props;
  return (
    <div
      className={`df-read-only-with-button ${config?.containerClassName ?? ""}`}
      data-field-type="ReadOnlyWithButton"
      data-field-state="readonly"
    >
      <ReadOnlyText fieldName={fieldName} value={`${value}`} />
      {config?.buttonText && (
        <button
          type="button"
          className="df-btn df-btn--secondary"
          onClick={config.onButtonClick}
        >
          {config.buttonText}
        </button>
      )}
    </div>
  );
};

export default HookReadOnlyWithButton;
