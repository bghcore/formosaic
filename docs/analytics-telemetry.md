# Form Analytics & Telemetry

The core package (`@form-engine/core`) provides an opt-in analytics system for tracking form lifecycle events. When analytics callbacks are provided in form settings, events such as field focus, blur, change, validation errors, form submission, abandonment, wizard step navigation, and rule evaluation are automatically tracked with zero configuration beyond supplying the callbacks.

All analytics infrastructure lives in two files:

- `packages/core/src/types/IAnalyticsCallbacks.ts` -- callback interface definition
- `packages/core/src/hooks/useFormAnalytics.ts` -- hook that wraps callbacks into safe, memoized functions

**Last updated:** 2026-03-05 | **Package version:** 2.0.x

---

## Setup

Add an `analytics` object to `IFormSettings` inside your `IFormConfig`. Each callback is optional -- provide only the events you care about.

```tsx
import { IFormConfig } from "@form-engine/core";

const formConfig: IFormConfig = {
  version: 2,
  fields: {
    name: { type: "Textbox", label: "Name", required: true },
    email: { type: "Textbox", label: "Email" },
    status: {
      type: "Dropdown",
      label: "Status",
      options: [
        { value: "draft", label: "Draft" },
        { value: "published", label: "Published" },
      ],
    },
  },
  settings: {
    analytics: {
      onFieldFocus: (fieldName) => {
        console.log("Focus:", fieldName);
      },
      onFieldBlur: (fieldName, timeSpentMs) => {
        console.log("Blur:", fieldName, timeSpentMs + "ms");
      },
      onFieldChange: (fieldName, oldValue, newValue) => {
        telemetry.track("field_change", { fieldName, oldValue, newValue });
      },
      onValidationError: (fieldName, errors) => {
        telemetry.track("validation_error", { fieldName, errors });
      },
      onFormSubmit: (values, durationMs) => {
        telemetry.track("form_submit", { durationMs });
      },
      onFormAbandonment: (filledFields, emptyRequiredFields) => {
        telemetry.track("form_abandoned", { filledFields, emptyRequiredFields });
      },
      onWizardStepChange: (fromStep, toStep) => {
        telemetry.track("wizard_step", { fromStep, toStep });
      },
      onRuleTriggered: (event) => {
        telemetry.track("rule_triggered", event);
      },
    },
  },
};
```

Pass the `formConfig` to `FormEngine` as usual. The component reads `formConfig.settings.analytics` internally and wires up all event tracking automatically.

```tsx
<RulesEngineProvider>
  <InjectedFieldProvider injectedFields={fieldRegistry}>
    <FormEngine
      formConfig={formConfig}
      defaultValues={entityData}
      configName="myForm"
      entityId="123"
      entityType="record"
      programName="app"
    />
  </InjectedFieldProvider>
</RulesEngineProvider>
```

---

## IAnalyticsCallbacks Interface

Defined in `packages/core/src/types/IAnalyticsCallbacks.ts`. All callbacks are optional. If a callback is not provided, the corresponding event is silently ignored with zero overhead.

### onFieldFocus

```typescript
onFieldFocus?: (fieldName: string) => void;
```

Fired when a field receives focus. The `fieldName` matches the key in `IFormConfig.fields`.

**Fired from:** `RenderField` -- passed as the `onFocus` prop to the injected field component.

---

### onFieldBlur

```typescript
onFieldBlur?: (fieldName: string, timeSpentMs: number) => void;
```

Fired when a field loses focus. `timeSpentMs` is the elapsed time in milliseconds since the matching `onFieldFocus` call for the same field. If no prior focus was tracked (e.g., the field was blurred without a corresponding focus event), `timeSpentMs` is `0`.

**Fired from:** `RenderField` -- passed as the `onBlur` prop to the injected field component.

---

### onFieldChange

```typescript
onFieldChange?: (fieldName: string, oldValue: unknown, newValue: unknown) => void;
```

Fired when a field value changes. The `oldValue` and `newValue` are the raw values from react-hook-form's `Controller`. The change is detected inside the `Controller` render function by comparing the current value to a `useRef`-tracked previous value.

