---
title: Canonical Field Contracts
---

# Canonical Field Contracts

This document defines the canonical contract for each of the 13 Tier 1 field types. Every adapter package must conform to these contracts. The contracts specify value types, empty semantics, serialization, and rendering behavior that all adapters share.

## General Rules

- All field components receive `IFieldProps<T>` via `React.cloneElement()`.
- Adapters must convert UI-library-specific types at the component boundary, never storing library-specific values in form state.
- The `value` prop comes from react-hook-form and may be `undefined`, `null`, or the typed value.
- The `setFieldValue(fieldName, value, skipSave?, timeout?)` callback writes values back to form state.
- All fields must support both editable and `readOnly` rendering modes.

---

## Textbox

| Property | Value |
|---|---|
| **Type key** | `"Textbox"` |
| **Value type** | `string` |
| **Empty value** | `undefined`, `null`, or `""` |
| **Default value** | `undefined` (renders as `""` via `?? ""` coercion) |
| **Serialization** | Plain string |
| **Uses options** | No |
| **Config shape** | `{ ellipsifyTextCharacters?: number; placeHolder?: string; multiline?: boolean }` |
| **ReadOnly display** | `ReadOnlyText` -- renders the string, optionally truncated via `ellipsifyTextCharacters` |
| **Save debounce** | 3000ms |

**Null/undefined/empty string behavior:**
- `null` and `undefined` both render as empty input (`?? ""`)
- `""` is treated as empty for required validation
- All three are functionally equivalent for display purposes

---

## Number

| Property | Value |
|---|---|
| **Type key** | `"Number"` |
| **Value type** | `number` |
| **Empty value** | `undefined`, `null` |
| **Default value** | `undefined` (renders as `""` via `isNull()` check) |
| **Serialization** | JavaScript number (not string) |
| **Uses options** | No |
| **Config shape** | `{}` (no custom config) |
| **ReadOnly display** | `ReadOnlyText` with `String(value)` |
| **Save debounce** | 1500ms |

**Null/undefined/empty string behavior:**
- `null` and `undefined` render as empty input
- `0` is a valid value, not empty
- Input is parsed via `Number()` and rejected if `isNaN`
- Adapters must call `setFieldValue` with a `number`, not a string

---

## Toggle

| Property | Value |
|---|---|
| **Type key** | `"Toggle"` |
| **Value type** | `boolean` |
| **Empty value** | `undefined`, `null`, `false` |
| **Default value** | `undefined` (renders as unchecked via `!!value`) |
| **Serialization** | Boolean (`true` / `false`) |
| **Uses options** | No |
| **Config shape** | `{}` (no custom config) |
| **ReadOnly display** | `ReadOnlyText` with `convertBooleanToYesOrNoText(value)` -- shows "Yes" or "No" |
| **Save debounce** | None (immediate) |

**Null/undefined/empty string behavior:**
- `null`, `undefined`, and `false` all render as unchecked
- Only `true` renders as checked
- The `!!value` coercion handles all falsy values uniformly

---

## Dropdown

| Property | Value |
|---|---|
| **Type key** | `"Dropdown"` |
| **Value type** | `string` |
| **Empty value** | `undefined`, `null`, `""` |
| **Default value** | `undefined` (renders as `""` placeholder option) |
| **Serialization** | String (the `value` property from the selected `IOption`) |
| **Uses options** | Yes -- `IOption[]` via `options` prop |
| **Config shape** | `{ placeHolder?: string; setDefaultKeyIfOnlyOneOption?: boolean }` |
| **ReadOnly display** | `ReadOnlyText` with the raw value string |
| **Save debounce** | None (immediate) |

**Null/undefined/empty string behavior:**
- `null` and `undefined` coerce to `""` via `?? ""`
- `""` selects the placeholder option
- When `setDefaultKeyIfOnlyOneOption` is true and exactly one option exists, auto-selects it on mount

**Options contract:**
- Options are `IOption[]` with `{ value: string | number; label: string; disabled?: boolean; group?: string }`
- Option values are coerced to strings via `String(option.value)` for `<option>` elements
- Selected value comparison uses string equality

---

## SimpleDropdown

| Property | Value |
|---|---|
| **Type key** | `"SimpleDropdown"` |
| **Value type** | `string` |
| **Empty value** | `undefined`, `null`, `""` |
| **Default value** | `undefined` (renders as `""` placeholder option) |
| **Serialization** | Plain string |
| **Uses options** | No -- uses `config.dropdownOptions: string[]` instead of `IOption[]` |
| **Config shape** | `{ dropdownOptions?: string[]; placeHolder?: string }` |
| **ReadOnly display** | `ReadOnlyText` with the raw value string |
| **Save debounce** | None (immediate) |

**Null/undefined/empty string behavior:**
- Same as Dropdown: `null`/`undefined` coerce to `""`, which selects the placeholder

**Key difference from Dropdown:**
- Options come from `config.dropdownOptions` as a simple `string[]`, not from the `options` prop
- Each string serves as both the display label and the stored value

---

## Multiselect

