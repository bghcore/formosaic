---
title: Debugging Business Rules
---

# Debugging Business Rules

This guide covers the business rules evaluation lifecycle, tracing API, config validation, the DevTools panel, and solutions to common issues.

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
} from "@formosaic/core/devtools";

enableRuleTracing();

// ... user interacts with form ...

const log = getRuleTraceLog();
log.forEach(event => {
  console.log(
    `[${event.type}] ${event.triggerField}=${JSON.stringify(event.triggerValue)} -> ${event.affectedField}`
  );
});

disableRuleTracing();
```

### Real-Time Callback

```typescript
enableRuleTracing((event) => {
  console.log(`[${event.type}] ${event.triggerField} -> ${event.affectedField}`, event.newState);
});
```

### IRuleTraceEvent Shape

| Property | Type | Description |
|----------|------|-------------|
| `timestamp` | `number` | `Date.now()` when the rule fired |
| `type` | `"revert" \| "apply" \| "combo" \| "dropdown" \| "order" \| "init"` | Which phase produced this event |
| `triggerField` | `string` | The field whose value change triggered evaluation |
| `triggerValue` | `unknown` | The value that triggered the rule |
| `affectedField` | `string` | The field whose state was changed |
| `previousState` | `Partial<IRuntimeFieldState>` | State before rule applied |
| `newState` | `Partial<IRuntimeFieldState>` | State after rule applied |

---

## FormDevTools

The built-in DevTools panel provides a visual inspector with 7 tabs:

| Tab | Content |
|-----|---------|
| **Rules** | Per-field runtime state: type, required, hidden, readOnly, active rules |
| **Values** | JSON dump of all current form values |
| **Errors** | JSON dump of current form errors |
| **Graph** | Text-based dependency graph |
| **Perf** | Per-field render counts, hot field detection |
| **Deps** | Sortable dependency table with effect types, cycle detection |
| **Timeline** | Chronological event log with filtering |

```typescript
import { FormDevTools } from "@formosaic/core/devtools";

<FormDevTools
  configName="myForm"
  formState={runtimeFormState}
  formValues={getValues()}
  formErrors={formState.errors}
  dirtyFields={formState.dirtyFields}
  enabled={process.env.NODE_ENV === "development"}
/>
```

---

## Config Validation

```typescript
import { validateFieldConfigs } from "@formosaic/core";

const errors = validateFieldConfigs(fieldConfigs, registeredComponents);
if (errors.length > 0) {
  errors.forEach(err => console.error(`[${err.type}] ${err.fieldName}: ${err.message}`));
}
```

Checks for: missing dependency targets, self-dependencies, unregistered components, unregistered validators, missing dropdown options, and circular dependencies.

---

## Common Issues and Solutions

### "Rule not applying"

The most common cause is a value mismatch. Dependency keys are matched using string comparison: `String(fieldValue) === ruleKey`.

- **Boolean values**: `true` must match `"true"`, not `"True"`
- **Numbers**: `42` must match `"42"`
- **null/undefined**: Match against the empty string `""`

### "Circular dependency" warning

```typescript
const errors = validateFieldConfigs(fieldConfigs);
const cycles = errors.filter(e => e.type === "circular_dependency");
```

Refactor the config so dependencies form a DAG (directed acyclic graph).

### "Field reverted unexpectedly"

When a field's value changes, ALL dependents from the previous value are reverted to their default config state before new rules are applied. Use the trace log to see the full revert-then-apply sequence.

---

## Template Provenance in DevTools

When using [form templates](/guide/templates), the **Deps tab** in FormDevTools includes a **Source** column that shows the template and fragment each field originated from. This makes it straightforward to trace expanded fields back to their template definition.

For example, a field named `shipping.street` will show:

| Field | Source | Effect |
|-------|--------|--------|
| `shipping.street` | `address` via `shipping` | -- |
| `shipping.state` | `address` via `shipping` | dropdown (rule from `address` template) |
| `billing.street` | `address` via `billing` | copyValues (from `shipping.street`) |

This provenance tracking helps you understand:

- Which template defined a field's original configuration
- Which fragment prefix was applied during expansion
- Whether a rule came from the template itself or from a `composeForm()` connection

Template resolution errors (unregistered templates, circular references, max depth exceeded) are surfaced in the **Timeline tab** as `TemplateResolutionError` events.

---

## Debugging Checklist

1. **Enable tracing** -- `enableRuleTracing()` to capture all rule events
2. **Open DevTools** -- Add `<FormDevTools>` to visualize rules, values, errors, and the dependency graph
3. **Validate config** -- Run `validateFieldConfigs()` to catch structural issues
4. **Check value types** -- Dependency keys use string comparison
5. **Check the trace log** -- Look for `"revert"` events that may be clearing state
6. **Check combo conditions** -- All combo rule conditions must match simultaneously
7. **Check dropdown keys** -- Option values must match actual `IOption.value` values
