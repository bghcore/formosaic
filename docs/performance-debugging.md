# Performance Debugging & DevTools

Last updated: 2026-03-05 | Applies to: `@bghcore/dynamic-forms-core` v2.0.x

This guide covers the FormDevTools component and the underlying performance and event-tracing APIs. It is written for developers building forms with the dynamic-forms library who need to diagnose render performance issues, inspect rule evaluation behavior, or trace field-level events during development.

---

## FormDevTools Overview

`FormDevTools` is a collapsible developer panel that renders as a fixed overlay at the bottom-right of the viewport. It provides seven tabs for inspecting form state at runtime:

| Tab | Key | What it shows |
|---|---|---|
| Rules | `rules` | Per-field runtime state: type, required, hidden, readOnly, active rules, validation, computedValue |
| Values | `values` | Current form values as formatted JSON |
| Errors | `errors` | Current form errors (red) or "No errors" (green) |
| Graph | `graph` | Text-based dependency graph (`field -> dependents`, `field (depends on) sources`) |
| Perf | `performance` | Per-field render counts via RenderTracker |
| Deps | `depgraph` | Tabular dependency graph with effect-type color coding and cycle detection |
| Timeline | `timeline` | Chronological event log from the rules engine, validation, and field changes |

The first four tabs (Rules, Values, Errors, Graph) display runtime field state from the rules engine. The last three tabs (Perf, Deps, Timeline) provide performance metrics and event tracing backed by two module-level helpers: `RenderTracker` and `EventTimeline`.

---

## Setup

Import `FormDevTools` from the core package and render it alongside your form. The component accepts the same state objects your form already has access to:

```tsx
import { FormDevTools } from "@bghcore/dynamic-forms-core";

<FormDevTools
  configName="myForm"
  formState={rulesState}
  formValues={formValues}
  formErrors={formErrors}
  dirtyFields={dirtyFields}
  enabled={process.env.NODE_ENV === "development"}
/>
```

### Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `configName` | `string` | Yes | Display name shown in the DevTools header bar |
| `formState` | `IRuntimeFormState` | No | Rules engine state containing `fieldStates` (a `Record<string, IRuntimeFieldState>`) |
| `formValues` | `Record<string, unknown>` | No | Current form values from react-hook-form `getValues()` or `watch()` |
| `formErrors` | `Record<string, unknown>` | No | Current form errors from react-hook-form `formState.errors` |
| `dirtyFields` | `Record<string, boolean>` | No | Dirty field map from react-hook-form `formState.dirtyFields` |
| `enabled` | `boolean` | No | Defaults to `true`. Set to `false` to prevent rendering entirely. |

When `enabled` is `false`, the component returns `null` and adds zero overhead. Gate it behind `process.env.NODE_ENV === "development"` or a feature flag so it never ships to production.

### Keyboard and Accessibility

The DevTools panel uses ARIA `role="tablist"` and `role="tab"` attributes with `aria-selected` and `aria-controls` for tab navigation. The collapse/expand toggle has `aria-expanded` and `aria-controls="devtools-content"`.

---

## Performance Tab (Perf)

The Perf tab shows per-field render counts tracked by the `RenderTracker` module. Use it to identify fields that re-render more often than expected.

### What It Shows

- **Total form renders** -- a counter incremented each time `flushRenderCycle()` is called.
- **Per-field render count table** -- sorted alphabetically by field name. Each row shows:
  - **Field** -- the field name string.
  - **Renders** -- how many times `trackRender(fieldName)` has been called for this field.
  - **Last Cycle** -- a checkmark if the field rendered during the most recent flushed cycle.
  - **Hot** -- a warning indicator if the field's render count exceeds 1.5x the average across all tracked fields. Hot rows are highlighted with an orange-tinted background and the render count is displayed in orange text.
- **Reset** button -- clears all tracking data via `resetRenderTracker()`.
- **Refresh** button -- forces a re-read of the current tracking data.

### How Tracking Works

`RenderField` calls `trackRender(fieldName)` on every render (line 62 of `HookRenderField.tsx`). This is automatic -- no additional wiring is needed. Each call increments the per-field counter and adds the field name to a pending set.

`flushRenderCycle()` snapshots the pending set into `lastRenderedFields` and resets the pending set. This function is exported but **not called automatically** by any built-in component. To get accurate "Last Cycle" data, you must call `flushRenderCycle()` yourself, typically in a `useEffect` inside your form wrapper:

