import type {
  IFieldConfig,
  IWizardConfig,
  IFormSettings,
} from "@form-eng/core";

/** Designer state managed by useReducer */
export interface IDesignerState {
  /** Currently selected field ID (null if none selected) */
  selectedFieldId: string | null;
  /** Field definitions keyed by field name */
  fields: Record<string, IFieldConfig>;
  /** Field display order */
  fieldOrder: string[];
  /** Optional wizard configuration */
  wizard: IWizardConfig | null;
  /** Form-level settings */
  settings: IFormSettings;
  /** Whether the config has been modified since last export/import */
  isDirty: boolean;
  /** Clipboard for copy/paste of field configs */
  clipboard: { id: string; field: IFieldConfig } | null;
  /** Undo history stack */
  undoStack: IDesignerSnapshot[];
  /** Redo history stack */
  redoStack: IDesignerSnapshot[];
}

/** Snapshot of fields + fieldOrder for undo/redo */
export interface IDesignerSnapshot {
  fields: Record<string, IFieldConfig>;
  fieldOrder: string[];
  wizard: IWizardConfig | null;
  settings: IFormSettings;
}

/** Initial designer state factory */
export function createInitialDesignerState(): IDesignerState {
  return {
    selectedFieldId: null,
    fields: {},
    fieldOrder: [],
    wizard: null,
    settings: {},
    isDirty: false,
    clipboard: null,
    undoStack: [],
    redoStack: [],
  };
}
