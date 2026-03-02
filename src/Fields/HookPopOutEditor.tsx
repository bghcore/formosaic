/* eslint-disable max-lines-per-function */
import strings from "@cxpui/common/dist/Strings";
import { CustomLabel, IHookFieldSharedProps, ValidationFunctions } from "@cxpui/commoncontrols";
import { ElxRichTextEditor } from "@elixir/fx/lib/components/Editor/RichText/ElxRichTextEditor";
import { IElxRichTextEditorPlugin } from "@elixir/fx/lib/components/Editor/RichText/ElxRichTextEditor.types";
import { ElxHtml } from "@elixir/fx/lib/components/Html/ElxHtml";
import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  IconButton,
  Modal,
  PrimaryButton,
  Stack,
  TextField
} from "@fluentui/react";
import { useBoolean } from "@fluentui/react-hooks";
import React, { useRef, useState } from "react";
import { FieldError } from "react-hook-form";
import RichTextEditorPluginFocus from "../../../Helpers/RichTextEditorPuginFocus";
import CPJStrings from "../../../Strings/CPJStrings";
import ReadOnlyText from "../Components/ReadOnlyText";
import { StatusMessage } from "../Components/StatusMessage";
import { HookInlineFormConstants } from "../Constants";
import { FieldClassName, GetFieldDataTestId, SupportedPopOutEditors } from "../Helpers";
import { HookInlineFormStrings } from "../Strings";

interface IHookPopOutEditorProps {
  autoAdjustHeight?: boolean;
  numberOfRows?: number;
  ribbonBelowEditor?: boolean;
  ellipsifyTextCharacters?: number;
  additionalInfo?: string;
  maxLimit?: number;
  plugins?: IElxRichTextEditorPlugin[];
  saveCallback?: () => void;
  renderExtraModalFooter?: () => JSX.Element;
}

