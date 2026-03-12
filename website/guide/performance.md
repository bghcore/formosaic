---
title: Performance Debugging & DevTools
---

# Performance Debugging & DevTools

This guide covers the FormDevTools component and the underlying performance and event-tracing APIs for diagnosing render performance issues and inspecting rule evaluation behavior.

---

## FormDevTools Overview

`FormDevTools` is a collapsible developer panel with seven tabs:

| Tab | What it shows |
|---|---|
| Rules | Per-field runtime state: type, required, hidden, readOnly, active rules |
| Values | Current form values as formatted JSON |
| Errors | Current form errors |
| Graph | Text-based dependency graph |
| Perf | Per-field render counts via RenderTracker |
| Deps | Tabular dependency graph with cycle detection |
| Timeline | Chronological event log |

---

## Performance Tab (Perf)

Shows per-field render counts. **Hot fields** (render count exceeds 1.5x the average) are highlighted in orange.

### How Tracking Works

`RenderField` calls `trackRender(fieldName)` on every render. Call `flushRenderCycle()` in a `useEffect` to get accurate "Last Cycle" data:

```tsx
import { flushRenderCycle } from "@formosaic/core";

function MyFormWrapper(props) {
  React.useEffect(() => { flushRenderCycle(); });
  return <FormEngine {...props} />;
}
```

---

## Dependency Graph Tab (Deps)

Shows field dependency relationships with color coding by effect type:

| Effect | Color |
|---|---|
| `hidden` | Yellow |
| `required` | Blue |
| `readOnly` | Gray |
| `options` | Green |

Includes pairwise cycle detection and sorting by name or dependency count.

---

## Timeline Tab

Chronological event log with filtering:

| Event Type | When It Fires |
|---|---|
| `field_change` | After a field value changes |
| `rule_evaluated` | During `evaluateAllRules()` |
| `validation_run` | During sync validation |
| `form_submit` | Available for custom logging |

---

## Programmatic Access

### RenderTracker API

```tsx
import {
  trackRender,
  flushRenderCycle,
  getRenderCounts,
  getLastRenderedFields,
  getTotalFormRenders,
  resetRenderTracker,
} from "@formosaic/core";
```

### EventTimeline API

```tsx
import { logEvent, getTimeline, clearTimeline } from "@formosaic/core";

// Log a custom event
logEvent("form_submit", "form", `submitted with ${Object.keys(values).length} fields`);
```

### RuleTracer API

```tsx
import {
  enableRuleTracing,
  disableRuleTracing,
  getRuleTraceLog,
  clearRuleTraceLog,
} from "@formosaic/core";

enableRuleTracing((event) => {
  console.log(`[Rule Trace] ${event.type}: ${event.triggerField} -> ${event.affectedField}`);
});
```

---

## Production Considerations

- Set `enabled={false}` to ensure FormDevTools renders nothing in production.
- The 500-event cap on `EventTimeline` prevents unbounded memory growth.
- `RenderTracker` has no cap on tracked fields but memory impact is negligible.
