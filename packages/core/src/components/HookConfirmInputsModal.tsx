import { Dictionary } from "../utils";
import React from "react";
import { useFormContext } from "react-hook-form";
import { IFieldConfig } from "../types/IFieldConfig";
import { UseBusinessRulesContext } from "../providers/BusinessRulesProvider";
import { HookInlineFormStrings } from "../strings";
import HookRenderField from "./HookRenderField";

interface IHookConfirmInputsModalProps {
  isOpen?: boolean;
  configName: string;
  entityId?: string;
  entityType?: string;
  programName?: string;
  fieldConfigs: Dictionary<IFieldConfig>;
  confirmInputFields: string[];
  saveConfirmInputFields: () => void;
  cancelConfirmInputFields: () => void;
  /** Optional custom dialog renderer. If not provided, uses native <dialog>. */
  renderDialog?: (props: { isOpen: boolean; onSave: () => void; onCancel: () => void; children: React.ReactNode }) => React.JSX.Element;
}

/** Returns all focusable elements inside a container */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

const HookConfirmInputsModal = (props: IHookConfirmInputsModalProps) => {
  const {
    isOpen,
    configName,
    entityId,
    entityType,
    programName,
    fieldConfigs,
    confirmInputFields,
    saveConfirmInputFields,
    cancelConfirmInputFields,
    renderDialog
  } = props;
  const { setValue, trigger } = useFormContext();
  const { businessRules } = UseBusinessRulesContext();

  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const previouslyFocusedRef = React.useRef<Element | null>(null);
  const saveButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (isOpen && dialogRef.current && !dialogRef.current.open) {
      // Save the currently focused element before opening
      previouslyFocusedRef.current = document.activeElement;
      dialogRef.current.showModal();
      // Focus the save button (first actionable button) when modal opens
      if (saveButtonRef.current) {
        saveButtonRef.current.focus();
      }
    } else if (!isOpen && dialogRef.current?.open) {
      dialogRef.current.close();
      // Restore focus to the previously focused element
      if (previouslyFocusedRef.current && previouslyFocusedRef.current instanceof HTMLElement) {
        previouslyFocusedRef.current.focus();
      }
      previouslyFocusedRef.current = null;
    }
  }, [isOpen]);

  // Handle Escape key to close the modal (native <dialog> handles this for showModal,
  // but we also need to run our cancel logic)
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      cancelConfirmInputFields();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
    };
  }, [cancelConfirmInputFields]);

  // Focus trap: wrap Tab navigation within the dialog
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== "Tab" || !dialogRef.current) return;

    const focusableElements = getFocusableElements(dialogRef.current);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift+Tab: if on first element, wrap to last
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: if on last element, wrap to first
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, []);

  const setValueFunctionFieldValue = (fieldName: string, fieldValue: unknown) => {
    trigger();
    setValue(`${fieldName}` as const, fieldValue, { shouldDirty: true });
  };

  const content = (
    <div className="hook-inline-form-wrapper">
      <div className="hook-inline-form-container">
        <form className="hook-inline-form modal">
          {confirmInputFields ? (
            confirmInputFields.map(confirmInputField => {
              const { component, dropdownOptions, validations } = businessRules.configRules[configName].fieldRules[
                confirmInputField
              ];
              const fieldConfig = fieldConfigs[confirmInputField];
              const { label, hideOnCreate, meta } = fieldConfig;
              return (
                <HookRenderField
                  key={`${confirmInputField}-${entityId}-modal`}
                  fieldName={confirmInputField}
                  entityId={entityId}
                  entityType={entityType}
                  programName={programName}
                  component={component ?? ""}
                  required
                  dropdownOptions={dropdownOptions}
                  validations={validations}
                  isManualSave
                  setFieldValue={setValueFunctionFieldValue}
                  label={label}
                  skipLayoutReadOnly
                  hideOnCreate={hideOnCreate}
                  meta={meta}
                />
              );
            })
          ) : (
            <></>
          )}
        </form>
      </div>
    </div>
  );

  if (renderDialog) {
    return renderDialog({ isOpen: !!isOpen, onSave: saveConfirmInputFields, onCancel: cancelConfirmInputFields, children: content });
  }

  return (
    <dialog
      ref={dialogRef}
      className="hook-inline-form-modal"
      aria-label={HookInlineFormStrings.confirm}
      onKeyDown={handleKeyDown}
    >
      {content}
      <div className="hook-inline-form-modal-actions">
        <button ref={saveButtonRef} onClick={saveConfirmInputFields}>{HookInlineFormStrings.save}</button>
        <button onClick={cancelConfirmInputFields}>{HookInlineFormStrings.cancel}</button>
      </div>
    </dialog>
  );
};

export default HookConfirmInputsModal;
