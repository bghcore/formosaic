import { useContext, useCallback } from "react";
import { DesignerContext } from "./DesignerProvider";
import type { IDesignerState } from "../types/IDesignerState";
import type { IDesignerAction } from "../types/IDesignerAction";
import { DesignerActionType } from "../types/IDesignerAction";
import type {
  IFieldConfig,
  IFormConfig,
  IFormSettings,
  IRule,
  IWizardConfig,
} from "@bghcore/dynamic-forms-core";

export interface IUseDesigner {
  state: IDesignerState;
  dispatch: React.Dispatch<IDesignerAction>;
  /** Add a field to the form */
  addField: (id: string, field: IFieldConfig, insertAt?: number) => void;
  /** Remove a field */
  removeField: (id: string) => void;
  /** Update a field's config */
  updateField: (id: string, updates: Partial<IFieldConfig>) => void;
  /** Duplicate a field */
  duplicateField: (id: string) => void;
  /** Reorder fields */
  reorderFields: (fieldOrder: string[]) => void;
  /** Select a field (or deselect with null) */
  setSelected: (id: string | null) => void;
  /** Add a rule to a field */
  addRule: (fieldId: string, rule: IRule) => void;
  /** Update a rule */
  updateRule: (fieldId: string, ruleIndex: number, rule: IRule) => void;
  /** Remove a rule */
  removeRule: (fieldId: string, ruleIndex: number) => void;
  /** Set wizard config (or null to remove) */
  setWizard: (wizard: IWizardConfig | null) => void;
  /** Update form settings */
  updateSettings: (settings: Partial<IFormSettings>) => void;
  /** Import a full IFormConfig */
  importConfig: (config: IFormConfig) => void;
  /** Export current state as IFormConfig */
  exportConfig: () => IFormConfig;
  /** Undo */
  undo: () => void;
  /** Redo */
  redo: () => void;
  /** Currently selected field config (or null) */
  selectedField: IFieldConfig | null;
}

export function useDesigner(): IUseDesigner {
  const context = useContext(DesignerContext);
  if (!context) {
    throw new Error("useDesigner must be used within a DesignerProvider");
  }
  const { state, dispatch } = context;

  const addField = useCallback(
    (id: string, field: IFieldConfig, insertAt?: number) =>
      dispatch({ type: DesignerActionType.ADD_FIELD, payload: { id, field, insertAt } }),
    [dispatch],
  );

  const removeField = useCallback(
    (id: string) =>
      dispatch({ type: DesignerActionType.REMOVE_FIELD, payload: { id } }),
    [dispatch],
  );

  const updateField = useCallback(
    (id: string, updates: Partial<IFieldConfig>) =>
      dispatch({ type: DesignerActionType.UPDATE_FIELD, payload: { id, updates } }),
    [dispatch],
  );

  const duplicateField = useCallback(
    (id: string) =>
      dispatch({ type: DesignerActionType.DUPLICATE_FIELD, payload: { id } }),
    [dispatch],
  );

  const reorderFields = useCallback(
    (fieldOrder: string[]) =>
      dispatch({ type: DesignerActionType.REORDER_FIELDS, payload: { fieldOrder } }),
    [dispatch],
  );

  const setSelected = useCallback(
    (id: string | null) =>
      dispatch({ type: DesignerActionType.SET_SELECTED, payload: { id } }),
    [dispatch],
  );

  const addRule = useCallback(
    (fieldId: string, rule: IRule) =>
      dispatch({ type: DesignerActionType.ADD_RULE, payload: { fieldId, rule } }),
    [dispatch],
  );

  const updateRule = useCallback(
    (fieldId: string, ruleIndex: number, rule: IRule) =>
      dispatch({ type: DesignerActionType.UPDATE_RULE, payload: { fieldId, ruleIndex, rule } }),
    [dispatch],
  );

  const removeRule = useCallback(
    (fieldId: string, ruleIndex: number) =>
      dispatch({ type: DesignerActionType.REMOVE_RULE, payload: { fieldId, ruleIndex } }),
    [dispatch],
  );

  const setWizard = useCallback(
    (wizard: IWizardConfig | null) =>
      dispatch({ type: DesignerActionType.SET_WIZARD, payload: { wizard } }),
    [dispatch],
  );

  const updateSettings = useCallback(
    (settings: Partial<IFormSettings>) =>
      dispatch({ type: DesignerActionType.UPDATE_SETTINGS, payload: { settings } }),
    [dispatch],
  );

  const importConfig = useCallback(
    (config: IFormConfig) =>
      dispatch({ type: DesignerActionType.IMPORT_CONFIG, payload: { config } }),
    [dispatch],
  );

  const exportConfig = useCallback((): IFormConfig => {
    dispatch({ type: DesignerActionType.EXPORT_CONFIG });
    const config: IFormConfig = {
      version: 2,
      fields: structuredClone(state.fields),
      fieldOrder: [...state.fieldOrder],
    };
    if (state.wizard) {
      config.wizard = structuredClone(state.wizard);
    }
    if (Object.keys(state.settings).length > 0) {
      config.settings = structuredClone(state.settings);
    }
    return config;
  }, [dispatch, state.fields, state.fieldOrder, state.wizard, state.settings]);

  const undo = useCallback(
    () => dispatch({ type: DesignerActionType.UNDO }),
    [dispatch],
  );

  const redo = useCallback(
    () => dispatch({ type: DesignerActionType.REDO }),
    [dispatch],
  );

  const selectedField = state.selectedFieldId
    ? state.fields[state.selectedFieldId] ?? null
    : null;

  return {
    state,
    dispatch,
    addField,
    removeField,
    updateField,
    duplicateField,
    reorderFields,
    setSelected,
    addRule,
    updateRule,
    removeRule,
    setWizard,
    updateSettings,
    importConfig,
    exportConfig,
    undo,
    redo,
    selectedField,
  };
}