**Fired from:** `RenderField` -- inside the `Controller` render callback.

**Note:** Because change detection happens during render, this fires whenever react-hook-form re-renders the field with a different value. The first render after mount does not fire a change event (the previous value ref is initialized to `undefined` and the check requires `previousValueRef.current !== undefined`).

---

### onValidationError

```typescript
onValidationError?: (fieldName: string, errors: string[]) => void;
```

Fired when field validation fails. The `errors` array contains the error messages from the field's validation rules. Currently, this fires with a single-element array containing the error message from react-hook-form's `FieldError`.

**Fired from:** `RenderField` -- inside the `Controller` render callback, when an `error` object is present on the field state.

**Note:** This fires on every render where the field has an error, not just on the first occurrence. If you want to deduplicate, track previously-seen errors in your callback implementation.

---

### onFormSubmit

```typescript
onFormSubmit?: (values: Record<string, unknown>, durationMs: number) => void;
```

Fired on successful form submission (after the save completes without error). `values` contains the submitted form data. `durationMs` is the elapsed time from when the `useFormAnalytics` hook was mounted (i.e., when `FormEngine` first rendered) to the moment of submission.

**Fired from:** `FormEngine` -- inside the `handleSave` function, after the save promise resolves successfully (including after retries, if any).

---

### onFormAbandonment

```typescript
onFormAbandonment?: (filledFields: string[], emptyRequiredFields: string[]) => void;
```

Fired when the user navigates away from the page while there are unsaved changes. This integrates with the `useBeforeUnload` hook. The `filledFields` and `emptyRequiredFields` arrays describe the form's state at the time of abandonment.

**Fired from:** Consumer code via `useBeforeUnload`. The `useBeforeUnload` hook accepts an `onAbandonment` callback parameter. It is up to the consuming application to connect this to the analytics callback and pass the field lists.

**Important:** The `useBeforeUnload` hook fires a generic `onAbandonment` callback with no arguments. The consumer is responsible for wrapping the analytics callback with the field data:

```tsx
import { useBeforeUnload, useFormAnalytics } from "@form-engine/core";

// In your form wrapper component:
const analytics = useFormAnalytics(formConfig.settings?.analytics);
const { formState: { isDirty }, getValues } = useFormContext();

useBeforeUnload(isDirty, "You have unsaved changes.", () => {
  const values = getValues();
  const filledFields = Object.keys(values).filter((k) => values[k] != null && values[k] !== "");
  const emptyRequiredFields = Object.keys(formConfig.fields).filter(
    (k) => formConfig.fields[k].required && (!values[k] || values[k] === "")
  );
  analytics.trackFormAbandonment(filledFields, emptyRequiredFields);
});
```

---

### onWizardStepChange

```typescript
onWizardStepChange?: (fromStep: number, toStep: number) => void;
```

Fired when the active wizard step changes. `fromStep` and `toStep` are zero-based step indices within the visible steps array.

**Fired from:** `WizardForm` -- via the `onAnalyticsStepChange` prop. The `WizardForm` component calls this inside the `goToStep` function, after validation passes (if `validateOnStepChange` is enabled) and after the `onStepChange` general callback fires.

---

### onRuleTriggered

```typescript
onRuleTriggered?: (event: {
  fieldName: string;
  ruleIndex: number;
  conditionMet: boolean;
}) => void;
```

Fired when a rule is evaluated. The event contains:

| Property | Type | Description |
|---|---|---|
| `fieldName` | `string` | The field that owns the rule |
| `ruleIndex` | `number` | Index of the rule in the field's `rules` array |
| `conditionMet` | `boolean` | Whether the rule's `when` condition evaluated to `true` |

**Fired from:** Consumer code via `trackRuleTriggered`. The rules engine itself does not automatically fire this callback -- it must be wired in by the consuming application or a custom rules engine integration.

---

## useFormAnalytics Hook

Defined in `packages/core/src/hooks/useFormAnalytics.ts`. Exported from `@form-engine/core`.

