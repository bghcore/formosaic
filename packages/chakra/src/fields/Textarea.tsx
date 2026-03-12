import { IFieldProps, FormStrings } from "@formosaic/core";
import { Textarea as ChakraTextarea } from "@chakra-ui/react";
import React, { useState } from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { StatusMessage } from "../components/StatusMessage";
import { GetFieldDataTestId, getFieldState } from "../helpers";

interface ITextareaProps {
  autoAdjustHeight?: boolean;
  numberOfRows?: number;
  ellipsifyTextCharacters?: number;
  additionalInfo?: string;
  maxLimit?: number;
  saveCallback?: () => void;
  renderExtraModalFooter?: () => React.ReactNode;
}

const Textarea = (props: IFieldProps<ITextareaProps>) => {
  const {
    error, fieldName, testId, config, readOnly,
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
        data-field-type="Textarea"
        data-field-state={getFieldState({ error, required, readOnly })}
      >
        <ChakraTextarea
          autoComplete="off"
          value={modalVisible ? `${modalValue}` : value ? `${value}` : ""}
          onChange={onChange}
          rows={config?.numberOfRows ?? 4}
          aria-invalid={!!error}
          aria-required={required}
          data-testid={GetFieldDataTestId(fieldName, testId)}
        />
        <button
          type="button"
          onClick={onExpand}
          aria-label={FormStrings.openExpandedTextEditor}
          style={{
            marginTop: "4px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--chakra-colors-blue-500, #3182CE)",
            fontSize: "var(--chakra-fontSizes-sm, 14px)",
            padding: "2px 0",
          }}
        >
          {FormStrings.expand}
        </button>
      </div>

      <dialog ref={dialogRef} style={{ padding: "24px", borderRadius: "8px", border: "1px solid var(--chakra-colors-gray-200, #E2E8F0)", maxWidth: "640px", width: "100%" }} aria-label={`${label} editor`}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "18px" }}>
            {label}{required && <span style={{ color: "var(--chakra-colors-red-500, #E53E3E)" }}> *</span>}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label={FormStrings.closeExpandedTextEditor}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px" }}
          >
            &times;
          </button>
        </header>
        <div style={{ marginBottom: "16px" }}>
          <ChakraTextarea
            autoComplete="off"
            value={modalVisible ? `${modalValue}` : value ? `${value}` : ""}
            onChange={onChange}
            rows={12}
            aria-invalid={!!error}
          />
        </div>
        <footer style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
          {config?.renderExtraModalFooter && <div>{config.renderExtraModalFooter()}</div>}
          {(savePending || saving) && (
            <StatusMessage savePending={!error ? savePending : undefined} saving={saving} error={error} />
          )}
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: "6px 16px", borderRadius: "6px", border: "1px solid var(--chakra-colors-gray-200, #E2E8F0)", background: "white", cursor: "pointer" }}
          >
            {FormStrings.cancel}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!config?.saveCallback && modalValue === (value as string)}
            style={{ padding: "6px 16px", borderRadius: "6px", border: "none", background: "var(--chakra-colors-blue-500, #3182CE)", color: "white", cursor: "pointer" }}
            data-testid={`${testId ? testId + "-" : ""}save-note`}
          >
            {FormStrings.save}
          </button>
        </footer>
      </dialog>

      <dialog ref={confirmRef} style={{ padding: "24px", borderRadius: "8px", border: "1px solid var(--chakra-colors-gray-200, #E2E8F0)" }}>
        <h2 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>{FormStrings.unsavedChanges}</h2>
        <p>{FormStrings.saveChangesTo(label)}</p>
        <footer style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
          <button
            type="button"
            onClick={onCancel}
            style={{ padding: "6px 16px", borderRadius: "6px", border: "1px solid var(--chakra-colors-gray-200, #E2E8F0)", background: "white", cursor: "pointer" }}
          >
            {FormStrings.dontSave}
          </button>
          <button
            type="button"
            onClick={onSave}
            style={{ padding: "6px 16px", borderRadius: "6px", border: "none", background: "var(--chakra-colors-blue-500, #3182CE)", color: "white", cursor: "pointer" }}
          >
            {FormStrings.save}
          </button>
        </footer>
      </dialog>
    </>
  );
};

export default Textarea;
