---
title: Field Types Reference
---

# Field Types Reference

This document provides a comprehensive reference for every component type supported by Formosaic. Component types are defined in `packages/core/src/constants.ts` as the `ComponentTypes` object, and each maps to a string key used in `IFieldConfig.type`.

There are **21 total component keys**: 12 editable, 6 read-only, and 3 structural/abstract types (Fragment, FieldArray, ChoiceSet).

---

## Editable Field Types

| Component Key | Description | Value Type | Uses `options`? |
|---|---|---|---|
| `"Textbox"` | Single-line text input | `string` | No |
| `"Dropdown"` | Single-select dropdown | `string` | Yes |
| `"Toggle"` | Boolean on/off switch | `boolean` | No |
| `"Number"` | Numeric input | `number` | No |
| `"Multiselect"` | Multi-select dropdown | `string[]` | Yes |
| `"DateControl"` | Date picker with clear button | `string` (ISO 8601) | No |
| `"Slider"` | Range slider input | `number` | No |
| `"DynamicFragment"` | Hidden field (no visible UI) | `string` | No |

| `"MultiSelectSearch"` | Searchable multi-select with free-form | `string[]` | Yes |
| `"Textarea"` | Multi-line text with expand-to-modal | `string` | No |
| `"DocumentLinks"` | CRUD list of URL links | `IDocumentLink[]` | No |
| `"StatusDropdown"` | Dropdown with color-coded status indicators | `string` | Yes |

## Read-Only Field Types

| Component Key | Description | Value Type |
|---|---|---|
| `"ReadOnly"` | Static text display | `string` |
| `"ReadOnlyArray"` | List of static text values | `string[]` |
| `"ReadOnlyDateTime"` | Formatted date/time display | `string` (ISO 8601) |
| `"ReadOnlyCumulativeNumber"` | Sum of other numeric fields | `number` (computed) |
| `"ReadOnlyRichText"` | HTML content display | `string` (HTML) |
| `"ReadOnlyWithButton"` | Static text with action button | `string` |

## Structural / Abstract Types

| Component Key | Description | Notes |
|---|---|---|
| `"DynamicFragment"` | Hidden field | Renders as `<input type="hidden">`. No label/wrapper chrome. |
| `"FieldArray"` | Repeating field group | Configured via `IFieldConfig.items`. |
| `"ChoiceSet"` | Custom choice component | No built-in implementation. Consumers must register their own. |

---

## Per-Field Details

### Textbox

Single-line text input. In read-only mode, displays the value as static text.

**Config properties:** `ellipsifyTextCharacters` (number), `placeHolder` (string)

```json
{
  "title": {
    "type": "Textbox",
    "label": "Title",
    "required": true,
    "config": { "ellipsifyTextCharacters": 100 }
  }
}
```

### Dropdown

Single-select dropdown populated from `options`.

**Config properties:** `placeHolder` (string), `setDefaultKeyIfOnlyOneOption` (boolean)

```json
{
  "status": {
    "type": "Dropdown",
    "label": "Status",
    "required": true,
    "options": [
      { "value": "active", "label": "Active" },
      { "value": "inactive", "label": "Inactive" }
    ]
  }
}
```

### Toggle

Boolean on/off switch. In read-only mode, displays "Yes" or "No".

**Note:** Toggle fields skip the `required` validation -- `false` is a valid boolean value.

### Number

Numeric input field. Uses a 1500ms auto-save debounce.

### Multiselect

Multi-select dropdown. Value type is `string[]`.

### DateControl

Date picker with clear button. Stores dates as ISO 8601 strings.

### Slider

Range slider. **Config properties:** `min` (number), `max` (number), `step` (number)

```json
{
  "confidence": {
    "type": "Slider",
    "label": "Confidence Level",
    "config": { "min": 0, "max": 100, "step": 5 }
  }
}
```

### Textarea

Multi-line text area with an expand-to-modal feature.

**Config properties:** `numberOfRows` (number), `ellipsifyTextCharacters` (number), `maxLimit` (number)

### DocumentLinks

CRUD component for managing URL links. Value type: `IDocumentLink[]`.

### StatusDropdown

Dropdown with color-coded status indicators.

**Config properties:** `statusColors` (maps option values to CSS color strings)

```json
{
  "workflowStatus": {
    "type": "StatusDropdown",
    "label": "Status",
    "options": [
      { "value": "draft", "label": "Draft" },
      { "value": "approved", "label": "Approved" }
    ],
    "config": {
      "statusColors": { "draft": "#8A8886", "approved": "#107C10" }
    }
  }
}
```

### FieldArray

Repeating field group. Uses `items`, `minItems`, and `maxItems` on the field config.

```json
{
  "contacts": {
    "type": "FieldArray",
    "label": "Contacts",
    "items": {
      "name": { "type": "Textbox", "label": "Name", "required": true },
      "email": { "type": "Textbox", "label": "Email" }
    },
    "minItems": 1,
    "maxItems": 10
  }
}
```

---

## IOption Interface

```typescript
interface IOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  hidden?: boolean;
  selected?: boolean;
  title?: string;
  data?: unknown;
}
```

## IFieldProps Interface

All field components receive their props via `IFieldProps<T>`, which is passed through `React.cloneElement()` by `RenderField`:

```typescript
interface IFieldProps<T> {
  fieldName?: string;
  readOnly?: boolean;
  required?: boolean;
  error?: FieldError;
  saving?: boolean;
  value?: unknown;
  config?: T;
  options?: IOption[];
  label?: string;
  type?: string;
  setFieldValue?: (fieldName: string, fieldValue: unknown, skipSave?: boolean, timeout?: number) => void;
}
```