| Property | Value |
|---|---|
| **Type key** | `"Multiselect"` |
| **Value type** | `string[]` |
| **Empty value** | `undefined`, `null`, `[]` |
| **Default value** | `undefined` (coerced to `[]` via `?? []`) |
| **Serialization** | Array of strings |
| **Uses options** | Yes -- `IOption[]` via `options` prop |
| **Config shape** | `{}` (no custom config) |
| **ReadOnly display** | `<ul>` list of selected values, or `"-"` if empty |
| **Save debounce** | 1500ms |

**Null/undefined/empty string behavior:**
- `null` and `undefined` coerce to `[]`
- `[]` (empty array) is treated as empty for required validation
- Values are always stored as `string[]`

---

## DateControl

| Property | Value |
|---|---|
| **Type key** | `"DateControl"` |
| **Value type** | `string` (ISO 8601 UTC) |
| **Empty value** | `undefined`, `null` |
| **Default value** | `undefined` (renders as empty date picker) |
| **Serialization** | ISO 8601 string (e.g., `"2024-01-15T00:00:00.000Z"`) |
| **Uses options** | No |
| **Config shape** | `{}` (no custom config) |
| **ReadOnly display** | `<time>` element with `formatDateTime(value, { hideTimestamp: true })` or `"-"` if null |
| **Save debounce** | None (immediate) |

**Null/undefined/empty string behavior:**
- `null` means "no date selected" -- this is the canonical empty value
- `undefined` also renders as empty
- Clearing a date calls `setFieldValue(fieldName, null)`
- Adapters must convert their date library objects to ISO strings at the boundary (see [Date Policy](../guide/date-policy))

**Adapter boundary rule:**
- All adapters store ISO 8601 strings in form state
- Adapter-specific date objects (dayjs, Date, etc.) are created at render time and converted back to ISO on change

---

## Slider

| Property | Value |
|---|---|
| **Type key** | `"Slider"` |
| **Value type** | `number` |
| **Empty value** | `undefined`, `null` |
| **Default value** | `undefined` (renders as `0` via `?? 0`) |
| **Serialization** | JavaScript number |
| **Uses options** | No |
| **Config shape** | `{ max?: number; min?: number; step?: number }` |
| **ReadOnly display** | `ReadOnlyText` with `String(value)` |
| **Save debounce** | None (immediate) |

**Null/undefined/empty string behavior:**
- `null` and `undefined` coerce to `0` for the range input
- `0` is a valid value, not considered empty (unless `min > 0`)

---

## RadioGroup

| Property | Value |
|---|---|
| **Type key** | `"RadioGroup"` |
| **Value type** | `string` |
| **Empty value** | `undefined`, `null` |
| **Default value** | `undefined` (no radio selected) |
| **Serialization** | String (the `value` property from the selected `IOption`) |
| **Uses options** | Yes -- `IOption[]` via `options` prop |
| **Config shape** | `{}` (no custom config) |
| **ReadOnly display** | `ReadOnlyText` with the matching option label, or the raw value if no label match |
| **Save debounce** | None (immediate) |

**Null/undefined/empty string behavior:**
- `null` and `undefined` result in no radio being selected
- Comparison uses `String(value) === String(option.value)` for loose matching

---

## CheckboxGroup

| Property | Value |
|---|---|
| **Type key** | `"CheckboxGroup"` |
| **Value type** | `string[]` |
| **Empty value** | `undefined`, `null`, `[]` |
| **Default value** | `undefined` (coerced to `[]` via `Array.isArray` check) |
| **Serialization** | Array of strings |
| **Uses options** | Yes -- `IOption[]` via `options` prop |
| **Config shape** | `{}` (no custom config) |
| **ReadOnly display** | `ReadOnlyText` with comma-separated matching option labels |
| **Save debounce** | None (immediate) |

**Null/undefined/empty string behavior:**
- `null` and `undefined` are coerced to `[]` via `Array.isArray(value) ? value : []`
- `[]` is treated as empty for required validation
- On change, checked values are added and unchecked values are filtered out

---

## Textarea

| Property | Value |
|---|---|
| **Type key** | `"Textarea"` |
| **Value type** | `string` |
| **Empty value** | `undefined`, `null`, `""` |
| **Default value** | `undefined` (renders as `""`) |
| **Serialization** | Plain string |
| **Uses options** | No |
| **Config shape** | `{ autoAdjustHeight?: boolean; numberOfRows?: number; ellipsifyTextCharacters?: number; additionalInfo?: string; maxLimit?: number; saveCallback?: () => void; renderExtraModalFooter?: () => ReactNode }` |
| **ReadOnly display** | `ReadOnlyText` with optional truncation via `ellipsifyTextCharacters` |
| **Save debounce** | 3000ms |

**Null/undefined/empty string behavior:**
- `null` and `undefined` render as `""` via template literal coercion
- Supports an expanded modal editor for long-form text

**Note:** In the `fluent` adapter, `Textarea` maps to `PopOutEditor` (a rich textarea with expand-to-modal). In `headless`, `mui`, `antd`, `chakra`, and `mantine` adapters it maps to `Textarea`.

---

## ReadOnly

