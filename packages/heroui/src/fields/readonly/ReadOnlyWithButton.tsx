import { IFieldProps } from "@form-eng/core";
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
    <div className={`fe-read-only-with-button ${config?.containerClassName ?? ""}`} data-field-type="ReadOnlyWithButton" data-field-state="readonly">
      <ReadOnlyText fieldName={fieldName} value={`${value}`} />
      {config?.buttonText && (
        <button type="button" className="fe-btn fe-btn--secondary" onClick={config.onButtonClick}>{config.buttonText}</button>
      )}
    </div>
  );
};
export default ReadOnlyWithButton;
