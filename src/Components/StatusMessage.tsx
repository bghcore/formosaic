import { HookInlineFormStrings } from "@cxpui/commoncontrols/dist/HookInlineForm/Strings";
import { Icon, Spinner, SpinnerSize } from "@fluentui/react";
import React from "react";
import { FieldError } from "react-hook-form";

interface IStatusMessageProps {
  /**
   * ID
   */
  id?: string;
  /**
   * Is Field Error
   */
  readonly error?: FieldError;

  /**
   * Error Count
   */
  readonly errorCount?: number;

  /**
   * Is Dirty
   */
  readonly savePending?: boolean;

  /**
   * Is Submitting
   */
  readonly saving?: boolean;
}

export const StatusMessage: React.FunctionComponent<IStatusMessageProps> = (
  props: React.PropsWithChildren<IStatusMessageProps>
) => {
  const { id, error, errorCount, savePending, saving } = props;

  const errorDefaultMessage = "Error";

  return (
    <div className="message">
      {error ? (
        <>
          <Icon className="error-icon" iconName="Error" />
          <span className="error-message" id={id} role="alert">
            {error.message || errorDefaultMessage}
          </span>
        </>
      ) : savePending ? (
        <>
          <Icon className="warning-icon" iconName="Warning" />
          <span className="warning-message" id={id} role="alert">
            {HookInlineFormStrings.autoSavePending} ({errorCount} {HookInlineFormStrings.remaining})
          </span>
        </>
      ) : saving ? (
        <>
          <Spinner size={SpinnerSize.xSmall} />
          <span className="save-message" id={id} role="alert">
            {HookInlineFormStrings.saving}
          </span>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};
