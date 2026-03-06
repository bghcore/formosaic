# AGENTS.md -- @form-eng/designer

## Package Purpose

Visual drag-and-drop form builder for `@form-eng/core`. Outputs valid `IFormConfig` v2 JSON. Provides components for field palette, canvas, property editor, rule builder, wizard configurator, and import/export.

## Critical Constraints

- **No UI library imports.** Uses plain HTML + inline styles + CSS custom properties. No `@fluentui/*`, `@mui/*`, or CSS-in-JS.
- **No external DnD libraries.** Uses HTML5 native drag-and-drop API (dragstart, dragover, drop).
- **Import core types from `@form-eng/core`**, not from relative paths.
- **All state managed via `useReducer`** in `DesignerProvider` with undo/redo support.
- **Output must always be a valid `IFormConfig` v2 object** with `version: 2`.

## Architecture

```
DesignerProvider (useReducer + undo/redo stack)
  -> FormDesigner (layout with 5 tabs: Design, Rules, Wizard, Preview, Import/Export)
    -> FieldPalette (draggable field types)
    -> FormCanvas (drop zone, reorder, select, delete)
    -> FieldConfigPanel (property editor for selected field)
    -> RuleBuilder (condition + effect editor)
    -> WizardConfigurator (step manager)
    -> ConfigPreview (live JSON)
    -> ImportExport (paste/upload/download)
```

## Key Files

| File | Purpose |
|------|---------|
| `src/types/IDesignerState.ts` | Designer state: selectedFieldId, fields, fieldOrder, wizard, isDirty, undoStack, redoStack |
| `src/types/IDesignerAction.ts` | 16 action types: ADD_FIELD, REMOVE_FIELD, UPDATE_FIELD, DUPLICATE_FIELD, REORDER_FIELDS, SET_SELECTED, ADD_RULE, UPDATE_RULE, REMOVE_RULE, SET_WIZARD, UPDATE_SETTINGS, IMPORT_CONFIG, EXPORT_CONFIG, UNDO, REDO, MARK_CLEAN |
| `src/state/designerReducer.ts` | Reducer with undo/redo (50-snapshot stack), structuredClone for immutability |
| `src/state/DesignerProvider.tsx` | React context with useMemo for stable value |
| `src/state/useDesigner.ts` | Hook with all action helpers + `exportConfig()` producing valid IFormConfig v2 |
| `src/components/FormDesigner.tsx` | Main layout with 5 tabs, toolbar with undo/redo + field count |
| `src/components/FieldPalette.tsx` | All ComponentTypes in 4 groups (Input, Selection, Layout, Read Only). HTML5 drag with dataTransfer |
| `src/components/FormCanvas.tsx` | Drop zone with field cards. Supports palette drops + canvas reorder. Shows label, type badge, required/hidden/rules badges |
| `src/components/FieldConfigPanel.tsx` | 4 tabs: General, Options, Validation, Config |
| `src/components/RuleBuilder.tsx` | Full condition builder with 15 operators + AND/OR/NOT. Effect editor with checkboxes |
| `src/components/ConfigPreview.tsx` | Live JSON preview with clipboard copy |
| `src/components/WizardConfigurator.tsx` | Enable/disable wizard, add/remove steps, assign fields, navigation options |
| `src/components/ImportExport.tsx` | Import via paste or file upload with v2 validation, export as JSON download |
| `src/styles.css` | CSS custom properties (`--designer-*` prefix) |
| `src/index.ts` | Barrel exports |

## State Actions

| Action | Purpose |
|--------|---------|
| `ADD_FIELD` | Add a new field from the palette |
| `REMOVE_FIELD` | Delete a field and remove from order |
| `UPDATE_FIELD` | Update field config properties |
| `DUPLICATE_FIELD` | Clone a field with new ID |
| `REORDER_FIELDS` | Reorder fieldOrder array |
| `SET_SELECTED` | Select a field for editing |
| `ADD_RULE` | Add a rule to the selected field |
| `UPDATE_RULE` | Update a rule on the selected field |
| `REMOVE_RULE` | Remove a rule from the selected field |
| `SET_WIZARD` | Set the wizard configuration |
| `UPDATE_SETTINGS` | Update form settings |
| `IMPORT_CONFIG` | Import an IFormConfig JSON |
| `EXPORT_CONFIG` | No-op (export is via useDesigner) |
| `UNDO` | Restore previous state from undo stack |
| `REDO` | Restore next state from redo stack |
| `MARK_CLEAN` | Reset isDirty flag |

## Adding a New Feature

1. Add the action type to `IDesignerAction.ts`
2. Handle in `designerReducer.ts` (remember to push to undo stack)
3. Add a helper method in `useDesigner.ts`
4. Wire into the appropriate component