const HookPopOutEditor = (props: IHookFieldSharedProps<IHookPopOutEditorProps>) => {
  const {
    error,
    fieldName,
    programName,
    entityType,
    entityId,
    meta,
    readOnly,
    required,
    savePending,
    saving,
    value,
    validations,
    label,
    component,
    setFieldValue
  } = props;

  const maxDocumentSize =
    validations?.indexOf(ValidationFunctions.Max150KbValidation) > -1
      ? HookInlineFormConstants["150kb"]
      : validations?.indexOf(ValidationFunctions.Max32KbValidation) > -1
      ? HookInlineFormConstants["32kb"]
      : HookInlineFormConstants["150kb"];

  const {
    openExpandedTextEditor: openExpandedEditor,
    closeExpandedTextEditor,
    unsavedChanges,
    save,
    dontSave,
    expand,
    saveChangesTo,
    returnToEditing
  } = HookInlineFormStrings;

  const [modalValue, setModalValue] = useState<string>();
  const [modalVisible, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
  const [dialogVisible, { setTrue: showDialog, setFalse: hideDialog }] = useBoolean(false);
  const [key, setKey] = useState(0);
  const [documentSize, setDocumentSize] = useState<number>();
  const [docChanged, { setTrue: docHasChanged }] = useBoolean(false);

  const modalPlugin = useRef(new RichTextEditorPluginFocus());

  const onChange = (newValue?: string) => {
    if (!docChanged) {
      docHasChanged();
    }
    modalVisible ? setModalValue(newValue) : setFieldValue(fieldName, newValue, false, 3000);
  };

  const onChangeWithEvent = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    onChange(newValue);
  };

  const onExpandButtonClick = () => {
    showModal();
    setModalValue(value ? `${value}` : "");
  };

  const onSaveButtonClick = () => {
    // Always save
    setFieldValue(fieldName, modalValue, false);
    // Close the dialog and modal if the dialog was visible (meaning the user already wanted to close)
    if (dialogVisible || modalVisible) {
      // Force background editor to re-render to load updated value
      setKey(key + 1);
      hideDialog();
      hideModal();
    }
    meta?.saveCallback && meta.saveCallback();
  };

  const onCancelButtonClick = () => {
    if (dialogVisible) {
      // if the dialog is visible, cancel means don't save
      hideDialog();
      hideModal();
    } else if (modalValue !== value) {
      // if the dialog is not visible, cancel means show the dialog
      showDialog();
    } else {
      // if the dialog is not visible and the value is the same, cancel means close the modal
      hideModal();
    }
  };

  const hookEditorId = `hook-${component}-${fieldName.toLowerCase()}`;

  // This enables the Expand button to sit outside (above) the HookTextArea element.
  const enclosingDiv = document.getElementById(hookEditorId);

  React.useEffect(() => {
    if (enclosingDiv?.parentElement) {
      enclosingDiv.parentElement.style.overflow = "visible";
    }
  }, [enclosingDiv]);

  React.useEffect(() => {
    const documentValue = modalVisible
      ? modalValue && typeof modalValue === "string"
        ? modalValue.trim()
        : modalValue
      : value && typeof value === "string"
      ? value.trim()
      : value;
    const size = new Blob([`${documentValue}`]).size;
    const sizeKb = Math.ceil(size / 1000);
    setDocumentSize(sizeKb);
  }, [value, modalValue]);

  const documentSizeWarning = (error?: FieldError) => {
    if (documentSize && maxDocumentSize && maxDocumentSize / documentSize <= 2) {
      return (
        <span
          className={`message document-size${
            documentSize > maxDocumentSize ? "-error" : ""
          }`}>{`${documentSize}KB / ${maxDocumentSize}KB max`}</span>
      );
    } else if (error) {
      // Allows other errors to display without being cutoff
      return <span className={"message document-size"}>&nbsp;</span>;
    } else {
      return <></>;
    }
  };

  const getEditorComponent = () => {
    switch (component) {
      case SupportedPopOutEditors.RichText:
        if (readOnly) {
          return (
            <div className="hook-read-only-rich-text-editor">
              <ElxHtml {...meta} content={value ? `${value}` : ""} />
            </div>
          );
        } else {
          return (
            <>
              <div
                key={key}
                className={FieldClassName("hook-rich-text-editor", error)}
                data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}>
                <ElxRichTextEditor
                  {...meta}
                  id={fieldName}
                  onChange={onChange}
                  value={modalVisible ? `${modalValue}` : value ? `${value}` : ""}
                  plugins={modalVisible ? [modalPlugin?.current] : meta?.plugins}
                />
              </div>
            </>
          );
        }
      case SupportedPopOutEditors.Textarea:
        if (readOnly) {
          return (
            <ReadOnlyText
              {...meta}
              fieldName={fieldName}
              containerClassName={FieldClassName("hook-text-area-readonly", error)}
              ellipsifyTextCharacters={
                meta?.ellipsifyTextCharacters && !modalVisible ? meta.ellipsifyTextCharacters : undefined
              }
              value={value ? `${value}` : ""}
            />
          );
        } else {
          return (
            <TextField
              {...meta}
              id={fieldName}
              onChange={onChangeWithEvent}
              className={FieldClassName("hook-text-area", error)}
              resizable={false}
              multiline={true}
              autoComplete="off"
              value={modalVisible ? `${modalValue}` : value ? `${value}` : ""}
              data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
            />
          );
        }
      default:
        return <></>;
    }
  };

  return (
    <>
      <div className="hook-textarea" id={hookEditorId}>
        {getEditorComponent()}
        {component === SupportedPopOutEditors.RichText && documentSizeWarning(error)}
        <DefaultButton
          className="expand-button"
          iconProps={{
            iconName: "FullScreen"
          }}
          onClick={onExpandButtonClick}
          ariaLabel={openExpandedEditor}
          text={expand}
          data-testid={`${GetFieldDataTestId(fieldName, programName, entityType, entityId)}-expand-input`}
        />
      </div>
      <Modal
        isOpen={modalVisible}
        isBlocking={false}
        focusTrapZoneProps={{
          className: "hw-100"
        }}
        containerClassName="hook-expanded-textarea"
        scrollableContentClassName="scrollableContent"
        onDismiss={onCancelButtonClick}>
        <Stack className="header-stack">
          <div className="modal-header">
            <CustomLabel className={"modal-title"} label={label} required={required} />
            <IconButton
              className="icon-button"
              iconProps={{
                iconName: "Cancel"
              }}
              onClick={onCancelButtonClick}
              ariaLabel={closeExpandedTextEditor}
            />
          </div>
        </Stack>
        <hr />
        <div className="modal-body">{getEditorComponent()}</div>
        <hr />
        <div className="modal-footer">
          {meta?.renderExtraModalFooter && <div className="custom-footer">{meta.renderExtraModalFooter()}</div>}
          <div className="modal-footer-primary">
            <div className="modal-footer-messages">
              {component === SupportedPopOutEditors.RichText && documentSizeWarning(error)}
              {documentSize > maxDocumentSize ? (
                <StatusMessage
                  error={
                    {
                      message: `${strings.validation.maxKbSizeExceeded} ${maxDocumentSize}KB`
                    } as FieldError
                  }
                />
              ) : savePending || saving ? (
                <StatusMessage
                  {...props}
                  savePending={!error ? savePending : undefined}
                  error={!docHasChanged ? error : undefined}
                />
              ) : (
                <></>
              )}
            </div>
            <div className="modal-footer-actions">
              <DefaultButton
                title={CPJStrings.buttons.cancel}
                text={CPJStrings.buttons.cancel}
                onClick={onCancelButtonClick}
              />
              <PrimaryButton
                title={CPJStrings.buttons.save}
                text={meta?.saveCallback ? save : CPJStrings.buttons.saveChanges}
                disabled={(!meta?.saveCallback && modalValue === value) || documentSize > maxDocumentSize}
                onClick={onSaveButtonClick}
                primary
                data-testid={`${programName}-${entityType}-${entityId}-save-note`}
              />
            </div>
          </div>
        </div>
      </Modal>
      <Dialog
        hidden={!dialogVisible}
        onDismiss={hideDialog}
        dialogContentProps={{
          type: DialogType.normal,
          showCloseButton: true,
          className: "hook-textarea-save-changes-dialog",
          title: unsavedChanges,
          closeButtonAriaLabel: `${returnToEditing}`,
          subText: `${saveChangesTo(label)}`
        }}
        modalProps={{
          isBlocking: true
        }}>
        <DialogFooter>
          <PrimaryButton onClick={onSaveButtonClick} text={save} disabled={documentSize > maxDocumentSize} />
          <DefaultButton onClick={onCancelButtonClick} text={dontSave} />
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default HookPopOutEditor;
