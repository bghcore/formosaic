# Rules Engine

The rules engine evaluates declarative `IRule[]` arrays attached to each field in `IFormConfig.fields`. When a field value changes, the engine re-evaluates all transitively affected fields and updates the runtime form state.

---

## Rule Structure

```typescript
interface IRule {
  /** Condition to evaluate against current form values */
  when: ICondition;
  /** Effects to apply when the condition is true */
  then: IFieldEffect;
  /** Effects to apply when the condition is false (optional) */
  else?: IFieldEffect;
  /** Higher number wins when multiple rules set the same property */
  priority?: number;
  /** Optional identifier for tracing */
  id?: string;
}
```

---

## Supported Effects (IFieldEffect)

| Property | Type | Description |
|---|---|---|
| `required` | `boolean` | Override required state |
| `hidden` | `boolean` | Override hidden state |
| `readOnly` | `boolean` | Override read-only state |
| `label` | `string` | Override field label |
| `type` | `string` | Swap component type |
| `options` | `IOption[]` | Replace dropdown options |
| `validate` | `IValidationRule[]` | Replace validation rules |
| `computedValue` | `string` | Override computed value expression |
| `fieldOrder` | `string[]` | Override field display order |
| `setValue` | `unknown` | Directly set the field's value (see below) |
| `fields` | `Record<string, IFieldEffect>` | Apply effects to OTHER fields |

---

## setValue Effect

`setValue` lets a rule directly set a field's value when its condition is met. This is useful for auto-populating fields based on selections elsewhere in the form.

**Key behaviors:**
- `setValue` only applies from the `then` branch — the `else` branch cannot set a value
- Multiple rules with `setValue` on the same field use priority-based conflict resolution (highest priority wins)
- The effect is stored as `pendingSetValue` on `IRuntimeFieldState` and applied by the form component via `react-hook-form`'s `setValue` — this prevents rule re-evaluation in the same pass (no infinite loops)

### Example

```typescript
{
  version: 2,
  fields: {
    country: {
      type: "Dropdown",
      label: "Country",
      options: [
        { value: "US", label: "United States" },
        { value: "CA", label: "Canada" },
      ],
    },
    dialCode: {
      type: "Textbox",
      label: "Dial Code",
      rules: [
        {
          when: { field: "country", operator: "equals", value: "US" },
          then: { setValue: "+1", readOnly: true },
        },
        {
          when: { field: "country", operator: "equals", value: "CA" },
          then: { setValue: "+1", readOnly: true },
        },
      ],
    },
  },
}
```

When the user selects "United States", the `dialCode` field is automatically set to `"+1"` and made read-only.

### Clearing a field

Use `setValue: null` to clear a field's value when a condition is met:

```typescript
rules: [
  {
    when: { field: "mode", operator: "equals", value: "reset" },
    then: { setValue: null },
  },
]
```

### Cross-field setValue

`setValue` can also be applied to other fields via the `fields` cross-effect property:

```typescript
rules: [
  {
    when: { field: "billingSameAsShipping", operator: "equals", value: true },
    then: {
      fields: {
        billingCity: { setValue: "$values.shippingCity" }, // Note: setValue is a literal value, not an expression
        billingZip: { setValue: "$values.shippingZip" },
      },
    },
  },
]
```

> **Note:** `setValue` accepts a literal value. For dynamic computed values based on other fields, use `computedValue` with an expression string instead.

---

## Priority-based Conflict Resolution

When multiple rules fire simultaneously and set the same property, the rule with the highest `priority` number wins (first-write-wins after sorting by priority descending). Rules without a `priority` default to `0`.

```typescript
rules: [
  { when: { field: "plan", operator: "equals", value: "free" }, then: { hidden: true }, priority: 1 },
  { when: { field: "admin", operator: "equals", value: true }, then: { hidden: false }, priority: 10 },
]
// If both conditions are true, hidden: false wins (priority 10 > 1)
```

---

## Cross-field Effects

A rule on one field can affect multiple other fields using the `fields` map:

```typescript
{
  type: "Toggle",
  label: "Advanced Mode",
  rules: [
    {
      when: { field: "advancedMode", operator: "equals", value: true },
      then: {
        fields: {
          debugPanel: { hidden: false },
          logLevel: { required: true },
          apiKey: { readOnly: false },
        },
      },
    },
  ],
}
```

---

## Lifecycle

1. **Init**: `evaluateAllRules(fields, values)` → builds dependency graph + evaluates all rules → `IRuntimeFormState`
2. **Validate**: `validateDependencyGraph()` checks for circular/self-dependencies via Kahn's algorithm
3. **Trigger**: Field value change → `processFieldChange()`
4. **Evaluate**: `evaluateAffectedFields(changedField, fields, values, currentState)` — re-evaluates only transitively affected fields
5. **Resolve**: Priority-based conflict resolution (higher priority rule wins)
6. **Apply**: Dispatch to reducer → React re-render → fields read updated `IRuntimeFieldState`
