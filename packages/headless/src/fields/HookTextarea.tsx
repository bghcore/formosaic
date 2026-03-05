import { IFieldProps, FormStrings } from "@bghcore/dynamic-forms-core";
import React, { useState } from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { StatusMessage } from "../components/StatusMessage";
import { GetFieldDataTestId, getFieldState } from "../helpers";

interface IHookTextareaProps {
  autoAdjustHeight?: boolean;
  numberOfRows?: number;
  ellipsifyTextCharacters?: number;
  additionalInfo?: string;
  maxLimit?: number;
  saveCallback?: () => void;
  renderExtraModalFooter?: () => React.ReactNode;
}

const HookTextarea = (props: IFieldProps<IHookTextareaProps>) => {
  const {
    error, fieldName, programName, entityType, entityId, config, readOnly,
    required, savePending, saving, value, label, setFieldValue
  } = props;

  const [modalValue, setModalValue] = useState<string>();
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const confirmRef = React.useRef<HTMLDialogElement>(null);

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    modalVisible ? setModalValue(newValue) : setFieldValue(fieldName, newValue, false, 3000);
  };

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
        <textarea
          className="df-textarea__input"
          autoComplete="off"
          value={modalVisible ? `${modalValue}` : value ? `${value}` : ""}
          onChange={onChange}
          rows={config?.numberOfRows ?? 4}
          aria-invalid={!!error}
          aria-required={required}
          data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
        />
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
            onChange={onChange}
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
            data-testid={`${programName}-${entityType}-${entityId}-save-note`}
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

export default HookTextarea;
