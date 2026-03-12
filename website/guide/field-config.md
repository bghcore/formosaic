---
title: Field Configuration Reference
---

# Field Configuration Reference

This is the complete reference for `IFieldConfig`, the primary consumer-facing type used to define forms as JSON configuration. Each form is defined as a `Record<string, IFieldConfig>` where the key is the field name and the value is its configuration.

---

## Complete Property Reference

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | `string` | `undefined` | UI component type key (e.g., `"Textbox"`, `"Dropdown"`, `"Toggle"`). Must match a registered component. |
| `required` | `boolean` | `false` | Whether the field is required for form submission. Can be overridden by rules. |
| `hidden` | `boolean` | `false` | Whether the field is hidden (not rendered). Hidden fields skip validation. |
| `readOnly` | `boolean` | `false` | Whether the field is read-only (rendered but not editable). |
| `disabled` | `boolean` | `false` | Whether the field is disabled at the layout level. |
| `label` | `string` | `undefined` | Display label for the field. |
| `defaultValue` | `string \| number \| boolean` | `undefined` | Default value applied when the field is visible and its current value is null. |
| `computedValue` | `string` | `undefined` | Expression string evaluated reactively. Uses `$values.fieldName` or `"$fn.functionName()"`. |
| `computeOnCreateOnly` | `boolean` | `false` | If `true`, the computed value runs only during create (not edit). |
| `confirmInput` | `boolean` | `false` | Whether changing dependents triggers a confirmation modal. |
| `hideOnCreate` | `boolean` | `false` | If `true`, the field is not rendered in create mode. |
| `skipLayoutReadOnly` | `boolean` | `false` | If `true`, the field ignores layout-level disabled/readOnly override. |
| `rules` | `IRule[]` | `undefined` | Declarative dependency rules. |
| `validate` | `IValidationRule[]` | `undefined` | Validation rules (sync, async, and cross-field). |
| `options` | `IOption[]` | `undefined` | Static dropdown options. |
| `config` | `Record<string, unknown>` | `undefined` | Arbitrary configuration passed through to the field component. |
| `items` | `Record<string, IFieldConfig>` | `undefined` | Field configs for repeating field array items. |
| `minItems` | `number` | `undefined` | Minimum number of items in a field array. |
| `maxItems` | `number` | `undefined` | Maximum number of items in a field array. |

---

## Basic Example

```typescript
const fieldConfigs = {
  title: {
    type: "Textbox",
    required: true,
    label: "Project Title",
  },
  status: {
    type: "Dropdown",
    required: true,
    label: "Status",
    options: [
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
    ],
  },
  notes: {
    type: "Textarea",
    label: "Notes",
  },
};
```

---

## Rules

Rules are defined as an `IRule[]` array on a field. See the [Rules Engine](/guide/rules-engine) page for full details.

---

## Validation

Reference validators by name in `IFieldConfig.validate`:

```typescript
{
  email: {
    type: "Textbox",
    label: "Email",
    validate: [
      { validator: "EmailValidation" },
      { validator: "checkEmailUnique", async: true, debounceMs: 500 },
    ],
  },
}
```

See the [Validation](/guide/validation) page for the full validator reference.

---

## Computed Values

```typescript
{
  total: {
    type: "Number",
    label: "Total",
    readOnly: true,
    computedValue: "$values.quantity * $values.unitPrice",
  },
}
```

See the [Expression Syntax](/guide/expression-syntax) page for the full expression reference.

---

## Built-in Component Types

| Key | Description |
|-----|-------------|
| `"Textbox"` | Single-line text input |
| `"Dropdown"` | Single-select dropdown |
| `"Toggle"` | Boolean toggle switch |
| `"Number"` | Numeric input |
| `"Multiselect"` | Multi-select dropdown |
| `"DateControl"` | Date picker |
| `"Slider"` | Range slider |
| `"DynamicFragment"` | Hidden fragment |
| `"SimpleDropdown"` | Simplified dropdown |
| `"MultiSelectSearch"` | Multi-select with search |
| `"Textarea"` | Multi-line text input |
| `"DocumentLinks"` | URL link CRUD |
| `"StatusDropdown"` | Dropdown with color indicators |
| `"ReadOnly"` | Read-only text display |
| `"ReadOnlyArray"` | Read-only array display |
| `"ReadOnlyDateTime"` | Read-only date/time display |
| `"ReadOnlyCumulativeNumber"` | Read-only cumulative number |
| `"ReadOnlyRichText"` | Read-only rich text |
| `"ReadOnlyWithButton"` | Read-only with action button |
| `"ChoiceSet"` | Choice set / radio group |
| `"FieldArray"` | Repeating field array |
