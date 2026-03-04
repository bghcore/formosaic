# Field Configuration Reference

This is the complete reference for `IFieldConfig`, the primary consumer-facing type used to define forms as JSON configuration. Each form is defined as a `Dictionary<IFieldConfig>` (i.e., `Record<string, IFieldConfig>`) where the key is the field name and the value is its configuration.

At runtime, field configs are processed into `IRuntimeFieldState` objects by the business rules engine.

---

## Complete Property Reference

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | `string` | `undefined` | UI component type key (e.g., `"Textbox"`, `"Dropdown"`, `"Toggle"`). Must match a registered component in `InjectedFieldProvider`. |
| `required` | `boolean` | `false` | Whether the field is required for form submission. Can be overridden by dependency rules. |
| `hidden` | `boolean` | `false` | Whether the field is hidden (not rendered). Can be toggled by dependency rules. Hidden fields skip validation. |
| `readOnly` | `boolean` | `false` | Whether the field is read-only (rendered but not editable). |
| `disabled` | `boolean` | `false` | Whether the field is disabled at the layout level. Affects the read-only calculation. |
| `label` | `string` | `undefined` | Display label for the field. Used in `FieldWrapper` and filter matching. |
| `defaultValue` | `string \| number \| boolean` | `undefined` | Default value applied when the field is visible and its current value is null. |
| `computedValue` | `string` | `undefined` | Expression string evaluated reactively on dependency changes. Uses `$values.fieldName` for references (see [Expression Engine Reference](./expression-syntax.md)). Also supports value function syntax: `"$fn.functionName()"`. |
| `computeOnCreateOnly` | `boolean` | `false` | If `true`, the computed value runs only during create (not edit). |
| `confirmInput` | `boolean` | `false` | Whether changing fields that depend on this one triggers a confirmation modal before save. |
| `hideOnCreate` | `boolean` | `false` | If `true`, the field is not rendered when the form is in create mode. |
| `skipLayoutReadOnly` | `boolean` | `false` | If `true`, the field ignores the layout-level disabled/readOnly override. |
| `rules` | `IRule[]` | `undefined` | Declarative dependency rules. See [Rules](#rules) section. |
| `validate` | `IValidationRule[]` | `undefined` | Validation rules (sync, async, and cross-field). See [Validation](#validation) section. |
| `options` | `IOption[]` | `undefined` | Static dropdown options for Dropdown, StatusDropdown, and Multiselect components. |
| `deprecatedDropdownOptions` | `IDeprecatedOption[]` | `undefined` | Deprecated dropdown option mappings for backward compatibility with old values. |
| `config` | `Dictionary<string \| boolean \| number \| string[] \| object>` | `undefined` | Arbitrary configuration passed through to the field component (e.g., icons, sort settings). |
| `items` | `Record<string, IFieldConfig>` | `undefined` | Field configs for repeating field array items. Each key is a sub-field name. |
| `minItems` | `number` | `undefined` | Minimum number of items allowed in a field array. |
| `maxItems` | `number` | `undefined` | Maximum number of items allowed in a field array. |

---

## Property Groups

### Basic Properties

These are the most commonly used properties for defining a field.

| Property | Type | Description |
|----------|------|-------------|
| `type` | `string` | The component type key. Must match a registered component. See [Built-in Component Types](#built-in-component-types). |
| `required` | `boolean` | Marks the field as required. The required indicator appears in the field wrapper. |
| `hidden` | `boolean` | Hides the field entirely. Hidden fields are excluded from validation. |
| `readOnly` | `boolean` | Renders the field but prevents editing. |
| `disabled` | `boolean` | Layout-level disable flag. |
| `label` | `string` | The field's display label. |

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
    readOnly: false,
  },
};
```

---

### Rules

Rules are the core mechanism for declarative business rules. They are defined as an `IRule[]` array on a field and express how this field's value affects other fields (or how multiple fields combine to affect this field).

**Example: Simple value-based rules**

```typescript
// On the "status" field config:
rules: [
  {
    when: { field: "status", is: "Active" },
    then: {
      "endDate": { hidden: true },
      "assignee": { required: true },
    },
  },
  {
    when: { field: "status", is: "Inactive" },
    then: {
      "endDate": { hidden: false, required: true },
      "assignee": { required: false, readOnly: true },
    },
  },
]
```

**Example: Component type swap**

```typescript
rules: [
  {
    when: { field: "reasonType", is: "Custom" },
    then: {
      "reason": { type: "Textarea" },
    },
  },
  {
    when: { field: "reasonType", is: "Standard" },
    then: {
      "reason": {
        type: "Dropdown",
        options: [
          { value: "budgetCut", label: "Budget Cut" },
          { value: "completed", label: "Completed" },
        ],
      },
    },
  },
]
```

**How value matching works:**

- Values are compared using string comparison: `String(fieldValue) === ruleKey`
- `null` and `undefined` field values match the empty string key `""`
- Boolean values are stringified: `true` matches `"true"`, `false` matches `"false"`

---

### Combo (AND) Rules

Combo rules require ALL referenced fields to have specific values before the rule is applied. These are placed on the **target** field (the field that changes), not on the trigger fields.

**Example:**

```typescript
// On the "specialApproval" field config:
rules: [
  {
    when: [
      { field: "status", is: ["Active"] },
      { field: "priority", is: ["High", "Critical"] },
    ],
    then: {
      "specialApproval": { hidden: false, required: true },
    },
  },
]
```

When all conditions are met, the `then` overrides are applied. When any condition fails, the field reverts to its default config state.

---

### Dropdown Filtering Rules

Rules can filter the available options for dependent dropdown fields based on this field's value.

**Example:**

```typescript
// On the "category" field config:
rules: [
  {
    when: { field: "category", is: "Engineering" },
    then: {
      "subCategory": {
        options: [
          { value: "frontend", label: "Frontend" },
          { value: "backend", label: "Backend" },
          { value: "devops", label: "DevOps" },
          { value: "qa", label: "QA" },
        ],
      },
    },
  },
  {
    when: { field: "category", is: "Design" },
    then: {
      "subCategory": {
        options: [
          { value: "ux", label: "UX" },
          { value: "ui", label: "UI" },
          { value: "graphic", label: "Graphic" },
          { value: "motion", label: "Motion" },
        ],
      },
    },
  },
]
```

Options are sorted alphabetically by default unless `config.disableAlphabeticSort` is set to `true` on the target field.

---

### Order Rules

Order rules dynamically reorder fields based on a field's value.

**Example: Simple reordering**

```typescript
// On the "formType" field config:
rules: [
  {
    when: { field: "formType", is: "Simple" },
    order: ["formType", "title", "description", "status"],
  },
  {
    when: { field: "formType", is: "Advanced" },
    order: ["formType", "title", "priority", "assignee", "description", "startDate", "endDate", "status"],
  },
]
```

---

### Validation

| Property | Type | Description |
|----------|------|-------------|
| `validate` | `IValidationRule[]` | Array of validation rules. Each rule specifies a validator name and optional configuration. |

```typescript
{
  email: {
    type: "Textbox",
    label: "Email",
    validate: [
      { validator: "isValidEmail" },
      { validator: "checkEmailUnique", async: true, debounceMs: 500 },
    ],
  },
  endDate: {
    type: "DateControl",
    label: "End Date",
    validate: [
      { validator: "endDateAfterStartDate", crossField: true },
    ],
  },
}
```

Validation functions are registered via the pluggable `ValidationRegistry`:

```typescript
import { registerValidators } from "@bghcore/dynamic-forms-core";

registerValidators({
  isValidEmail: (value) => {
    if (!value) return undefined; // valid
    return /^[^@]+@[^@]+$/.test(String(value)) ? undefined : "Invalid email";
  },
  checkEmailUnique: async (value, entityData, signal) => {
    const exists = await api.checkEmail(value);
    return exists ? "Email already in use" : undefined;
  },
  endDateAfterStartDate: (value, allValues) => {
    if (allValues.startDate && value && value <= allValues.startDate) {
      return "End date must be after start date";
    }
    return undefined;
  },
});
```

The library also provides factory functions for common validations:

| Factory | Description |
|---------|-------------|
| `createMinLengthValidation(name, min)` | Minimum character length |
| `createMaxLengthValidation(name, max)` | Maximum character length |
| `createNumericRangeValidation(name, min, max)` | Number must be within range |
| `createPatternValidation(name, regex, message)` | Regex pattern match |
| `createRequiredIfValidation(name, dependentField, dependentValue)` | Required when another field has a specific value |

---

### Values

| Property | Type | Description |
|----------|------|-------------|
| `defaultValue` | `string \| number \| boolean` | Applied when the field is visible and its current value is null. |
| `computedValue` | `string` | Expression string or value function reference (e.g., `"$fn.setDate()"`). See [Expression Engine Reference](./expression-syntax.md). |
| `computeOnCreateOnly` | `boolean` | Computed value runs only during create mode. |

**Example: Computed value**

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

**Example: Value function**

```typescript
{
  createdBy: {
    type: "ReadOnly",
    label: "Created By",
    computedValue: "$fn.getCurrentUser()",
    computeOnCreateOnly: true,
  },
}
```

---

### Dropdown Options

**`IOption` shape:**

| Property | Type | Description |
|----------|------|-------------|
| `value` | `string \| number` | Unique option identifier (the value stored in form data). |
| `label` | `string` | Display text shown to the user. |
| `disabled` | `boolean` | If true, the option is shown but not selectable. |
| `hidden` | `boolean` | If true, the option is not shown. |
| `selected` | `boolean` | If true, the option is pre-selected. |
| `title` | `string` | Tooltip text for the option. |
| `data` | `unknown` | Arbitrary data attached to the option (e.g., icon config). |

```typescript
{
  priority: {
    type: "Dropdown",
    label: "Priority",
    options: [
      { value: "Low", label: "Low" },
      { value: "Medium", label: "Medium" },
      { value: "High", label: "High" },
      { value: "Critical", label: "Critical" },
    ],
  },
}
```

**`IDeprecatedOption` shape:**

Used for backward compatibility when dropdown option values change over time.

| Property | Type | Description |
|----------|------|-------------|
| `oldVal` | `string` | The old/deprecated option value. |
| `newVal` | `string` | The new replacement option value, if applicable. |
| `isDeleted` | `boolean` | Whether this option has been completely removed (vs. renamed). |

```typescript
{
  status: {
    type: "Dropdown",
    label: "Status",
    options: [
      { value: "Active", label: "Active" },
      { value: "OnHold", label: "On Hold" },
    ],
    deprecatedDropdownOptions: [
      { oldVal: "InProgress", newVal: "Active" },
      { oldVal: "Cancelled", isDeleted: true },
    ],
  },
}
```

If a field's current value matches `oldVal`, the deprecated option is shown as disabled with an info indicator, allowing the user to see and change the legacy value.

---

### Rendering Configuration

| Property | Type | Description |
|----------|------|-------------|
| `config` | `Dictionary<string \| boolean \| number \| string[] \| object>` | Arbitrary configuration passed to the field component. |
| `hideOnCreate` | `boolean` | Field is not rendered in create mode. |
| `skipLayoutReadOnly` | `boolean` | Field ignores layout-level disabled/readOnly. |
| `confirmInput` | `boolean` | Triggers a confirmation modal when dependents change. |

The `config` property is a flexible bag for component-specific configuration:

```typescript
{
  description: {
    type: "PopOutEditor",
    label: "Description",
    config: {
      maxSize: 150,              // Passed to component for size limit
      disableAlphabeticSort: true, // Used by dropdown processing
      data: [                    // Icon config for StatusDropdown
        { icon: "CircleFill", iconTitle: "Active" },
        { icon: "CircleRing", iconTitle: "Inactive" },
      ],
    },
  },
}
```

---

### Field Arrays

Field arrays use `items`, `minItems`, and `maxItems` directly on the field config.

| Property | Type | Description |
|----------|------|-------------|
| `items` | `Record<string, IFieldConfig>` | Field configs for each item. Keys are field names within an item. |
| `minItems` | `number` | Minimum number of items allowed. |
| `maxItems` | `number` | Maximum number of items allowed. |

```typescript
{
  contacts: {
    type: "FieldArray",
    label: "Contacts",
    items: {
      name: { type: "Textbox", label: "Name", required: true },
      email: { type: "Textbox", label: "Email", validate: [{ validator: "isValidEmail" }] },
      role: {
        type: "Dropdown",
        label: "Role",
        options: [
          { value: "primary", label: "Primary" },
          { value: "secondary", label: "Secondary" },
        ],
      },
    },
    minItems: 1,
    maxItems: 5,
  },
}
```

---

## Built-in Component Types

These are the component type keys available from the `ComponentTypes` constant:

| Key | Constant | Description |
|-----|----------|-------------|
| `"Textbox"` | `ComponentTypes.Textbox` | Single-line text input |
| `"Dropdown"` | `ComponentTypes.Dropdown` | Single-select dropdown |
| `"Toggle"` | `ComponentTypes.Toggle` | Boolean toggle switch |
| `"Number"` | `ComponentTypes.Number` | Numeric input |
| `"Multiselect"` | `ComponentTypes.MultiSelect` | Multi-select dropdown |
| `"DateControl"` | `ComponentTypes.DateControl` | Date picker |
| `"Slider"` | `ComponentTypes.Slider` | Range slider |
| `"DynamicFragment"` | `ComponentTypes.Fragment` | Hidden fragment (no UI, auto-hidden) |
| `"SimpleDropdown"` | `ComponentTypes.SimpleDropdown` | Simplified dropdown |
| `"MultiSelectSearch"` | `ComponentTypes.MultiSelectSearch` | Multi-select with search |
| `"PopOutEditor"` | `ComponentTypes.PopOutEditor` | Expandable rich text editor |
| `"RichText"` | `ComponentTypes.RichText` | Rich text editor |
| `"Textarea"` | `ComponentTypes.Textarea` | Multi-line text input |
| `"DocumentLinks"` | `ComponentTypes.DocumentLinks` | URL link CRUD |
| `"StatusDropdown"` | `ComponentTypes.StatusDropdown` | Dropdown with color indicators |
| `"ReadOnly"` | `ComponentTypes.ReadOnly` | Read-only text display |
| `"ReadOnlyArray"` | `ComponentTypes.ReadOnlyArray` | Read-only array display |
| `"ReadOnlyDateTime"` | `ComponentTypes.ReadOnlyDateTime` | Read-only date/time display |
| `"ReadOnlyCumulativeNumber"` | `ComponentTypes.ReadOnlyCumulativeNumber` | Read-only cumulative number |
| `"ReadOnlyRichText"` | `ComponentTypes.ReadOnlyRichText` | Read-only rich text |
| `"ReadOnlyWithButton"` | `ComponentTypes.ReadOnlyWithButton` | Read-only with action button |
| `"ChoiceSet"` | `ComponentTypes.ChoiceSet` | Choice set / radio group |
| `"FieldArray"` | `ComponentTypes.FieldArray` | Repeating field array |

---

## Runtime Rule State (IRuntimeFieldState)

After processing, each `IFieldConfig` becomes an `IRuntimeFieldState` at runtime. Components read the rule state to determine behavior.

| Property | Type | Description |
|----------|------|-------------|
| `type` | `string` | UI component type to render (may be swapped by rules). |
| `required` | `boolean` | Whether the field is required. |
| `hidden` | `boolean` | Whether the field is hidden. Hidden fields skip validation. |
| `readOnly` | `boolean` | Whether the field is read-only. |
| `validate` | `IValidationRule[]` | Active validation rules. |
| `valueFunction` | `string` | Value function name to execute on dependency trigger. |
| `confirmInput` | `boolean` | Whether changes trigger a confirmation modal. |
| `options` | `IOption[]` | Currently available dropdown options (may be filtered by rules). |
| `computeOnCreateOnly` | `boolean` | Whether the computed value only runs on create. |
| `defaultValue` | `string \| number \| boolean \| Date` | Default value when field value is null. |
| `dependentFields` | `string[]` | Fields that this field's value changes affect (forward dependencies). |
| `dependsOnFields` | `string[]` | Fields whose values affect this field (reverse dependencies). |
| `orderDependentFields` | `string[]` | Fields referenced in this field's order dependencies. |
| `pivotalRootField` | `string` | The root field that controls field ordering for this field's group. |
| `comboDependentFields` | `string[]` | Fields that depend on this field for AND conditions. |
| `comboDependsOnFields` | `string[]` | Fields that this field's AND condition depends on. |
| `dependentDropdownFields` | `string[]` | Fields whose dropdown options are filtered by this field's value. |
| `dependsOnDropdownFields` | `string[]` | Fields that filter this field's dropdown options. |
| `computedValue` | `string` | Computed value expression from field config. |

---

## IFieldProps

This is the props contract injected into every field component via `React.cloneElement`. All injected field components receive these props.

| Property | Type | Description |
|----------|------|-------------|
| `fieldName` | `string` | The field's name/key in the form. |
| `entityId` | `string` | The entity ID of the form record. |
| `entityType` | `string` | The entity type name. |
| `programName` | `string` | The program/context name. |
| `parentEntityId` | `string` | Parent entity ID (for nested forms). |
| `parentEntityType` | `string` | Parent entity type (for nested forms). |
| `readOnly` | `boolean` | Whether the field is read-only. |
| `required` | `boolean` | Whether the field is required. |
| `error` | `FieldError` | react-hook-form error object for this field. |
| `errorCount` | `number` | Number of validation errors. |
| `saving` | `boolean` | Whether the form is currently saving. |
| `savePending` | `boolean` | Whether a save is pending. |
| `value` | `unknown` | Current field value. |
| `config` | `T` | Arbitrary configuration from the field config. |
| `options` | `IOption[]` | Available dropdown options. |
| `validate` | `IValidationRule[]` | Active validation rules. |
| `label` | `string` | The field's display label. |
| `type` | `string` | The component type key. |
| `setFieldValue` | `(fieldName, fieldValue, skipSave?, timeout?) => void` | Function to programmatically set another field's value. |