```typescript
import { useFormAnalytics, IFormAnalytics } from "@form-engine/core";

const analytics: IFormAnalytics = useFormAnalytics(callbacks);
```

### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `callbacks` | `IAnalyticsCallbacks \| undefined` | No | The analytics callbacks to wrap. When `undefined`, all tracking functions become no-ops. |

### Return Value: IFormAnalytics

The hook returns a **stable, memoized** object with the following methods:

| Method | Signature | Description |
|---|---|---|
| `trackFieldFocus` | `(fieldName: string) => void` | Records focus timestamp and fires `onFieldFocus` |
| `trackFieldBlur` | `(fieldName: string) => void` | Calculates time since focus and fires `onFieldBlur` |
| `trackFieldChange` | `(fieldName: string, oldValue: unknown, newValue: unknown) => void` | Fires `onFieldChange` |
| `trackValidationError` | `(fieldName: string, errors: string[]) => void` | Fires `onValidationError` |
| `trackFormSubmit` | `(values: Record<string, unknown>) => void` | Calculates duration since mount and fires `onFormSubmit` |
| `trackFormAbandonment` | `(filledFields: string[], emptyRequiredFields: string[]) => void` | Fires `onFormAbandonment` |
| `trackWizardStepChange` | `(fromStep: number, toStep: number) => void` | Fires `onWizardStepChange` |
| `trackRuleTriggered` | `(event: { fieldName: string; ruleIndex: number; conditionMet: boolean }) => void` | Fires `onRuleTriggered` |
| `formStartTime` | `number` | Timestamp (ms) recorded at hook creation. Used for `durationMs` calculation in `trackFormSubmit`. |

### How It Works

1. **Form start time.** Captured once via `useRef(Date.now()).current` on the first render. Survives re-renders without changing.

2. **Focus timing.** A `useRef<Record<string, number>>({})` map tracks per-field focus timestamps. When `trackFieldFocus` is called, it stores `Date.now()` keyed by field name. When `trackFieldBlur` is called, it calculates the elapsed time, deletes the entry, and passes the duration to `onFieldBlur`.

3. **Callback ref pattern.** The `callbacks` object is stored in a `useRef` that is updated on every render (`callbacksRef.current = callbacks`). All wrapper functions read from `callbacksRef.current`, which means:
   - The returned `IFormAnalytics` object reference never changes (memoized via `useMemo` with `[formStartTime]` as the dependency -- which is stable).
   - Callers can change the callbacks object on re-render without causing downstream re-renders or re-subscriptions.
   - Event handlers that capture the analytics object in a closure always call the latest version of each callback.

4. **Zero overhead when disabled.** Every wrapper function uses optional chaining (`callbacksRef.current?.onFieldFocus?.(...)`) so when no callbacks are provided, the function body executes in constant time with no allocations.

---

## Where Events Are Fired

This table summarizes which component or hook fires each analytics event:

| Event | Source Component | Trigger |
|---|---|---|
| `trackFieldFocus` | `RenderField` | Passed as `onFocus` prop to injected field component |
| `trackFieldBlur` | `RenderField` | Passed as `onBlur` prop to injected field component |
| `trackFieldChange` | `RenderField` | Detected inside `Controller` render when value differs from previous ref |
| `trackValidationError` | `RenderField` | Detected inside `Controller` render when `error` is present |
| `trackFormSubmit` | `FormEngine` | Called in `handleSave` after successful save |
| `trackFormAbandonment` | Consumer code | Wired via `useBeforeUnload` hook's `onAbandonment` parameter |
| `trackWizardStepChange` | `WizardForm` | Called via `onAnalyticsStepChange` prop in `goToStep` |
| `trackRuleTriggered` | Consumer code | Called via `trackRuleTriggered` method |

### Data Flow

