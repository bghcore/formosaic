# Debugging Business Rules

This guide covers the business rules evaluation lifecycle, tracing API, config validation, the DevTools panel, and solutions to common issues.

---

## Rule Evaluation Lifecycle

When a field value changes, the business rules engine evaluates all affected rules in a specific order. Understanding this order is critical for debugging unexpected behavior.

### Initialization (evaluateAllRules)

On form mount, `evaluateAllRules()` runs the full initialization lifecycle:

1. **Build default rules** -- `buildDefaultFieldStates()` creates an `IRuntimeFieldState` for each field from its `IFieldConfig`. Wires up the bidirectional dependency graph: `dependentFields` / `dependsOnFields`, order dependencies, combo dependencies, and dropdown dependencies. Validates the dependency graph for cycles in dev mode.
2. **Evaluate every field** -- Iterates all fields and for each:
   - Applies dependency rules (`ProcessFieldBusinessRule`) based on current entity data
   - Evaluates combo (AND) rules (`ProcessComboFieldBusinessRule`)
   - Filters dropdown options (`ProcessFieldDropdownValues`)
   - Processes order dependencies (`ProcessFieldOrderDepencendies`) if the field has a pivotal root
   - Appends deprecated dropdown options that match current field values

### Runtime Trigger (processBusinessRule)

When a single field value changes at runtime, the `processBusinessRule()` method in `RulesEngineProvider` executes this pipeline:

| Step | Function | Description |
|------|----------|-------------|
| 1. **Guard check** | -- | Skips evaluation if the field has no dependents, no reverse dependencies, no pivotal root, no combo dependents, and no dropdown dependents. |
| 2. **Revert previous rules** | `RevertFieldBusinessRule()` | Resets dependent fields to their default config state (type, required, hidden, readOnly, validate, valueFunction, confirmInput). Dropdown options are preserved from the current business rules since they may have been set by other sources. |
| 3. **Re-apply other sources** | `ProcessPreviousFieldBusinessRule()` | Finds all OTHER fields that also affected the same dependents as the changed field and re-evaluates their current rules. This ensures dependent fields retain correct state from all active rule sources, not just the field that changed. |
| 4. **Apply new value rules** | `ProcessFieldBusinessRule()` | Looks up the field's `rules` config, finds the entry matching the new value, and applies the resulting rule overrides to each dependent field. |
| 5. **Evaluate combo (AND) rules** | `ProcessComboFieldBusinessRule()` | For each field in the changed field's `comboDependentFields`, checks whether ALL conditions in its combo rules are met. If all match, applies `updatedConfig`. If any fail, reverts to default. |
| 6. **Update dropdown options** | `ProcessFieldDropdownValues()` | Filters dropdown options for dependent fields based on the new value. Appends deprecated options matching current dependent field values. |
| 7. **Recalculate field ordering** | `ProcessFieldOrderDepencendies()` | If the field has a `pivotalRootField`, recalculates the field order based on the current value of the root field. |
| 8. **Dispatch** | `businessRulesDispatch()` | If any field rules changed or the field order changed, dispatches an update to the reducer, triggering a React re-render. |

### Rule Application Priority

When `ApplyBusinessRule()` merges a dependency config into an existing rule, it uses a three-tier priority system for each property:

1. **Dependency override** (highest) -- The value from the field's rules for the matched value
2. **In-progress rules** -- Intermediate rule changes from earlier steps in the evaluation pipeline
3. **Existing rule** (lowest/fallback) -- The current rule state

Properties are only overwritten if the higher-priority source has a non-null value.

### Rule Merging (CombineBusinessRules)

`CombineBusinessRules()` merges two config business rules objects using a "non-null wins" strategy: for each field property, if the additional (newer) value is non-null, it overwrites the existing value; otherwise the existing value is preserved. Field order is only taken from the additional rules when `checkOrder` is `true` and a non-empty order array exists.

---

## Rule Tracing API

The rule tracing system records every rule evaluation event, making it possible to see exactly what happened and why.

### Enabling Tracing

```typescript
import {
  enableRuleTracing,
  disableRuleTracing,
  getRuleTraceLog,
  clearRuleTraceLog,
} from "@form-engine/core";

// Enable tracing (starts recording all rule events)
enableRuleTracing();

// ... user interacts with form ...

// Get the trace log
const log = getRuleTraceLog();
log.forEach(event => {
  console.log(
    `[${event.type}] ${event.triggerField}=${JSON.stringify(event.triggerValue)} -> ${event.affectedField}`
  );
  if (event.previousState) console.log("  before:", event.previousState);
  if (event.newState) console.log("  after:", event.newState);
});

// Clear the log (keeps tracing enabled)
clearRuleTraceLog();

// Disable tracing
disableRuleTracing();
```

### Real-Time Callback

Pass a callback to `enableRuleTracing()` for real-time logging as each rule fires:

```typescript
enableRuleTracing((event) => {
  console.log(`[${event.type}] ${event.triggerField} -> ${event.affectedField}`, event.newState);
});
```

### IRuleTraceEvent Shape

| Property | Type | Description |
|----------|------|-------------|
| `timestamp` | `number` | `Date.now()` when the rule fired. |
| `type` | `"revert" \| "apply" \| "combo" \| "dropdown" \| "order" \| "init"` | Which phase of rule evaluation produced this event. |
| `triggerField` | `string` | The field whose value change triggered this rule evaluation. |
| `triggerValue` | `unknown` | The value that triggered the rule (the trigger field's value). |
| `affectedField` | `string` | The field whose state was changed by this rule. |
| `previousState` | `Partial<IRuntimeFieldState>` | The affected field's state before this rule was applied. |
| `newState` | `Partial<IRuntimeFieldState>` | The affected field's state after this rule was applied. |

### Trace Event Types

| Type | Meaning |
|------|---------|
| `"init"` | Rule applied during initial `evaluateAllRules()` on form mount. |
| `"revert"` | A dependent field was reverted to its default config state (step 2 of the lifecycle). |
| `"apply"` | A dependency rule was applied to a dependent field (steps 3-4 of the lifecycle). |
| `"combo"` | An AND-condition (combo) rule was evaluated (step 5). |
| `"dropdown"` | Dropdown options were filtered for a dependent field (step 6). |
| `"order"` | Field ordering was recalculated (step 7). |

### Checking Tracing Status

```typescript
import { isRuleTracingEnabled } from "@form-engine/core";

if (isRuleTracingEnabled()) {
  console.log("Tracing is active");
}
```

---

## FormDevTools

The built-in DevTools panel provides a visual inspector for business rules, form values, errors, and the dependency graph.

### Usage

```typescript
import { FormDevTools } from "@form-engine/core";

function MyForm() {
  // Inside your form component, after useForm() and business rules init:
  return (
    <>
      {/* ... your form fields ... */}
      <FormDevTools
        configName="myForm"
        configRules={runtimeFormState}
        formValues={getValues()}
        formErrors={formState.errors}
        dirtyFields={formState.dirtyFields}
        enabled={process.env.NODE_ENV === "development"}
      />
    </>
  );
}
```

### Props (IFormDevToolsProps)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `configName` | `string` | -- (required) | Display name shown in the DevTools header. |
| `configRules` | `IRuntimeFormState` | `undefined` | The current runtime form state (from `initBusinessRules()` or the provider). |
| `formValues` | `Record<string, unknown>` | `undefined` | Current form values (from `getValues()`). |
| `formErrors` | `Record<string, unknown>` | `undefined` | Current form errors (from `formState.errors`). |
| `dirtyFields` | `Record<string, boolean>` | `undefined` | Dirty field flags (from `formState.dirtyFields`). |
| `enabled` | `boolean` | `true` | Whether to render the DevTools panel. Set to `false` in production. |

### Tabs

The DevTools panel has four tabs:

| Tab | Content |
|-----|---------|
| **Rules** | Lists every field with its current rule state: type, required, hidden, readOnly, validate, and valueFunction. |
| **Values** | JSON dump of all current form values. |
| **Errors** | JSON dump of current form errors (red if errors exist, green if none). |
| **Graph** | Text-based visualization of the dependency graph showing `field -> dependents` and combo dependency relationships. |

The panel is fixed to the bottom-right corner of the viewport, toggles open/closed on click, and uses a dark theme with monospace font.

---

## Config Validation

The `validateFieldConfigs()` function checks field configurations for common issues at dev time, before the form is rendered.

### Usage

```typescript
import { validateFieldConfigs } from "@form-engine/core";

const errors = validateFieldConfigs(fieldConfigs, registeredComponents);

if (errors.length > 0) {
  console.error("Field config validation errors:", errors);
  errors.forEach(err => {
    console.error(`[${err.type}] ${err.fieldName}: ${err.message}`);
  });
}
```

### Validation Checks

| Error Type | Description |
|-----------|-------------|
| `missing_dependency_target` | A dependency, dropdown dependency, or combo rule references a field name that does not exist in the config. |
| `self_dependency` | A field's dependency rules target itself, which causes infinite evaluation loops. |
| `unregistered_component` | The `type` is not in the provided registered components set. Only checked when `registeredComponents` is provided. |
| `unregistered_validation` | A validator name in `validate[]` is not in the `ValidationRegistry`. |
| `missing_dropdown_options` | A `Dropdown`, `StatusDropdown`, or `Multiselect` field has no options configured and no dropdown dependencies providing options from another field. |
| `circular_dependency` | The dependency graph contains cycles, detected via Kahn's algorithm on the `dependentFields`/`dependsOnFields` adjacency lists. Also detects cycles in combo dependencies. |

### IConfigValidationError Shape

```typescript
interface IConfigValidationError {
  type: "missing_dependency_target" | "unregistered_component" | "unregistered_validation"
      | "circular_dependency" | "missing_dropdown_options"
      | "self_dependency";
  fieldName: string;
  message: string;
  details?: string;
}
```

### Automatic Cycle Detection

The dependency graph is automatically validated for cycles in dev mode when `buildDefaultFieldStates()` is called (which happens during form initialization). If cycles are detected, warnings are logged to the console:

```
[form-engine] Circular dependency detected among fields: fieldA, fieldB, fieldC
```

This uses `validateDependencyGraph()` internally, which runs:
1. **Kahn's algorithm** on `dependentFields` / `dependsOnFields` to detect direct dependency cycles.
2. **Kahn's algorithm** on `comboDependentFields` / `comboDependsOnFields` to detect combo dependency cycles.
3. **Self-reference check** on order dependencies.

---

## Common Issues and Solutions

### "Field hidden but validation still fires"

Hidden fields have their errors cleared before `trigger()` is called. If you are seeing stale validation errors on hidden fields, ensure that:

- The field's `hidden` property is being correctly set by the business rule (check via Rule Tracing or DevTools).
- The form is using the business rules engine's `hidden` state, not a separate visibility mechanism.

### "Rule not applying"

The most common cause is a value mismatch. Dependency keys are matched using **string comparison**:

```typescript
// In the engine:
String(fieldValue) === ruleKey
```

Check these cases:
- **Boolean values**: `true` must match `"true"`, not `"True"` or `"1"`.
- **Numbers**: `42` must match `"42"`.
- **null/undefined**: Match against the empty string `""`.
- **Trailing whitespace**: `"Active "` does not match `"Active"`.

Use Rule Tracing to see the exact `triggerValue` being evaluated:

```typescript
enableRuleTracing((event) => {
  if (event.triggerField === "status") {
    console.log("status value:", JSON.stringify(event.triggerValue), typeof event.triggerValue);
  }
});
```

### "Circular dependency" warning

The engine detects cycles at initialization time and logs a warning. To identify the cycle:

```typescript
import { validateFieldConfigs } from "@form-engine/core";

const errors = validateFieldConfigs(fieldConfigs);
const cycles = errors.filter(e => e.type === "circular_dependency");
cycles.forEach(c => console.error(c.message));
// Output: "Circular dependency detected among fields: fieldA, fieldB"
```

To fix: Refactor the config so dependencies form a DAG (directed acyclic graph). If field A's value affects field B, then field B's value should not affect field A.

### "Dropdown options not updating"

Check that the dropdown dependency rules match the trigger field's value exactly:

```typescript
// Trigger field: "category" with value "Engineering"
// This must match the key in the rules:
rules: [
  {
    when: { field: "category", is: "Engineering" },
    then: {
      "subCategory": { options: [
        { value: "frontend", label: "Frontend" },
        { value: "backend", label: "Backend" },
      ] },
    },
  },
]
```

Also verify that:
- The target field name in the rules matches an actual field in the config.
- The option values in the array match actual `IOption.value` values in the options.

### "Combo rule not triggering"

AND-condition rules require ALL referenced fields to match. Enable tracing and check the `"combo"` events:

```typescript
enableRuleTracing((event) => {
  if (event.type === "combo") {
    console.log(`Combo: ${event.affectedField}`, event.newState);
  }
});
```

Verify that:
- All fields listed in the combo rule conditions exist in the config.
- Each field's current value is in the array of acceptable values (exact string match).
- The `updatedConfig` keys reference valid fields.

### "Order not changing"

Order dependencies only take effect when:
- The field has order rules defined.
- The field's value matches a key in the order rule map.
- The matched entry is an array of field names (the new order).

If using nested order dependencies, make sure the nested field names and values are correct.

### "Field reverted unexpectedly"

When a field's value changes, ALL dependents from the previous value are reverted to their default config state before new rules are applied. If field A and field B both affect field C, changing field A will:
1. Revert field C to its default (step 2).
2. Re-apply field B's current rules on field C (step 3).
3. Apply field A's new rules on field C (step 4).

If field C's state looks wrong, check that step 3 correctly re-applies field B's rules. Use the trace log to see the full revert-then-apply sequence.

---

## Debugging Checklist

1. **Enable tracing** -- `enableRuleTracing()` to capture all rule events.
2. **Open DevTools** -- Add `<FormDevTools>` to visualize rules, values, errors, and the dependency graph.
3. **Validate config** -- Run `validateFieldConfigs()` to catch structural issues.
4. **Check value types** -- Dependency keys use string comparison. Log `typeof` and `JSON.stringify` of trigger values.
5. **Check the trace log** -- Look for `"revert"` events that may be clearing state set by other fields.
6. **Check combo conditions** -- All combo rule conditions must match simultaneously (AND logic).
7. **Check dropdown keys** -- Option values in dropdown rules must match actual `IOption.value` values.
