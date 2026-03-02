import { Icon, Spinner, SpinnerSize } from "@fluentui/react";
import React from "react";
import { FieldError } from "react-hook-form";
import CustomLabel from "../../Components/Readonly/Label";
import { ComponentTypes } from "../../DynamicLayout/Models/Enums";
import { HookInlineFormStrings } from "../Strings";

interface IHookFieldWrapperProps {
  /**
   * ID
   */
  id?: string;

  /**
   * Label displayed over optionset
   */
  readonly label?: string;

  /**
   * Is Field Required
   */
  readonly required?: boolean;

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

  /**
   * Class Name for div wrapping the Label
   */
  readonly labelClassName?: string;

  /**
   * Class Name for div wrapping the field
   */
  readonly fieldClassName?: string;

  /**
   * Show Controls on Side?
   */
  readonly showControlonSide?: boolean;

  /**
   * control aria label, if different than label/Label is not available
   */
  readonly ariaLabel?: string;
  /**
   * control aria description
   */
  readonly ariaDescription?: string;
  /**
   * control description, if different than label/Label is not available
   */
  readonly containerClassName?: string;

  /**
   * shows info icon and on hover shoes additionalInfo or description passed
   */
  readonly additionalInfo?: string;

  /**
   * Additional Info icon to be displayed
   */
  readonly additionalInfoIcon?: string;

  /**
   * Render additional info. If defined, overrides additionalInfo and additionalInfoIcon props
   */
  readonly additionalInfoComponent?: JSX.Element;

  /**
   * component type of the component that InputFieldWrapper is wrapping
   */
  readonly controlType?: ComponentTypes;

  /**
   * For insdie modal, changes save pending message
   */
  isManualSave?: boolean;
}

export const HookFieldWrapper: React.FunctionComponent<IHookFieldWrapperProps> = (
  props: React.PropsWithChildren<IHookFieldWrapperProps>
) => {
  const {
    id,
    required,
    error,
    errorCount,
    savePending,
    saving,
    labelClassName,
    fieldClassName,
    showControlonSide,
    label,
    ariaLabel,
    ariaDescription,
    containerClassName,
    additionalInfo,
    additionalInfoIcon,
    additionalInfoComponent,
    controlType,
    isManualSave
  } = props;

  const labelId = `${id}_label`;
  const errorMessageId = `${props.id}_error`;
  const children = (Array.isArray(props.children) ? props.children : [props.children]) as React.ReactElement[];

  return (
    <div
      className={`form-field ${showControlonSide ? "flexBox" : ""} ${containerClassName || ""} ${
        saving ? "saving" : ""
      }`}
    >
      <CustomLabel
        id={labelId}
        className={labelClassName || ""}
        label={label}
        required={required}
        additionalInfo={additionalInfo}
        additionalInfoIcon={additionalInfoIcon}
        additionalInfoComponent={additionalInfoComponent}
        multiline
      />
      <div className={`flexBox-Direction-column field-container ${fieldClassName || ""}`}>
        {children.map((child, index) => {
          if (child && child.props) {
            const childProps = {
              "aria-labelledby": ariaLabel ? "" : labelId,
              "aria-label": ariaLabel || "",
              "aria-description": ariaDescription || "",
              "aria-required": required,
              "aria-invalid": error,
              "aria-describedby": errorMessageId,
              key: index,
              className: child.props.className
            };

            // aria-description & aria-describedby cannot both be used simultaneously, so deleting aria-description prop if we have an error (which is when aria-describedby kicks in via the FieldError component below)
            if (!ariaDescription || (ariaDescription && error)) {
              delete childProps["aria-description"];
            }
            //DateControl's (DatePicker's) first child component is a label which aria-required is an invalid property for. DateControl now gets passed aria-required directly to its textfield
            if (controlType === ComponentTypes.DateControl || controlType === ComponentTypes.ChoiceSet) {
              delete childProps["aria-required"];
            }
            return index === 0 ? React.cloneElement(child, childProps) : React.cloneElement(child, { key: index });
          } else {
            return <></>;
          }
        })}
      </div>
      <div className="message">
        {error ? (
          <>
            <Icon className="error-icon" iconName="Error" />
            <span className="error-message" id={id} role="alert">
              {error.message || "Error"}
            </span>
          </>
        ) : savePending ? (
          <>
            <Icon className="warning-icon" iconName="Warning" />
            <span className="warning-message" id={id} role="alert">
              {!isManualSave ? HookInlineFormStrings.autoSavePending : HookInlineFormStrings.savePending} (
              {`${errorCount} ${HookInlineFormStrings.remaining}`})
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
    </div>
  );
};
