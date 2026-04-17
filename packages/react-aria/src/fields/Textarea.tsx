import { IFieldProps, FormStrings } from "@formosaic/core";
import React, { useState } from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { StatusMessage } from "../components/StatusMessage";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import { TextField, TextArea } from "react-aria-components";

interface ITextareaProps {
  autoAdjustHeight?: boolean;
  numberOfRows?: number;
  ellipsifyTextCharacters?: number;
  additionalInfo?: string;
  maxLimit?: number;
  saveCallback?: () => void;
  renderExtraModalFooter?: () => React.ReactNode;
  placeHolder?: string;
}

const Textarea = (props: IFieldProps<ITextareaProps>) => {
  const {
    error, fieldName, testId, config, readOnly,
    required, savePending, saving, value, label, setFieldValue, placeholder,
    errorCount, options, optionsLoading, type, description, helpText,
    ...rest
  } = props;

  const [modalValue, setModalValue] = useState<string>();
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const confirmRef = React.useRef<HTMLDialogElement>(null);

  const onExpand = () => {
    setModalVisible(true);
    setModalValue(value ? `${value}` : "");
    dialogRef.current?.showModal();
  };

  const onSave = () => {
    setFieldValue(fieldName, modalValue, false);
    setConfirmVisible(false);
    setModalVisible(false);
    dialogRef.current?.close();
    confirmRef.current?.close();
    config?.saveCallback?.();
  };

  const onCancel = () => {
    if (confirmVisible) {
      setConfirmVisible(false);
      setModalVisible(false);
      dialogRef.current?.close();
      confirmRef.current?.close();
    } else if (modalValue !== value) {
      setConfirmVisible(true);
      confirmRef.current?.showModal();
    } else {
      setModalVisible(false);
      dialogRef.current?.close();
    }
  };

  if (readOnly) {
    return (
      <ReadOnlyText
        fieldName={fieldName}
        value={value ? `${value}` : ""}
        ellipsifyTextCharacters={config?.ellipsifyTextCharacters}
      />
    );
  }

  return (
    <>
      <div
        className="df-textarea"
        data-field-type="Textarea"
        data-field-state={getFieldState({ error, required, readOnly })}
      >
        <TextField
          aria-invalid={!!error}
          aria-required={required}
          {...rest}
          className="df-textarea__field"
          value={modalVisible ? `${modalValue}` : value ? `${value}` : ""}
          onChange={(val) => {
            modalVisible ? setModalValue(val) : setFieldValue(fieldName, val, false, 3000);
          }}
          isInvalid={!!error}
          isRequired={required}
        >
          <TextArea
            className="df-textarea__input"
            autoComplete="off"
            rows={config?.numberOfRows ?? 4}
            placeholder={placeholder ?? config?.placeHolder}
            data-testid={GetFieldDataTestId(fieldName, testId)}
          />
        </TextField>
        <button
          type="button"
          className="df-textarea__expand"
          onClick={onExpand}
          aria-label={FormStrings.openExpandedTextEditor}
        >
          {FormStrings.expand}
        </button>
      </div>

      <dialog ref={dialogRef} className="df-textarea-dialog" aria-label={`${label} editor`}>
        <header className="df-textarea-dialog__header">
          <h2 className="df-textarea-dialog__title">
            {label}{required && <span className="df-required-indicator"> *</span>}
          </h2>
          <button
            type="button"
            className="df-textarea-dialog__close"
            onClick={onCancel}
            aria-label={FormStrings.closeExpandedTextEditor}
          >
            &times;
          </button>
        </header>
        <div className="df-textarea-dialog__body">
          <textarea
            className="df-textarea-dialog__input"
            autoComplete="off"
            value={modalVisible ? `${modalValue}` : value ? `${value}` : ""}
            onChange={(e) => setModalValue(e.target.value)}
            rows={12}
            aria-invalid={!!error}
          />
        </div>
        <footer className="df-textarea-dialog__footer">
          {config?.renderExtraModalFooter && <div>{config.renderExtraModalFooter()}</div>}
          {(savePending || saving) && (
            <StatusMessage savePending={!error ? savePending : undefined} saving={saving} error={error} />
          )}
          <button type="button" className="df-btn df-btn--secondary" onClick={onCancel}>
            {FormStrings.cancel}
          </button>
          <button
            type="button"
            className="df-btn df-btn--primary"
            onClick={onSave}
            disabled={!config?.saveCallback && modalValue === (value as string)}
            data-testid={`${testId ? testId + "-" : ""}save-note`}
          >
            {FormStrings.save}
          </button>
        </footer>
      </dialog>

      <dialog ref={confirmRef} className="df-confirm-dialog">
        <h2>{FormStrings.unsavedChanges}</h2>
        <p>{FormStrings.saveChangesTo(label)}</p>
        <footer className="df-confirm-dialog__footer">
          <button type="button" className="df-btn df-btn--secondary" onClick={onCancel}>
            {FormStrings.dontSave}
          </button>
          <button type="button" className="df-btn df-btn--primary" onClick={onSave}>
            {FormStrings.save}
          </button>
        </footer>
      </dialog>
    </>
  );
};

export default Textarea;
