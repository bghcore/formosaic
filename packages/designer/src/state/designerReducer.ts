import type { IDesignerAction } from "../types/IDesignerAction";
import { DesignerActionType } from "../types/IDesignerAction";
import type { IDesignerState, IDesignerSnapshot } from "../types/IDesignerState";

const MAX_UNDO_STACK = 50;

/** Capture a snapshot for undo/redo */
function takeSnapshot(state: IDesignerState): IDesignerSnapshot {
  return {
    fields: structuredClone(state.fields),
    fieldOrder: [...state.fieldOrder],
    wizard: state.wizard ? structuredClone(state.wizard) : null,
    settings: structuredClone(state.settings),
  };
}

/** Push a snapshot onto the undo stack and clear redo */
function pushUndo(state: IDesignerState): Pick<IDesignerState, "undoStack" | "redoStack"> {
  const undoStack = [...state.undoStack, takeSnapshot(state)];
  if (undoStack.length > MAX_UNDO_STACK) {
    undoStack.shift();
  }
  return { undoStack, redoStack: [] };
}

/** Generate a unique field ID based on type */
function generateFieldId(type: string, existingIds: string[]): string {
  const base = type.charAt(0).toLowerCase() + type.slice(1);
  let counter = 1;
  let id = `${base}${counter}`;
  while (existingIds.includes(id)) {
    counter++;
    id = `${base}${counter}`;
  }
  return id;
}

export function designerReducer(
  state: IDesignerState,
  action: IDesignerAction,
): IDesignerState {
  switch (action.type) {
    case DesignerActionType.ADD_FIELD: {
      const { id, field, insertAt } = action.payload;
      if (state.fields[id]) return state;
      const undo = pushUndo(state);
      const fields = { ...state.fields, [id]: structuredClone(field) };
      const fieldOrder = [...state.fieldOrder];
      if (insertAt !== undefined && insertAt >= 0 && insertAt <= fieldOrder.length) {
        fieldOrder.splice(insertAt, 0, id);
      } else {
        fieldOrder.push(id);
      }
      return {
        ...state,
        ...undo,
        fields,
        fieldOrder,
        selectedFieldId: id,
        isDirty: true,
      };
    }

    case DesignerActionType.REMOVE_FIELD: {
      const { id } = action.payload;
      if (!state.fields[id]) return state;
      const undo = pushUndo(state);
      const { [id]: _removed, ...fields } = state.fields;
      const fieldOrder = state.fieldOrder.filter((fid) => fid !== id);
      return {
        ...state,
        ...undo,
        fields,
        fieldOrder,
        selectedFieldId: state.selectedFieldId === id ? null : state.selectedFieldId,
        isDirty: true,
      };
    }

    case DesignerActionType.UPDATE_FIELD: {
      const { id, updates } = action.payload;
      if (!state.fields[id]) return state;
      const undo = pushUndo(state);
      const fields = {
        ...state.fields,
        [id]: { ...state.fields[id], ...updates },
      };
      return { ...state, ...undo, fields, isDirty: true };
    }

    case DesignerActionType.DUPLICATE_FIELD: {
      const { id } = action.payload;
      const original = state.fields[id];
      if (!original) return state;
      const undo = pushUndo(state);
      const newId = generateFieldId(original.type, Object.keys(state.fields));
      const fields = { ...state.fields, [newId]: structuredClone(original) };
      const fieldOrder = [...state.fieldOrder];
      const sourceIndex = fieldOrder.indexOf(id);
      fieldOrder.splice(sourceIndex + 1, 0, newId);
      return {
        ...state,
        ...undo,
        fields,
        fieldOrder,
        selectedFieldId: newId,
        isDirty: true,
      };
    }

    case DesignerActionType.REORDER_FIELDS: {
      const { fieldOrder } = action.payload;
      const undo = pushUndo(state);
      return { ...state, ...undo, fieldOrder, isDirty: true };
    }

    case DesignerActionType.SET_SELECTED: {
      return { ...state, selectedFieldId: action.payload.id };
    }

    case DesignerActionType.ADD_RULE: {
      const { fieldId, rule } = action.payload;
      if (!state.fields[fieldId]) return state;
      const undo = pushUndo(state);
      const existingRules = state.fields[fieldId].rules ?? [];
      const fields = {
        ...state.fields,
        [fieldId]: {
          ...state.fields[fieldId],
          rules: [...existingRules, structuredClone(rule)],
        },
      };
      return { ...state, ...undo, fields, isDirty: true };
    }

    case DesignerActionType.UPDATE_RULE: {
      const { fieldId, ruleIndex, rule } = action.payload;
      const field = state.fields[fieldId];
      if (!field?.rules?.[ruleIndex]) return state;
      const undo = pushUndo(state);
      const rules = [...field.rules];
      rules[ruleIndex] = structuredClone(rule);
      const fields = {
        ...state.fields,
        [fieldId]: { ...field, rules },
      };
      return { ...state, ...undo, fields, isDirty: true };
    }

    case DesignerActionType.REMOVE_RULE: {
      const { fieldId, ruleIndex } = action.payload;
      const field = state.fields[fieldId];
      if (!field?.rules?.[ruleIndex]) return state;
      const undo = pushUndo(state);
      const rules = field.rules.filter((_, i) => i !== ruleIndex);
      const fields = {
        ...state.fields,
        [fieldId]: { ...field, rules: rules.length > 0 ? rules : undefined },
      };
      return { ...state, ...undo, fields, isDirty: true };
    }

    case DesignerActionType.SET_WIZARD: {
      const undo = pushUndo(state);
      return {
        ...state,
        ...undo,
        wizard: action.payload.wizard ? structuredClone(action.payload.wizard) : null,
        isDirty: true,
      };
    }

    case DesignerActionType.UPDATE_SETTINGS: {
      const undo = pushUndo(state);
      return {
        ...state,
        ...undo,
        settings: { ...state.settings, ...action.payload.settings },
        isDirty: true,
      };
    }

    case DesignerActionType.IMPORT_CONFIG: {
      const { config } = action.payload;
      const undo = pushUndo(state);
      return {
        ...state,
        ...undo,
        fields: structuredClone(config.fields),
        fieldOrder: config.fieldOrder ?? Object.keys(config.fields),
        wizard: config.wizard ? structuredClone(config.wizard) : null,
        settings: config.settings ? structuredClone(config.settings) : {},
        selectedFieldId: null,
        isDirty: false,
      };
    }

    case DesignerActionType.EXPORT_CONFIG: {
      return { ...state, isDirty: false };
    }

    case DesignerActionType.UNDO: {
      if (state.undoStack.length === 0) return state;
      const undoStack = [...state.undoStack];
      const snapshot = undoStack.pop()!;
      const redoStack = [...state.redoStack, takeSnapshot(state)];
      return {
        ...state,
        ...snapshot,
        undoStack,
        redoStack,
        selectedFieldId: null,
        isDirty: true,
      };
    }

    case DesignerActionType.REDO: {
      if (state.redoStack.length === 0) return state;
      const redoStack = [...state.redoStack];
      const snapshot = redoStack.pop()!;
      const undoStack = [...state.undoStack, takeSnapshot(state)];
      return {
        ...state,
        ...snapshot,
        undoStack,
        redoStack,
        selectedFieldId: null,
        isDirty: true,
      };
    }

    case DesignerActionType.MARK_CLEAN: {
      return { ...state, isDirty: false };
    }

    default:
      return state;
  }
}