```tsx
import { flushRenderCycle } from "@bghcore/dynamic-forms-core";

function MyFormWrapper(props) {
  React.useEffect(() => {
    flushRenderCycle();
  });

  return <DynamicForm {...props} />;
}
```

Without calling `flushRenderCycle()`, the "Last Cycle" column will accumulate all fields rendered since the last reset, and the "Total form renders" counter will remain at 0.

### What to Look For

- **Fields with high render counts relative to others** may indicate missing memoization or unnecessary re-renders caused by upstream state changes.
- **Fields re-rendering every cycle when they should not be** -- check whether a rule or computed value is causing unnecessary state updates.
- **Total form renders growing unexpectedly fast** -- look for cascading rule evaluations or uncontrolled re-render loops.
- **Hot fields** (marked with the warning icon) are rendering significantly more than the average. Investigate whether they have complex rules, expensive computed values, or are being affected by unrelated field changes.

---

## Dependency Graph Tab (Deps)

The Deps tab presents a tabular view of field dependency relationships derived from the `IRuntimeFieldState.dependsOnFields` and `IRuntimeFieldState.dependentFields` arrays. It only shows fields that participate in at least one dependency relationship.

### What It Shows

Each row contains four columns:

| Column | Description |
|---|---|
| **Field** | The field name |
| **Depends On** | Fields whose values affect this field (from `dependsOnFields`) |
| **Depended By** | Fields that react when this field changes (from `dependentFields`) |
| **Effects** | Active effect types on this field: `hidden`, `required`, `readOnly`, `options`, `computed` |

### Color Coding

Rows are color-coded by the primary (first-matched) effect type:

| Effect | Background Color | Description |
|---|---|---|
| `hidden` | Yellow-tinted (`#3e3a20`) | Field has a hide/show rule |
| `required` | Blue-tinted (`#1e2a3e`) | Field has a conditional required rule |
| `readOnly` | Gray-tinted (`#2a2a2a`) | Field has a conditional readOnly rule |
| `options` | Green-tinted (`#1e3a2a`) | Field has dynamic option filtering |

If a field has multiple effects, the color reflects whichever appears first in the priority order above (hidden > required > readOnly > options).

### Sorting

Two sort modes are available via buttons above the table:

- **Name** (default) -- alphabetical by field name.
- **Dep Count** -- descending by total number of dependencies (`dependsOn.length + dependedBy.length`), showing the most connected fields first.

### Cycle Detection

The tab performs a pairwise cycle check: if field A depends on field B and field B also depends on field A, a red "Cycles detected!" warning appears above the table. This is a simplified check (not a full topological cycle detection). For comprehensive cycle validation, use `validateDependencyGraph()` from the core API, which runs Kahn's algorithm.

### How to Read It

- A field with many items in **Depends On** is highly sensitive to other fields and may re-evaluate frequently.
- A field with many items in **Depended By** has a wide blast radius -- changing it triggers re-evaluation of many downstream fields.
- Fields that appear in both columns are "relay" fields: they react to upstream changes and propagate effects downstream. These are common in cascading dropdown scenarios.

---

## Timeline Tab

The Timeline tab shows a chronological event log produced by the rules engine and form helper functions. Events are logged automatically during normal form operation.

### What It Shows

Each event has four fields displayed in a table:

| Column | Description |
|---|---|
| **Time** | Timestamp formatted as `HH:MM:SS.mmm` (local time) |
| **Type** | Event type, color-coded (see below) |
| **Field** | The field name associated with the event |
| **Details** | Additional context (e.g., number of affected fields, validation result) |

### Event Types and Colors

| Event Type | Color | When It Fires |
|---|---|---|
| `field_change` | Teal (`#4ec9b0`) | `evaluateAffectedFields()` is called after a field value changes. Details: `"N affected field(s)"` |
| `rule_evaluated` | Orange (`#ce9178`) | `evaluateAllRules()` processes a field's rules. Details: `"N rule(s) evaluated"` |
| `validation_run` | Yellow (`#dcdcaa`) | `CheckFieldValidationRules()` runs sync validation on a field. Details: `"passed"` or `"failed: message"` |
| `form_submit` | Blue (`#569cd6`) | Available for custom logging. Not fired automatically by built-in components. |

### Controls