| Property | Value |
|---|---|
| **Type key** | `"ReadOnly"` |
| **Value type** | `string` (display only) |
| **Empty value** | `undefined`, `null`, `""` |
| **Default value** | `undefined` |
| **Serialization** | Plain string (never written back to form state) |
| **Uses options** | No |
| **Config shape** | `IReadOnlyFieldProps` -- adapter-specific config for display formatting |
| **ReadOnly display** | Always read-only: `ReadOnlyText` component |
| **Save debounce** | N/A (never saves) |

**Null/undefined/empty string behavior:**
- All empty values render as `"-"` or empty string depending on `ReadOnlyText` implementation
- This field type is always read-only regardless of the `readOnly` prop

---

## DynamicFragment

| Property | Value |
|---|---|
| **Type key** | `"DynamicFragment"` |
| **Value type** | `string` |
| **Empty value** | `undefined`, `null` |
| **Default value** | `undefined` |
| **Serialization** | Plain string (stored in hidden input) |
| **Uses options** | No |
| **Config shape** | `{}` (no custom config) |
| **ReadOnly display** | Same as editable: `<input type="hidden">` (invisible in both modes) |
| **Save debounce** | N/A (value set programmatically) |

**Null/undefined/empty string behavior:**
- Value is stored in a hidden input and not visible to the user
- Used for computed values, parent references, and metadata fields
- Renders as `<input type="hidden">` in all adapters

---

## Summary Table

| Field | Value Type | Empty Value | Uses Options | Save Debounce |
|---|---|---|---|---|
| Textbox | `string` | `undefined` / `null` / `""` | No | 3000ms |
| Number | `number` | `undefined` / `null` | No | 1500ms |
| Toggle | `boolean` | `undefined` / `null` / `false` | No | Immediate |
| Dropdown | `string` | `undefined` / `null` / `""` | `IOption[]` | Immediate |
| SimpleDropdown | `string` | `undefined` / `null` / `""` | `config.dropdownOptions` | Immediate |
| Multiselect | `string[]` | `undefined` / `null` / `[]` | `IOption[]` | 1500ms |
| DateControl | `string` (ISO) | `undefined` / `null` | No | Immediate |
| Slider | `number` | `undefined` / `null` | No | Immediate |
| RadioGroup | `string` | `undefined` / `null` | `IOption[]` | Immediate |
| CheckboxGroup | `string[]` | `undefined` / `null` / `[]` | `IOption[]` | Immediate |
| Textarea | `string` | `undefined` / `null` / `""` | No | 3000ms |
| ReadOnly | `string` | `undefined` / `null` / `""` | No | N/A |
| DynamicFragment | `string` | `undefined` / `null` | No | N/A |

---

## ReadOnly Contract

Every adapter must conform to these rules when rendering a field in `readOnly` mode. These rules are non-negotiable for Tier 1 parity.

### 1. Universal readOnly support

Every Tier 1 field must support `readOnly` mode. There are no exceptions. When `props.readOnly` is `true`, the field must render display-only content.

### 2. No interactive elements in readOnly output

ReadOnly rendering must not produce `<input>`, `<select>`, or `<textarea>` elements in the DOM output. The only exception is `DynamicFragment`, which renders `<input type="hidden">` (invisible, non-interactive).

### 3. Empty display sentinel

All fields must render `"-"` (a single hyphen) as the display text for missing, null, or undefined values. This applies uniformly across all adapters and all field types.

### 4. Text and Number fields

- **Textbox**: Renders the string value via `ReadOnlyText`, or `"-"` if the value is null/undefined/empty string.
- **Number**: Renders `String(value)` via `ReadOnlyText`, or `"-"` if the value is null/undefined.

### 5. Boolean fields (Toggle)

Renders `"Yes"` or `"No"` via `convertBooleanToYesOrNoText()`. An undefined/null value renders as `""` (empty string from the conversion function).

### 6. Single-select fields (Dropdown, SimpleDropdown, RadioGroup)

Renders the selected option **label** (not the option value), or `"-"` if no option is selected. For `RadioGroup`, the adapter looks up the matching option label via `options.find()`. For `Dropdown` and `SimpleDropdown`, the raw value string is passed to `ReadOnlyText` (the label lookup may happen at a higher level).

### 7. Multi-select fields (MultiSelect, CheckboxGroup)

Renders comma-separated option **labels** for all selected values, or `"-"` if the selection is empty. `CheckboxGroup` uses `options.filter().map(o => o.label).join(", ")`. `MultiSelect` in some adapters renders a `<ul>` list of selected values.

### 8. Date fields (DateControl)

Renders `formatDateTime(value, { hideTimestamp: true })` output for non-null values, or `"-"` if the value is null/undefined. Some adapters (headless) use a `<time>` element with a `dateTime` attribute for semantic markup.

### 9. DynamicFragment

Always renders `<input type="hidden">` regardless of readOnly state. This is the only field type that produces an `<input>` element in readOnly mode. The hidden input is invisible and non-interactive.

### 10. ReadOnly field type

The `ReadOnly` field type is always in read-only mode regardless of the `readOnly` prop. It delegates directly to the adapter's `ReadOnlyText` component.
