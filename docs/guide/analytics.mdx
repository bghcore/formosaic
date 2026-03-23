---
title: Analytics & Telemetry
---

# Form Analytics & Telemetry

The core package (`@formosaic/core`) provides an opt-in analytics system for tracking form lifecycle events. When analytics callbacks are provided in form settings, events such as field focus, blur, change, validation errors, form submission, abandonment, wizard step navigation, and rule evaluation are automatically tracked.

---

## Setup

Add an `analytics` object to `IFormSettings` inside your `IFormConfig`. Each callback is optional -- provide only the events you care about.

```tsx
import { IFormConfig } from "@formosaic/core";

const formConfig: IFormConfig = {
  version: 2,
  fields: {
    name: { type: "Textbox", label: "Name", required: true },
    email: { type: "Textbox", label: "Email" },
  },
  settings: {
    analytics: {
      onFieldFocus: (fieldName) => console.log("Focus:", fieldName),
      onFieldBlur: (fieldName, timeSpentMs) => console.log("Blur:", fieldName, timeSpentMs + "ms"),
      onFieldChange: (fieldName, oldValue, newValue) => telemetry.track("field_change", { fieldName }),
      onValidationError: (fieldName, errors) => telemetry.track("validation_error", { fieldName, errors }),
      onFormSubmit: (values, durationMs) => telemetry.track("form_submit", { durationMs }),
      onFormAbandonment: (filledFields, emptyRequired) => telemetry.track("form_abandoned", { emptyRequired }),
      onWizardStepChange: (from, to) => telemetry.track("wizard_step", { from, to }),
      onRuleTriggered: (event) => telemetry.track("rule_triggered", event),
    },
  },
};
```

---

## IAnalyticsCallbacks Interface

All callbacks are optional. If a callback is not provided, the corresponding event is silently ignored with zero overhead.

| Callback | Signature | Description |
|---|---|---|
| `onFieldFocus` | `(fieldName: string) => void` | Field receives focus |
| `onFieldBlur` | `(fieldName: string, timeSpentMs: number) => void` | Field loses focus (with duration) |
| `onFieldChange` | `(fieldName: string, oldValue: unknown, newValue: unknown) => void` | Field value changes |
| `onValidationError` | `(fieldName: string, errors: string[]) => void` | Field validation fails |
| `onFormSubmit` | `(values: Record<string, unknown>, durationMs: number) => void` | Form submitted successfully |
| `onFormAbandonment` | `(filledFields: string[], emptyRequiredFields: string[]) => void` | User navigates away with unsaved changes |
| `onWizardStepChange` | `(fromStep: number, toStep: number) => void` | Wizard step changes |
| `onRuleTriggered` | `(event: { fieldName: string; ruleIndex: number; conditionMet: boolean }) => void` | Rule evaluated |

---

## useFormAnalytics Hook

```typescript
import { useFormAnalytics, IFormAnalytics } from "@formosaic/core";

const analytics: IFormAnalytics = useFormAnalytics(callbacks);
```

The hook returns a **stable, memoized** object with tracking methods: `trackFieldFocus`, `trackFieldBlur`, `trackFieldChange`, `trackValidationError`, `trackFormSubmit`, `trackFormAbandonment`, `trackWizardStepChange`, `trackRuleTriggered`.

---

## Integration Example: Application Insights

```typescript
import { appInsights } from "./telemetryClient";
import { IAnalyticsCallbacks } from "@formosaic/core";

const analyticsCallbacks: IAnalyticsCallbacks = {
  onFieldFocus: (fieldName) => {
    appInsights.trackEvent({ name: "FormFieldFocus", properties: { fieldName } });
  },
  onFieldBlur: (fieldName, timeSpentMs) => {
    appInsights.trackMetric({
      name: "FormFieldTimeSpent",
      average: timeSpentMs,
      properties: { fieldName },
    });
  },
  onFormSubmit: (values, durationMs) => {
    appInsights.trackEvent({
      name: "FormSubmit",
      measurements: { durationMs },
    });
  },
};
```

---

## Design Decisions

- **Opt-in with zero overhead**: When `settings.analytics` is not provided, every tracking function short-circuits via optional chaining.
- **Ref pattern for callback stability**: The callbacks object is stored in a `useRef`, so the returned `IFormAnalytics` object reference is stable across re-renders.
- **Focus timing via useRef map**: Per-field focus duration is tracked with a `useRef<Record<string, number>>` map.
- **Form duration from hook mount time**: `formStartTime` is captured once at mount for `durationMs` calculations.