- **Filter input** -- text filter that matches against both field name and event type (case-insensitive). For example, typing `rule` shows only `rule_evaluated` events. Typing a field name shows all events for that field.
- **Clear** button -- removes all timeline events via `clearTimeline()`.
- **Refresh** button -- forces the tab to re-read the current timeline data.

### Display Limits

- Events are displayed newest-first (reverse chronological order).
- The display is capped at **200 events** shown at a time.
- The underlying `EventTimeline` buffer stores a maximum of **500 events**. When this limit is exceeded, the oldest events are discarded.

### Where Events Are Logged Automatically

The following integration points produce timeline events without any manual instrumentation:

| Source File | Function | Event Type | Details Format |
|---|---|---|---|
| `RuleEngine.ts` | `evaluateAllRules()` | `rule_evaluated` | `"N rule(s) evaluated"` |
| `RuleEngine.ts` | `evaluateAffectedFields()` | `field_change` | `"N affected field(s)"` |
| `HookInlineFormHelper.ts` | `CheckFieldValidationRules()` | `validation_run` | `"passed"` or `"failed: message"` |

The `form_submit` event type is defined but not logged automatically. You can log it yourself using the `logEvent` API (see Programmatic Access below).

### How to Use for Debugging

1. Open the DevTools panel and switch to the Timeline tab.
2. Interact with the form -- change a field value, trigger a dropdown update, submit the form.
3. Click **Refresh** to load newly logged events into the display.
4. Use the filter to narrow down to a specific field name or event type.
5. Read the events top-to-bottom (newest first) to trace the sequence: field_change -> rule_evaluated -> validation_run.
6. If rules are not firing as expected, check whether a `field_change` event appears for the trigger field and how many affected fields it reports.
7. If validation is failing unexpectedly, filter by `validation_run` and check the details string for the specific error message.

---

## Programmatic Access

Both `RenderTracker` and `EventTimeline` are exported from the core package for use outside of the DevTools UI. This is useful for automated testing, custom monitoring, or building your own debugging tools.

### RenderTracker API

```tsx
import {
  trackRender,
  flushRenderCycle,
  getRenderCounts,
  getLastRenderedFields,
  getTotalFormRenders,
  resetRenderTracker,
} from "@bghcore/dynamic-forms-core";
```

| Function | Signature | Description |
|---|---|---|
| `trackRender` | `(fieldName: string) => void` | Increments the render count for the given field and adds it to the pending cycle set. Called automatically from `RenderField`. |
| `flushRenderCycle` | `() => void` | Snapshots the pending rendered fields into `lastRenderedFields`, resets the pending set, and increments total form render count. Must be called manually (see Setup note above). |
| `getRenderCounts` | `() => Map<string, number>` | Returns a copy of all per-field render counts. |
| `getLastRenderedFields` | `() => Set<string>` | Returns a copy of the field names that rendered in the last flushed cycle. |
| `getTotalFormRenders` | `() => number` | Returns total form render count (number of `flushRenderCycle` calls). |
| `resetRenderTracker` | `() => void` | Clears all render counts, cycle data, and resets the total counter to 0. |

**Note:** `RenderTracker` uses module-level state (`Map` and `Set` instances). In SSR environments, this state is shared across requests if the module is not re-imported. This is safe because `FormDevTools` is typically disabled in production and during SSR.

### EventTimeline API

```tsx
import {
  logEvent,
  getTimeline,
  clearTimeline,
} from "@bghcore/dynamic-forms-core";
import type { ITimelineEvent, TimelineEventType } from "@bghcore/dynamic-forms-core";
```

| Function | Signature | Description |
|---|---|---|
| `logEvent` | `(type: TimelineEventType, fieldName: string, details: string) => void` | Appends a timestamped event to the timeline buffer. Automatically trims to 500 events. |
| `getTimeline` | `() => ITimelineEvent[]` | Returns a shallow copy of all stored events. |
| `clearTimeline` | `() => void` | Removes all events from the timeline buffer. |

**Types:**

```typescript
type TimelineEventType = "field_change" | "rule_evaluated" | "validation_run" | "form_submit";

interface ITimelineEvent {
  timestamp: number;   // Date.now() at the time of logging
  type: TimelineEventType;
  fieldName: string;
  details: string;
}
```

### Example: Custom Event Logging