```
IFormConfig.settings.analytics (IAnalyticsCallbacks)
  |
  v
FormEngine
  |-- useFormAnalytics(settings.analytics) --> IFormAnalytics
  |
  |-- analytics.trackFormSubmit(data) ............ on successful save
  |
  +-- FormFields (receives analytics prop)
        |
        +-- RenderField (receives analytics prop)
              |
              |-- onFocus -> analytics.trackFieldFocus(fieldName)
              |-- onBlur  -> analytics.trackFieldBlur(fieldName)
              |-- render  -> analytics.trackFieldChange(fieldName, old, new)
              |-- render  -> analytics.trackValidationError(fieldName, errors)

WizardForm
  |-- onAnalyticsStepChange -> analytics.trackWizardStepChange(from, to)

useBeforeUnload
  |-- onAbandonment -> (consumer wires to analytics.trackFormAbandonment)
```

---

## Integration Examples

### Application Insights (Azure)

```typescript
import { appInsights } from "./telemetryClient"; // Your configured AI instance
import { IAnalyticsCallbacks } from "@form-engine/core";

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
  onFieldChange: (fieldName, _oldValue, _newValue) => {
    appInsights.trackEvent({ name: "FormFieldChange", properties: { fieldName } });
  },
  onValidationError: (fieldName, errors) => {
    appInsights.trackEvent({
      name: "FormValidationError",
      properties: { fieldName, errors: errors.join("; ") },
    });
  },
  onFormSubmit: (values, durationMs) => {
    appInsights.trackEvent({
      name: "FormSubmit",
      properties: { fieldCount: Object.keys(values).length },
      measurements: { durationMs },
    });
  },
  onFormAbandonment: (filledFields, emptyRequiredFields) => {
    appInsights.trackEvent({
      name: "FormAbandoned",
      properties: {
        filledCount: filledFields.length,
        emptyRequiredCount: emptyRequiredFields.length,
        emptyRequiredFields: emptyRequiredFields.join(", "),
      },
    });
  },
  onWizardStepChange: (fromStep, toStep) => {
    appInsights.trackEvent({
      name: "WizardStepChange",
      properties: { fromStep, toStep },
    });
  },
};
```

### Custom Event Aggregation

Collect analytics in memory and flush periodically or on form submit:

```typescript
import { IAnalyticsCallbacks } from "@form-engine/core";

interface IFieldInteraction {
  fieldName: string;
  focusCount: number;
  totalTimeMs: number;
  changeCount: number;
  validationErrorCount: number;
}

class FormAnalyticsAggregator {
  private interactions: Record<string, IFieldInteraction> = {};

  private getOrCreate(fieldName: string): IFieldInteraction {
    if (!this.interactions[fieldName]) {
      this.interactions[fieldName] = {
        fieldName,
        focusCount: 0,
        totalTimeMs: 0,
        changeCount: 0,
        validationErrorCount: 0,
      };
    }
    return this.interactions[fieldName];
  }

  getCallbacks(): IAnalyticsCallbacks {
    return {
      onFieldFocus: (fieldName) => {
        this.getOrCreate(fieldName).focusCount++;
      },
      onFieldBlur: (fieldName, timeSpentMs) => {
        this.getOrCreate(fieldName).totalTimeMs += timeSpentMs;
      },
      onFieldChange: (fieldName) => {
        this.getOrCreate(fieldName).changeCount++;
      },
      onValidationError: (fieldName) => {
        this.getOrCreate(fieldName).validationErrorCount++;
      },
      onFormSubmit: (values, durationMs) => {
        this.flush(durationMs);
      },
    };
  }

  flush(formDurationMs?: number): void {
    const payload = {
      formDurationMs,
      fieldInteractions: Object.values(this.interactions),
    };
    // Send to your analytics endpoint
    navigator.sendBeacon("/api/analytics/form", JSON.stringify(payload));
    this.interactions = {};
  }
}

// Usage:
const aggregator = new FormAnalyticsAggregator();

const formConfig: IFormConfig = {
  version: 2,
  fields: { /* ... */ },
  settings: {
    analytics: aggregator.getCallbacks(),
  },
};
```

### Form Completion Rate Tracking

Track which fields users complete and where they drop off:

```typescript
import { IAnalyticsCallbacks } from "@form-engine/core";

function createCompletionTracker(
  formName: string,
  requiredFieldNames: string[],
  onReport: (data: {
    formName: string;
    completionRate: number;
    completedFields: string[];
    abandonedFields: string[];
    durationMs?: number;
  }) => void
): IAnalyticsCallbacks {
  const completedFields = new Set<string>();

  return {
    onFieldChange: (fieldName, _oldValue, newValue) => {
      if (newValue != null && newValue !== "") {
        completedFields.add(fieldName);
      } else {
        completedFields.delete(fieldName);
      }
    },
    onFormSubmit: (_values, durationMs) => {
      const completed = requiredFieldNames.filter((f) => completedFields.has(f));
      onReport({
        formName,
        completionRate: completed.length / requiredFieldNames.length,
        completedFields: completed,
        abandonedFields: requiredFieldNames.filter((f) => !completedFields.has(f)),
        durationMs,
      });
    },
    onFormAbandonment: (filledFields, emptyRequiredFields) => {
      onReport({
        formName,
        completionRate: filledFields.length / (filledFields.length + emptyRequiredFields.length),
        completedFields: filledFields,
        abandonedFields: emptyRequiredFields,
      });
    },
  };
}

// Usage:
const requiredFields = Object.entries(formConfig.fields)
  .filter(([, cfg]) => cfg.required)
  .map(([name]) => name);

const analytics = createCompletionTracker(
  "user-registration",
  requiredFields,
  (data) => fetch("/api/analytics/completion", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  }),
);

const config: IFormConfig = {
  version: 2,
  fields: { /* ... */ },
  settings: { analytics },
};
```

---

## Design Decisions

### Opt-in with zero overhead

Analytics callbacks are entirely optional. When `settings.analytics` is not provided (or is `undefined`), `useFormAnalytics` receives `undefined` and every tracking function short-circuits via optional chaining. No event objects are allocated, no maps are populated, and no closures are invoked beyond the null check.

### Ref pattern for callback stability

The callbacks object is stored in a `useRef` and updated synchronously on every render:

```typescript
const callbacksRef = useRef(callbacks);
callbacksRef.current = callbacks;
```

The wrapper functions returned by `useMemo` always read from `callbacksRef.current`. This means:

- The `IFormAnalytics` object reference is **stable** across re-renders (memoized with `[formStartTime]`, which never changes).
- Consumers can pass new callback objects on re-render without causing child components to re-render.
- Components like `RenderField` that receive `analytics` as a prop do not need to be re-memoized when callbacks change.

### Focus timing via useRef map

Per-field focus duration is tracked with a `useRef<Record<string, number>>({})` map:

- `trackFieldFocus(fieldName)` stores `Date.now()` at the field's key.
- `trackFieldBlur(fieldName)` reads the stored timestamp, computes the difference, and deletes the entry.
- If `trackFieldBlur` is called without a prior `trackFieldFocus`, the elapsed time defaults to `0`.
- Multiple fields can be tracked concurrently (e.g., if a field loses focus without a blur event firing first due to keyboard navigation).

### Form duration from hook mount time

`formStartTime` is captured once via `useRef(Date.now()).current` when `useFormAnalytics` is first called. Since `FormEngine` calls the hook at mount, this represents when the form first rendered. `trackFormSubmit` computes `Date.now() - formStartTime` to report total form interaction duration.

---

## Related Systems

The analytics system is separate from but complementary to the following debugging and observability tools in the core package:

| Tool | Purpose | Source |
|---|---|---|
| **EventTimeline** | Chronological log of field changes, rule evaluations, validation runs, and form submits for `FormDevTools` | `helpers/EventTimeline.ts` |
| **RenderTracker** | Tracks per-field render counts for performance profiling | `helpers/RenderTracker.ts` |
| **RuleTracer** | Detailed rule evaluation trace log for debugging rule behavior | `helpers/RuleTracer.ts` |
| **FormDevTools** | Dev-mode panel displaying rules state, values, errors, and dependency graph | `components/FormDevTools.tsx` |

The analytics system is designed for **production telemetry** (shipped to external services), while the above tools are designed for **development-time debugging** (in-browser inspection).
