# @form-engine/core

UI-library agnostic business rules engine and form orchestration for configuration-driven React forms. Built for React -- works with any component library (Fluent UI, MUI, Ant Design, or your own). Define forms as JSON -- field definitions, dependency rules, dropdown options, ordering -- and the library handles rendering, validation, auto-save, and field interactions automatically.

## Install

```bash
npm install @form-engine/core
```

Peer dependencies: `react` (18 or 19), `react-hook-form` (v7)

## Quick Start

```tsx
import {
  RulesEngineProvider,
  InjectedFieldProvider,
  FormEngine,
} from "@form-engine/core";

const fieldConfigs = {
  name: { type: "Textbox", label: "Name", required: true },
  status: {
    type: "Dropdown",
    label: "Status",
    options: [
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
    ],
  },
};

function App() {
  return (
    <RulesEngineProvider>
      <InjectedFieldProvider>
        <FormEngine
          configName="myForm"
          programName="myApp"
          fieldConfigs={fieldConfigs}
          defaultValues={{ name: "", status: "Active" }}
          saveData={async (data) => {
            console.log("Saving:", data);
            return data;
          }}
        />
      </InjectedFieldProvider>
    </RulesEngineProvider>
  );
}
```

You'll also need a UI adapter to provide field components. See:
- [`@form-engine/fluent`](https://www.npmjs.com/package/@form-engine/fluent) -- Fluent UI v9
- [`@form-engine/mui`](https://www.npmjs.com/package/@form-engine/mui) -- Material UI
- [`@form-engine/headless`](https://www.npmjs.com/package/@form-engine/headless) -- Unstyled semantic HTML (Tailwind-friendly)

## Business Rules Engine

Rules are **declarative** -- defined as data in `IFieldConfig.rules`, not imperative code.

When a field value changes, the engine:

1. Reverts previously applied rules on dependent fields
2. Re-evaluates which rules match the new value
3. Applies new rules (required, hidden, readOnly, component swap, validations, etc.)
4. Processes combo (AND) rules across multiple fields
5. Updates dropdown options based on dependency rules
6. Reorders fields if order dependencies are defined

Includes **circular dependency detection** via Kahn's algorithm and **config validation** for catching misconfigurations early.

## Validation

### 15 Built-in Sync Validators

`EmailValidation`, `PhoneNumberValidation`, `YearValidation`, `Max150KbValidation`, `Max32KbValidation`, `isValidUrl`, `NoSpecialCharactersValidation`, `CurrencyValidation`, `UniqueInArrayValidation`

### Factory Validators

```tsx
import {
  createMinLengthValidation,
  createMaxLengthValidation,
  createNumericRangeValidation,
  createPatternValidation,
  createRequiredIfValidation,
} from "@form-engine/core";

registerValidators({
  MinLength3: createMinLengthValidation(3),
  Max100Chars: createMaxLengthValidation(100),
  Score1to10: createNumericRangeValidation(1, 10),
  AlphaOnly: createPatternValidation(/^[a-zA-Z]+$/, "Letters only"),
  RequiredIfActive: createRequiredIfValidation("status", ["Active"]),
});
```

### Async Validators

```tsx
import { registerValidators } from "@form-engine/core";

registerValidators({
  CheckUniqueEmail: async (value, entityData, signal) => {
    const res = await fetch(`/api/check?email=${value}`, { signal });
    const { exists } = await res.json();
    return exists ? "Already in use" : undefined;
  },
});
```

Reference in field configs via `validate: [{ validator: "CheckUniqueEmail", async: true }]`.

### Config Validation

```tsx
import { validateFieldConfigs } from "@form-engine/core";

const errors = validateFieldConfigs(fieldConfigs, registeredComponentTypes);
// Checks: missing dep targets, unregistered components/validators, circular deps
```

## Multi-Step Wizard

```tsx
import { WizardForm } from "@form-engine/core";

<WizardForm
  wizardConfig={{
    steps: [
      { id: "basics", title: "Basics", fields: ["name", "type"] },
      { id: "details", title: "Details", fields: ["description"],
        visibleWhen: { field: "type", is: ["bug"] } },
    ],
    validateOnStepChange: true,
  }}
  entityData={formValues}
  renderStepContent={(fields) => <FieldRenderer fields={fields} />}
  renderStepNavigation={({ goNext, goPrev, canGoNext, canGoPrev }) => (
    <nav>
      <button onClick={goPrev} disabled={!canGoPrev}>Back</button>
      <button onClick={goNext} disabled={!canGoNext}>Next</button>
    </nav>
  )}
/>
```

All fields stay in a single `react-hook-form` context. Steps just control which fields are visible. Cross-step business rules work automatically.

## Field Arrays

```tsx
import { FieldArray } from "@form-engine/core";

<FieldArray
  fieldName="contacts"
  config={{
    items: { name: { type: "Textbox", label: "Name" } },
    minItems: 1,
    maxItems: 5,
  }}
  renderItem={(fieldNames, index, remove) => (
    <div>
      <FieldRenderer fields={fieldNames} />
      <button onClick={remove}>Remove</button>
    </div>
  )}
  renderAddButton={(append, canAdd) => (
    <button onClick={append} disabled={!canAdd}>Add</button>
  )}
/>
```

## i18n / Localization

```tsx
import { registerLocale } from "@form-engine/core";

registerLocale({
  required: "Obligatoire",
  save: "Sauvegarder",
  invalidEmail: "Adresse e-mail invalide",
  // Partial -- unspecified keys fall back to English
});
```

All strings in `FormStrings` and validation error messages resolve through the locale registry.

## Manual Save vs Auto-Save

```tsx
// Auto-save (default) -- saves on every field change with debounce
<FormEngine saveData={async (data) => data} />

// Manual save -- shows Save/Cancel buttons, no auto-save
<FormEngine isManualSave={true} saveData={async (data) => data} />

// Manual save with custom buttons
<FormEngine
  isManualSave={true}
  renderSaveButton={({ onSave, isDirty, isSubmitting }) => (
    <button onClick={onSave} disabled={!isDirty || isSubmitting}>Submit</button>
  )}
/>
```

## Error Boundary

Each field is individually wrapped in `FormErrorBoundary` so one crashing field does not take down the entire form:

```tsx
import { FormErrorBoundary } from "@form-engine/core";

<FormErrorBoundary
  fallback={(error, resetErrorBoundary) => (
    <div>
      <p>Field crashed: {error.message}</p>
      <button onClick={resetErrorBoundary}>Retry</button>
    </div>
  )}
  onError={(error, errorInfo) => logError(error)}
>
  <MyField />
</FormErrorBoundary>
```

Built into the core rendering pipeline automatically.

## Save Reliability

FormEngine includes robust save handling:

- **AbortController** cancels previous in-flight saves when a new save triggers
- **Configurable timeout** via `saveTimeoutMs` prop (default 30 seconds)
- **Retry with exponential backoff** via `maxSaveRetries` prop (default 3 retries)

```tsx
<FormEngine
  saveTimeoutMs={15000}
  maxSaveRetries={5}
  saveData={async (data) => { /* ... */ }}
/>
```

## Accessibility

Built-in accessibility features:

- **Focus trap** in `ConfirmInputsModal` (Tab wraps, Escape closes, focus restored on close)
- **Focus-to-first-error** on validation failure
- **ARIA live regions** -- `<div role="status" aria-live="polite">` announces saving/saved/error
- **aria-label** on filter inputs, **aria-busy** on fields during save
- **Wizard step announcements** for screen readers ("Step 2 of 4: Details")

## Draft Persistence

Auto-save form state to localStorage and recover after page refresh:

```tsx
import { useDraftPersistence, useBeforeUnload } from "@form-engine/core";

const { hasDraft, clearDraft } = useDraftPersistence({
  formId: "my-form-123",
  data: formValues,
  saveIntervalMs: 5000,
  enabled: isDirty,
  storageKeyPrefix: "myApp",
});

// Browser warning on page leave
useBeforeUnload(isDirty, "You have unsaved changes.");
```

Includes `serializeFormState` / `deserializeFormState` utilities for Date-safe JSON round-trips.

## Theming & Customization

### Render Props

Customize field chrome via render props on `FieldWrapper`:

```tsx
<FieldWrapper
  renderLabel={(label, required) => <CustomLabel text={label} required={required} />}
  renderError={(error) => <CustomError message={error} />}
  renderStatus={(status) => <CustomStatus type={status} />}
/>
```

### CSS Custom Properties

Import the optional `styles.css` and override CSS custom properties:

```css
:root {
  --fe-error-color: #d32f2f;
  --fe-warning-color: #ed6c02;
  --fe-saving-color: #0288d1;
  --fe-label-color: #333;
  --fe-required-color: #d32f2f;
  --fe-border-radius: 4px;
  --fe-field-gap: 12px;
  --fe-font-size: 14px;
}
```

### Form-Level Errors

Display a form-level error banner for cross-field validation:

```tsx
<FormEngine
  formErrors={["End date must be after start date"]}
  /* ... */
/>
```

## Analytics & Telemetry

Opt-in form lifecycle tracking via `IAnalyticsCallbacks` in form settings:

```tsx
const formConfig: IFormConfig = {
  version: 2,
  fields: { /* ... */ },
  settings: {
    analytics: {
      onFieldFocus: (fieldName) => telemetry.track("focus", { fieldName }),
      onFieldBlur: (fieldName, timeSpentMs) => telemetry.track("blur", { fieldName, timeSpentMs }),
      onFieldChange: (fieldName, oldValue, newValue) => telemetry.track("change", { fieldName }),
      onValidationError: (fieldName, errors) => telemetry.track("validation_error", { fieldName, errors }),
      onFormSubmit: (values, durationMs) => telemetry.track("submit", { durationMs }),
      onFormAbandonment: (filledFields, emptyRequired) => telemetry.track("abandoned", { filledFields }),
      onWizardStepChange: (fromStep, toStep) => telemetry.track("step", { fromStep, toStep }),
      onRuleTriggered: (event) => telemetry.track("rule", event),
    },
  },
};
```

All callbacks are optional. Zero overhead when not provided. See [docs/analytics-telemetry.md](https://github.com/bghcore/form-engine/blob/main/docs/analytics-telemetry.md).

## DevTools

Collapsible dev-only panel with 7 tabs: **Rules**, **Values**, **Errors**, **Graph**, **Perf**, **Deps**, **Timeline**.

```tsx
import { FormDevTools } from "@form-engine/core";

<FormDevTools
  configName="myForm"
  formState={rulesState}
  formValues={formValues}
  formErrors={formErrors}
  dirtyFields={dirtyFields}
  enabled={process.env.NODE_ENV === "development"}
/>
```

| Tab | Shows |
|-----|-------|
| Rules | Per-field runtime state (type, required, hidden, readOnly, active rules) |
| Values | Live form values as JSON |
| Errors | Current validation errors |
| Graph | Dependency graph as text |
| Perf | Per-field render counts, hot field detection via `RenderTracker` |
| Deps | Dependency adjacency table, color-coded by effect type, cycle detection |
| Timeline | Chronological event log via `EventTimeline`, filterable by field name |

See [docs/performance-debugging.md](https://github.com/bghcore/form-engine/blob/main/docs/performance-debugging.md).

## JSON Schema Import

Convert JSON Schema to field configs:

```tsx
import { jsonSchemaToFieldConfig } from "@form-engine/core";

const fieldConfigs = jsonSchemaToFieldConfig({
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    age: { type: "number", minimum: 0 },
    role: { type: "string", enum: ["admin", "user"] },
  },
  required: ["name"],
});
```

Maps JSON Schema types, enums, formats, and required fields to `Dictionary<IFieldConfig>`.

## Zod Schema Import

Convert Zod object schemas to field configs without adding zod as a dependency. The adapter inspects Zod's internal type structure at runtime.

```tsx
import { zodSchemaToFieldConfig } from "@form-engine/core";
import { z } from "zod";

const UserSchema = z.object({
  name: z.string().min(1),
  age: z.number().min(0),
  active: z.boolean(),
  role: z.enum(["admin", "user", "guest"]),
  email: z.string().email(),
  startDate: z.date(),
  tags: z.array(z.string()),
});

const fieldConfigs = zodSchemaToFieldConfig(UserSchema);
// Maps: ZodString->Textbox, ZodNumber->Number, ZodBoolean->Toggle,
//       ZodEnum->Dropdown, ZodDate->DateControl, ZodArray->Multiselect
// Detects .email() and .url() checks for automatic validation
```

No `zod` peer dependency is required. If you do not use Zod, this function is tree-shaken out of your bundle.

## Type-Safe Field Configs

Use `defineFieldConfigs()` to get compile-time verification that dependency targets reference real field names:

```tsx
import { defineFieldConfigs } from "@form-engine/core";

const configs = defineFieldConfigs({
  name: { type: "Textbox", label: "Name", required: true },
  status: {
    type: "Dropdown",
    label: "Status",
    options: [
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
    ],
    rules: [
      {
        when: { field: "status", is: "Active" },
        then: {
          name: { required: true },  // TypeScript verifies "name" exists
          // typo: { required: true },  // ERROR: "typo" is not a field name
        },
      },
    ],
  },
});
```

This is a zero-cost utility -- at runtime it just returns the input object unchanged. The value is purely at compile time.

## JSON Schema for IDE Autocompletion

The package ships JSON Schema files for `IFieldConfig` and `IWizardConfig` at `schemas/field-config.schema.json` and `schemas/wizard-config.schema.json`. Reference them in your JSON config files for IDE autocompletion:

```json
{
  "$schema": "node_modules/@form-engine/core/schemas/field-config.schema.json"
}
```

## Lazy Field Registry

Load field components on demand using `React.lazy()` for smaller initial bundles:

```tsx
import { createLazyFieldRegistry } from "@form-engine/core";

const lazyFields = createLazyFieldRegistry({
  Textbox: () => import("./fields/HookTextbox"),
  Dropdown: () => import("./fields/HookDropdown"),
});

setInjectedFields(lazyFields);
```

## Architecture

```
<RulesEngineProvider>            -- Owns rule state via useReducer (memoized)
  <InjectedFieldProvider>        -- Component injection registry (memoized)
    <FormEngine>                -- Form state (react-hook-form), auto-save with retry, business rules
      <FormFields>               -- Renders ordered field list
        <FormErrorBoundary>      -- Per-field error boundary (crash isolation)
          <RenderField>          -- Per-field: Controller + component lookup (useMemo)
            <FieldWrapper>       -- Label, error, saving status (React.memo, render props)
              <InjectedField />  -- Your UI component via cloneElement
```

## SSR / Next.js

All core components are SSR-safe with proper `typeof window` guards. See [docs/ssr-guide.md](https://github.com/bghcore/form-engine/blob/main/docs/ssr-guide.md) for Next.js App Router and Pages Router integration guides.

## Building a Custom UI Adapter

See [docs/creating-an-adapter.md](https://github.com/bghcore/form-engine/blob/main/docs/creating-an-adapter.md) for a complete guide.

## License

MIT
