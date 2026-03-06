import React from "react";
import { FieldError } from "react-hook-form";
import { FormStrings } from "../strings";

interface IFieldWrapperProps {
  id?: string;
  readonly label?: string;
  readonly required?: boolean;
  readonly error?: FieldError;
  readonly errorCount?: number;
  readonly savePending?: boolean;
  readonly saving?: boolean;
  readonly labelClassName?: string;
  readonly fieldClassName?: string;
  readonly showControlonSide?: boolean;
  readonly ariaLabel?: string;
  readonly ariaDescription?: string;
  readonly containerClassName?: string;
  readonly additionalInfo?: string;
  readonly additionalInfoIcon?: string;
  readonly additionalInfoComponent?: React.ReactNode;
  isManualSave?: boolean;
  renderLabel?: (props: { id: string; labelId: string; label?: string; required?: boolean }) => React.ReactNode;
  renderError?: (props: { id: string; error?: FieldError; errorCount?: number }) => React.ReactNode;
  renderStatus?: (props: { id: string; saving?: boolean; savePending?: boolean; errorCount?: number; isManualSave?: boolean }) => React.ReactNode;
}

export const FieldWrapper: React.FunctionComponent<React.PropsWithChildren<IFieldWrapperProps>> = React.memo((
  props: React.PropsWithChildren<IFieldWrapperProps>
) => {
  const {
    id, required, error, errorCount, savePending, saving,
    labelClassName, fieldClassName, showControlonSide, label,
    ariaLabel, ariaDescription, containerClassName,
    additionalInfo, additionalInfoComponent, isManualSave,
    renderLabel, renderError, renderStatus,
  } = props;

  const labelId = `${id}_label`;
  const errorMessageId = `${id}_error`;
  const children = (Array.isArray(props.children) ? props.children : [props.children]) as React.ReactElement<Record<string, unknown>>[];

  const defaultLabel = (
    <div className={labelClassName || ""}>
      <label id={labelId} htmlFor={id} className="field-label">
        {label}
        {required && <><span className="required-indicator" aria-hidden="true" style={{ color: "var(--form-required-color, #d13438)" }}> *</span><span className="sr-only" style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}> (required)</span></>}
      </label>
      {additionalInfoComponent}
      {!additionalInfoComponent && additionalInfo && (
        <span className="additional-info" title={additionalInfo}>&#9432;</span>
      )}
    </div>
  );

  const defaultErrorAndStatus = (
    <div className="message">
      {error ? (
        <>
          <span className="error-icon" aria-hidden="true" style={{ color: "var(--form-error-color, #d13438)" }}>&#10006;</span>
          <span className="error-message" id={errorMessageId} role="alert" style={{ color: "var(--form-error-color, #d13438)" }}>
            {error.message || "Error"}
          </span>
        </>
      ) : savePending ? (
        <>
          <span className="warning-icon" aria-hidden="true" style={{ color: "var(--form-warning-color, #ffb900)" }}>&#9888;</span>
          <span className="warning-message" id={errorMessageId} role="status" style={{ color: "var(--form-warning-color, #ffb900)" }}>
            {!isManualSave ? FormStrings.autoSavePending : FormStrings.savePending} ({`${errorCount} ${FormStrings.remaining}`})
          </span>
        </>
      ) : saving ? (
        <>
          <span className="save-spinner" aria-hidden="true" style={{ color: "var(--form-saving-color, #0078d4)" }}>&#8987;</span>
          <span className="save-message" id={errorMessageId} role="status" style={{ color: "var(--form-saving-color, #0078d4)" }}>
            {FormStrings.saving}
          </span>
        </>
      ) : <></>}
    </div>
  );

  return (
    <div
      className={`form-field ${showControlonSide ? "flexBox" : ""} ${containerClassName || ""} ${saving ? "saving" : ""}`}
      aria-busy={saving ? "true" : undefined}
    >
      {renderLabel ? renderLabel({ id: id || "", labelId, label, required }) : defaultLabel}
      <div className={`flexBox-Direction-column field-container ${fieldClassName || ""}`}>
        {children.map((child, index) => {
          if (child && child.props) {
            const childProps: Record<string, unknown> = {
              id,
              "aria-labelledby": ariaLabel ? undefined : labelId,
              "aria-label": ariaLabel || undefined,
              "aria-required": required,
              "aria-invalid": !!error,
              "aria-describedby": errorMessageId,
              key: index,
              className: child.props.className,
            };
            if (ariaDescription && !error) {
              childProps["aria-description"] = ariaDescription;
            }
            if (index === 0) {
              return React.cloneElement(child, childProps);
            }
            const siblingProps: Record<string, unknown> = {
              key: index,
              "aria-labelledby": childProps["aria-labelledby"],
              "aria-label": childProps["aria-label"],
              "aria-required": childProps["aria-required"],
              "aria-invalid": childProps["aria-invalid"],
              "aria-describedby": childProps["aria-describedby"],
              className: child.props.className,
            };
            if (childProps["aria-description"]) {
              siblingProps["aria-description"] = childProps["aria-description"];
            }
            return React.cloneElement(child, siblingProps);
          }
          return <React.Fragment key={index} />;
        })}
      </div>
      {renderError
        ? renderError({ id: id || "", error, errorCount })
        : renderStatus
          ? renderStatus({ id: id || "", saving, savePending, errorCount, isManualSave })
          : defaultErrorAndStatus}
    </div>
  );
});

