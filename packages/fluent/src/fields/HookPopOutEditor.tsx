import { IHookFieldSharedProps, HookInlineFormStrings } from "@bghcore/dynamic-forms-core";
import { Button, Textarea, Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions } from "@fluentui/react-components";
import { FullScreenMaximizeRegular, DismissRegular } from "@fluentui/react-icons";
import React, { useState } from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { StatusMessage } from "../components/StatusMessage";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface IHookPopOutEditorProps {
  autoAdjustHeight?: boolean;
  numberOfRows?: number;
  ellipsifyTextCharacters?: number;
  additionalInfo?: string;
  maxLimit?: number;
  saveCallback?: () => void;
  renderExtraModalFooter?: () => React.ReactNode;
}

const HookPopOutEditor = (props: IHookFieldSharedProps<IHookPopOutEditorProps>) => {
  const {
    error, fieldName, programName, entityType, entityId, meta, readOnly,
    required, savePending, saving, value, label, setFieldValue
  } = props;

  const [modalValue, setModalValue] = useState<string>();
  const [modalVisible, setModalVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);

  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    modalVisible ? setModalValue(newValue) : setFieldValue(fieldName, newValue, false, 3000);
  };

  const onExpandButtonClick = () => {
    setModalVisible(true);
    setModalValue(value ? `${value}` : "");
  };

  const onSaveButtonClick = () => {
    setFieldValue(fieldName, modalValue, false);
    setDialogVisible(false);
    setModalVisible(false);
    meta?.saveCallback?.();
  };

  const onCancelButtonClick = () => {
    if (dialogVisible) {
      setDialogVisible(false);
      setModalVisible(false);
    } else if (modalValue !== value) {
      setDialogVisible(true);
    } else {
      setModalVisible(false);
    }
  };

  if (readOnly) {
    return (
      <ReadOnlyText
        fieldName={fieldName}
        value={value ? `${value}` : ""}
        ellipsifyTextCharacters={meta?.ellipsifyTextCharacters}
      />
    );
  }

  return (
    <>
      <div className="hook-textarea">
        <Textarea
          className={FieldClassName("hook-text-area", error)}
          resize="none"
          autoComplete="off"
          value={modalVisible ? `${modalValue}` : value ? `${value}` : ""}
          onChange={onChange}
          data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
          rows={meta?.numberOfRows ?? 4}
        />
        <Button
          className="expand-button"
          appearance="secondary"
          icon={<FullScreenMaximizeRegular />}
          onClick={onExpandButtonClick}
          aria-label={HookInlineFormStrings.openExpandedTextEditor}
        >
          {HookInlineFormStrings.expand}
        </Button>
      </div>

      <Dialog open={modalVisible} onOpenChange={(_, data) => { if (!data.open) onCancelButtonClick(); }}>
        <DialogSurface className="hook-expanded-textarea" style={{ maxWidth: "90vw", width: "800px" }}>
          <DialogBody>
            <DialogTitle
              action={
                <Button appearance="subtle" icon={<DismissRegular />} onClick={onCancelButtonClick}
                  aria-label={HookInlineFormStrings.closeExpandedTextEditor} />
              }
            >
              {label}{required && <span className="required-indicator"> *</span>}
            </DialogTitle>
            <DialogContent>
              <Textarea
                className={FieldClassName("hook-text-area", error)}
                resize="vertical"
                autoComplete="off"
                value={modalVisible ? `${modalValue}` : value ? `${value}` : ""}
                onChange={onChange}
                rows={12}
                style={{ width: "100%" }}
              />
            </DialogContent>
            <DialogActions>
              {meta?.renderExtraModalFooter && <div className="custom-footer">{meta.renderExtraModalFooter()}</div>}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {(savePending || saving) && (
                  <StatusMessage savePending={!error ? savePending : undefined} saving={saving} error={error} />
                )}
              </div>
              <Button appearance="secondary" onClick={onCancelButtonClick}>{HookInlineFormStrings.cancel}</Button>
              <Button appearance="primary" onClick={onSaveButtonClick}
                disabled={!meta?.saveCallback && modalValue === (value as string)}
                data-testid={`${programName}-${entityType}-${entityId}-save-note`}>
                {meta?.saveCallback ? HookInlineFormStrings.save : HookInlineFormStrings.save}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={dialogVisible} onOpenChange={(_, data) => { if (!data.open) setDialogVisible(false); }}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{HookInlineFormStrings.unsavedChanges}</DialogTitle>
            <DialogContent>{HookInlineFormStrings.saveChangesTo(label)}</DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={onCancelButtonClick}>{HookInlineFormStrings.dontSave}</Button>
              <Button appearance="primary" onClick={onSaveButtonClick}>{HookInlineFormStrings.save}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};

export default HookPopOutEditor;
