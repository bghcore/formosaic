---
title: Field Config API Reference
---

# Field Config API Reference

Complete reference for `IFieldConfig`, the primary type used to define forms as JSON configuration.

---

## Complete Property Reference

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | `string` | `undefined` | UI component type key. Must match a registered component. |
| `required` | `boolean` | `false` | Whether the field is required. Can be overridden by rules. |
| `hidden` | `boolean` | `false` | Whether the field is hidden. Hidden fields skip validation. |
| `readOnly` | `boolean` | `false` | Whether the field is read-only. |
| `disabled` | `boolean` | `false` | Whether the field is disabled at the layout level. |
| `label` | `string` | `undefined` | Display label for the field. |
| `defaultValue` | `string \| number \| boolean` | `undefined` | Default value when field is visible and value is null. |
| `computedValue` | `string` | `undefined` | Expression or value function reference. |
| `computeOnCreateOnly` | `boolean` | `false` | Computed value runs only during create. |
| `confirmInput` | `boolean` | `false` | Triggers confirmation modal on dependent changes. |
| `hideOnCreate` | `boolean` | `false` | Field not rendered in create mode. |
| `skipLayoutReadOnly` | `boolean` | `false` | Ignores layout-level disabled/readOnly. |
| `rules` | `IRule[]` | `undefined` | Declarative dependency rules. |
| `validate` | `IValidationRule[]` | `undefined` | Validation rules. |
| `options` | `IOption[]` | `undefined` | Static dropdown options. |
| `config` | `Record<string, unknown>` | `undefined` | Arbitrary config passed to the field component. |
| `items` | `Record<string, IFieldConfig>` | `undefined` | Field array item definitions. |
| `minItems` | `number` | `undefined` | Minimum items in a field array. |
| `maxItems` | `number` | `undefined` | Maximum items in a field array. |

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

---

## IFieldProps Interface

Props injected into every field component via `React.cloneElement`:

```typescript
interface IFieldProps<T> {
  fieldName?: string;
  testId?: string;
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

---

## IRuntimeFieldState

After processing, each `IFieldConfig` becomes an `IRuntimeFieldState` at runtime:

| Property | Type | Description |
|----------|------|-------------|
| `type` | `string` | UI component type (may be swapped by rules) |
| `required` | `boolean` | Whether the field is required |
| `hidden` | `boolean` | Whether the field is hidden |
| `readOnly` | `boolean` | Whether the field is read-only |
| `validate` | `IValidationRule[]` | Active validation rules |
| `options` | `IOption[]` | Currently available dropdown options |
| `computedValue` | `string` | Computed value expression |
| `dependentFields` | `string[]` | Fields that this field's value changes affect |
| `dependsOnFields` | `string[]` | Fields whose values affect this field |

---

## Built-in Component Types

| Key | Constant | Description |
|-----|----------|-------------|
| `"Textbox"` | `ComponentTypes.Textbox` | Single-line text input |
| `"Dropdown"` | `ComponentTypes.Dropdown` | Single-select dropdown |
| `"Toggle"` | `ComponentTypes.Toggle` | Boolean toggle switch |
| `"Number"` | `ComponentTypes.Number` | Numeric input |
| `"Multiselect"` | `ComponentTypes.MultiSelect` | Multi-select dropdown |
| `"DateControl"` | `ComponentTypes.DateControl` | Date picker |
| `"Slider"` | `ComponentTypes.Slider` | Range slider |
| `"DynamicFragment"` | `ComponentTypes.Fragment` | Hidden fragment |
| `"MultiSelectSearch"` | `ComponentTypes.MultiSelectSearch` | Multi-select with search |
| `"Textarea"` | `ComponentTypes.Textarea` | Multi-line text input |
| `"DocumentLinks"` | `ComponentTypes.DocumentLinks` | URL link CRUD |
| `"StatusDropdown"` | `ComponentTypes.StatusDropdown` | Dropdown with color indicators |
| `"ReadOnly"` | `ComponentTypes.ReadOnly` | Read-only text display |
| `"ReadOnlyArray"` | `ComponentTypes.ReadOnlyArray` | Read-only array display |
| `"ReadOnlyDateTime"` | `ComponentTypes.ReadOnlyDateTime` | Read-only date/time |
| `"ReadOnlyCumulativeNumber"` | `ComponentTypes.ReadOnlyCumulativeNumber` | Read-only cumulative number |
| `"ReadOnlyRichText"` | `ComponentTypes.ReadOnlyRichText` | Read-only rich text |
| `"ReadOnlyWithButton"` | `ComponentTypes.ReadOnlyWithButton` | Read-only with action button |
| `"ChoiceSet"` | `ComponentTypes.ChoiceSet` | Choice set / radio group |
| `"FieldArray"` | `ComponentTypes.FieldArray` | Repeating field array |
