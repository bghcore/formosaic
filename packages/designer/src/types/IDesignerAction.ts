import type {
  IFieldConfig,
  IFormConfig,
  IFormSettings,
  IRule,
  IWizardConfig,
} from "@bghcore/dynamic-forms-core";

/** All designer action types */
export enum DesignerActionType {
  ADD_FIELD = "ADD_FIELD",
  REMOVE_FIELD = "REMOVE_FIELD",
  UPDATE_FIELD = "UPDATE_FIELD",
  DUPLICATE_FIELD = "DUPLICATE_FIELD",
  REORDER_FIELDS = "REORDER_FIELDS",
  SET_SELECTED = "SET_SELECTED",
  ADD_RULE = "ADD_RULE",
  UPDATE_RULE = "UPDATE_RULE",
  REMOVE_RULE = "REMOVE_RULE",
  SET_WIZARD = "SET_WIZARD",
  UPDATE_SETTINGS = "UPDATE_SETTINGS",
  IMPORT_CONFIG = "IMPORT_CONFIG",
  EXPORT_CONFIG = "EXPORT_CONFIG",
  UNDO = "UNDO",
  REDO = "REDO",
  MARK_CLEAN = "MARK_CLEAN",
}

/** Add a new field to the form */
export interface IAddFieldAction {
  type: DesignerActionType.ADD_FIELD;
  payload: {
    /** Field ID (unique key) */
    id: string;
    /** Field configuration */
    field: IFieldConfig;
    /** Insert at this index (appends if omitted) */
    insertAt?: number;
  };
}

/** Remove a field from the form */
export interface IRemoveFieldAction {
  type: DesignerActionType.REMOVE_FIELD;
  payload: { id: string };
}

/** Update an existing field's configuration */
export interface IUpdateFieldAction {
  type: DesignerActionType.UPDATE_FIELD;
  payload: {
    id: string;
    /** Partial field config to merge */
    updates: Partial<IFieldConfig>;
  };
}

/** Duplicate an existing field */
export interface IDuplicateFieldAction {
  type: DesignerActionType.DUPLICATE_FIELD;
  payload: { id: string };
}

/** Reorder the field list */
export interface IReorderFieldsAction {
  type: DesignerActionType.REORDER_FIELDS;
  payload: { fieldOrder: string[] };
}

/** Set the currently selected field */
export interface ISetSelectedAction {
  type: DesignerActionType.SET_SELECTED;
  payload: { id: string | null };
}

/** Add a rule to a field */
export interface IAddRuleAction {
  type: DesignerActionType.ADD_RULE;
  payload: {
    fieldId: string;
    rule: IRule;
  };
}

/** Update a rule on a field */
export interface IUpdateRuleAction {
  type: DesignerActionType.UPDATE_RULE;
  payload: {
    fieldId: string;
    ruleIndex: number;
    rule: IRule;
  };
}

/** Remove a rule from a field */
export interface IRemoveRuleAction {
  type: DesignerActionType.REMOVE_RULE;
  payload: {
    fieldId: string;
    ruleIndex: number;
  };
}

/** Set wizard configuration */
export interface ISetWizardAction {
  type: DesignerActionType.SET_WIZARD;
  payload: { wizard: IWizardConfig | null };
}

/** Update form-level settings */
export interface IUpdateSettingsAction {
  type: DesignerActionType.UPDATE_SETTINGS;
  payload: { settings: Partial<IFormSettings> };
}

/** Import a full IFormConfig */
export interface IImportConfigAction {
  type: DesignerActionType.IMPORT_CONFIG;
  payload: { config: IFormConfig };
}

/** Export triggers mark clean (actual export is a side effect) */
export interface IExportConfigAction {
  type: DesignerActionType.EXPORT_CONFIG;
}

/** Undo last change */
export interface IUndoAction {
  type: DesignerActionType.UNDO;
}

/** Redo last undone change */
export interface IRedoAction {
  type: DesignerActionType.REDO;
}

/** Mark state as clean (not dirty) */
export interface IMarkCleanAction {
  type: DesignerActionType.MARK_CLEAN;
}

/** Union of all designer actions */
export type IDesignerAction =
  | IAddFieldAction
  | IRemoveFieldAction
  | IUpdateFieldAction
  | IDuplicateFieldAction
  | IReorderFieldsAction
  | ISetSelectedAction
  | IAddRuleAction
  | IUpdateRuleAction
  | IRemoveRuleAction
  | ISetWizardAction
  | IUpdateSettingsAction
  | IImportConfigAction
  | IExportConfigAction
  | IUndoAction
  | IRedoAction
  | IMarkCleanAction;