```tsx
import { logEvent } from "@bghcore/dynamic-forms-core";

// Log a form submission event (not logged automatically)
function handleSubmit(values: Record<string, unknown>) {
  logEvent("form_submit", "form", `submitted with ${Object.keys(values).length} fields`);
  // ... submit logic
}
```

### Example: Render Count Assertions in Tests

```tsx
import { getRenderCounts, resetRenderTracker } from "@bghcore/dynamic-forms-core";

beforeEach(() => {
  resetRenderTracker();
});

test("changing status field does not re-render unrelated fields", () => {
  // ... render form, change the "status" field ...
  const counts = getRenderCounts();
  expect(counts.get("unrelatedField")).toBeLessThan(3);
});
```

### Example: Timeline Assertions in Tests

```tsx
import { getTimeline, clearTimeline } from "@bghcore/dynamic-forms-core";

beforeEach(() => {
  clearTimeline();
});

test("changing category triggers rule evaluation on subcategory", () => {
  // ... render form, change the "category" field ...
  const events = getTimeline();
  const ruleEvents = events.filter(
    (e) => e.type === "rule_evaluated" && e.fieldName === "subcategory"
  );
  expect(ruleEvents.length).toBeGreaterThan(0);
});
```

---

## Related: RuleTracer API

For deeper rule-level debugging (individual rule evaluation, apply, and revert events with before/after state snapshots), the core package also exports the `RuleTracer` API. This is a separate system from `EventTimeline` and provides more granular tracing:

```tsx
import {
  enableRuleTracing,
  disableRuleTracing,
  getRuleTraceLog,
  clearRuleTraceLog,
} from "@bghcore/dynamic-forms-core";
import type { IRuleTraceEvent } from "@bghcore/dynamic-forms-core";
```

| Function | Description |
|---|---|
| `enableRuleTracing(callback?)` | Turns on tracing. Optional callback is invoked for each trace event. |
| `disableRuleTracing()` | Turns off tracing. |
| `getRuleTraceLog()` | Returns a copy of all trace events since tracing was enabled. |
| `clearRuleTraceLog()` | Clears the trace log. |
| `isRuleTracingEnabled()` | Returns `true` if tracing is currently active. |

Each `IRuleTraceEvent` includes:

```typescript
interface IRuleTraceEvent {
  timestamp: number;
  type: "evaluate" | "apply" | "revert" | "init";
  triggerField: string;
  triggerValue: unknown;
  affectedField: string;
  ruleId?: string;
  previousState?: Partial<IRuntimeFieldState>;
  newState?: Partial<IRuntimeFieldState>;
}
```

Use `enableRuleTracing()` with a callback for real-time logging during development:

```tsx
enableRuleTracing((event) => {
  console.log(
    `[Rule Trace] ${event.type}: ${event.triggerField} -> ${event.affectedField}`,
    event.previousState,
    "=>",
    event.newState
  );
});
```

---

## Comparison of Debugging Tools

| Tool | Scope | Granularity | UI Tab | Automatic |
|---|---|---|---|---|
| **Perf tab / RenderTracker** | Render performance | Per-field render counts | Perf | `trackRender` is automatic; `flushRenderCycle` is manual |
| **Deps tab** | Dependency structure | Per-field dependency + effect summary | Deps | Fully automatic (reads `IRuntimeFieldState`) |
| **Timeline tab / EventTimeline** | Event tracing | Per-event (field change, rule eval, validation) | Timeline | Automatic for 3 of 4 event types |
| **RuleTracer** | Rule evaluation detail | Per-rule (trigger, apply, revert with state diffs) | None | Manual (must call `enableRuleTracing()`) |
| **Graph tab** | Dependency text view | Per-field dependency arrows | Graph | Fully automatic (reads `IRuntimeFieldState`) |

---

## Production Considerations

- Set `enabled={false}` (or gate on `process.env.NODE_ENV`) to ensure FormDevTools renders nothing in production.
- `RenderTracker` and `EventTimeline` use module-level state and continue to accumulate data even when FormDevTools is not rendered. If you want to avoid this overhead entirely in production, ensure that the code paths calling `trackRender` and `logEvent` are tree-shaken or conditionally excluded.
- The 500-event cap on `EventTimeline` prevents unbounded memory growth, but long-running development sessions may lose early events. Call `clearTimeline()` periodically if you need to preserve event ordering over extended sessions.
- `RenderTracker` has no cap on the number of tracked fields. In forms with hundreds of fields, the `Map` will grow accordingly but the memory impact is negligible.
