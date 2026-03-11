<p align="center">
  <img src="./docs/formosaic-brand.png" alt="Formosaic" width="360">
</p>

<p align="center">
  <strong>Configuration-driven forms with a built-in rules engine</strong>
</p>

[![CI](https://github.com/bghcore/formosaic/actions/workflows/ci.yml/badge.svg)](https://github.com/bghcore/formosaic/actions/workflows/ci.yml)
[![Publish](https://github.com/bghcore/formosaic/actions/workflows/publish.yml/badge.svg)](https://github.com/bghcore/formosaic/actions/workflows/publish.yml)
[![Pages](https://github.com/bghcore/formosaic/actions/workflows/pages.yml/badge.svg)](https://github.com/bghcore/formosaic/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![npm downloads](https://img.shields.io/npm/dm/@formosaic/core.svg?label=npm%20downloads)](https://www.npmjs.com/package/@formosaic/core)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/@formosaic/core?label=core%20gzip)](https://bundlephobia.com/package/@formosaic/core)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19-61dafb.svg?logo=react)](https://react.dev/)
[![Tests](https://img.shields.io/badge/tests-6%2C296%20passing-brightgreen.svg)](https://github.com/bghcore/formosaic/actions/workflows/ci.yml)
[![Storybook](https://img.shields.io/badge/storybook-deployed-ff4785.svg?logo=storybook)](https://bghcore.github.io/formosaic/storybook/)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/bghcore/formosaic/badge)](https://scorecard.dev/viewer/?uri=github.com/bghcore/formosaic)
[![CodeQL](https://github.com/bghcore/formosaic/actions/workflows/codeql.yml/badge.svg)](https://github.com/bghcore/formosaic/actions/workflows/codeql.yml)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/bghcore/formosaic/pulls)

[![npm core](https://img.shields.io/npm/v/@formosaic/core?label=core)](https://www.npmjs.com/package/@formosaic/core)
[![npm fluent](https://img.shields.io/npm/v/@formosaic/fluent?label=fluent)](https://www.npmjs.com/package/@formosaic/fluent)
[![npm mui](https://img.shields.io/npm/v/@formosaic/mui?label=mui)](https://www.npmjs.com/package/@formosaic/mui)
[![npm headless](https://img.shields.io/npm/v/@formosaic/headless?label=headless)](https://www.npmjs.com/package/@formosaic/headless)
[![npm antd](https://img.shields.io/npm/v/@formosaic/antd?label=antd)](https://www.npmjs.com/package/@formosaic/antd)
[![npm chakra](https://img.shields.io/npm/v/@formosaic/chakra?label=chakra)](https://www.npmjs.com/package/@formosaic/chakra)
[![npm mantine](https://img.shields.io/npm/v/@formosaic/mantine?label=mantine)](https://www.npmjs.com/package/@formosaic/mantine)
[![npm radix](https://img.shields.io/npm/v/@formosaic/radix?label=radix)](https://www.npmjs.com/package/@formosaic/radix)
[![npm react-aria](https://img.shields.io/npm/v/@formosaic/react-aria?label=react-aria)](https://www.npmjs.com/package/@formosaic/react-aria)
[![npm designer](https://img.shields.io/npm/v/@formosaic/designer?label=designer)](https://www.npmjs.com/package/@formosaic/designer)

[Storybook](https://bghcore.github.io/formosaic/storybook/) | [Designer Demo](https://bghcore.github.io/formosaic/designer/) | [npm](https://www.npmjs.com/org/formosaic)

A React library for rendering complex, configuration-driven forms with a built-in rules engine. Define your forms as a single `IFormConfig` JSON object -- field definitions, declarative rules with rich conditions, validation, ordering -- and the library handles rendering, validation, auto-save, and field interactions automatically.

## When to Use This Library

**Use this if you need:**
- Forms defined as JSON/config objects, not JSX -- field types, labels, validations, and rules declared as data
- A rules engine where field A changing to value X makes field B required, field C hidden, and field D's dropdown options change -- all declared, not coded
- Multi-step wizards with conditional step visibility and cross-step rules
- Auto-save with debounce, retry, and abort -- not just "submit on click"
- To swap UI libraries (Fluent UI, MUI, headless HTML, custom) without rewriting form logic
- A visual drag-and-drop form builder for non-technical users

**Don't use this if you need:**
- Simple forms with 3-5 static fields -- use react-hook-form directly
- Pure JSON Schema rendering with no rules engine -- use [RJSF](https://github.com/rjsf-team/react-jsonschema-form) (but if you want RJSF's schema format with our rules engine, use `fromRjsfSchema()` to migrate)
- Headless form state with zero opinions -- use [TanStack Form](https://tanstack.com/form)

See [docs/comparison.md](./docs/comparison.md) for a detailed comparison with migration paths.

### Feature Comparison

| Feature | Formosaic | FormEngine.io | RJSF | TanStack Form | uniforms |
|---------|:-----------:|:-------------:|:----:|:-------------:|:--------:|
| Config-driven (JSON/data) | Yes | Yes | Yes | No | Yes |
| Declarative rules engine | Yes (20 ops) | Partial | Partial | No | No |
| UI adapter system | 11 adapters | 4 adapters | 5 themes | Headless | 6 bridges |
| Computed values | `$values`, `$fn` | MobX-based | No | No | No |
| Wizard / multi-step | Built-in | Layout-based | Add-on | Manual | No |
| Visual form builder | Yes (MIT) | Yes (paid) | No | No | No |
| AI form generation | No | ChatGPT GPT | No | No | No |
| Schema import (JSON/Zod) | Both | Proprietary | JSON Schema | No | JSON Schema |
| License | MIT (all) | MIT core / Paid builder | Apache 2.0 | MIT | MIT |
| Bundle (core) | ~114 KB | ~189 KB | ~85 KB | ~12 KB | ~45 KB |

## Packages

| Package | Description | Size |
|---------|-------------|------|
| [`@formosaic/core`](./packages/core) | UI-agnostic rules engine, form orchestration, validation, analytics, devtools. React + react-hook-form only, no UI library dependency. | ~114 KB ESM |
| [`@formosaic/fluent`](./packages/fluent) | Fluent UI v9 field components (28 field types). | ~39 KB ESM |
| [`@formosaic/mui`](./packages/mui) | Material UI field components (28 field types). | ~39 KB ESM |
| [`@formosaic/headless`](./packages/headless) | Unstyled semantic HTML field components (28 field types). | ~36 KB ESM |
| [`@formosaic/antd`](./packages/antd) | Ant Design v5 field components (28 field types). | ~24 KB ESM |
| [`@formosaic/chakra`](./packages/chakra) | Chakra UI v3 field components (28 field types). | ~24 KB ESM |
| [`@formosaic/mantine`](./packages/mantine) | Mantine v7 field components (28 field types). | ~24 KB ESM |
| [`@formosaic/atlaskit`](./packages/atlaskit) | Atlassian Design System field components (28 field types). | ~22 KB ESM |
| [`@formosaic/base-web`](./packages/base-web) | Uber Base Web field components (28 field types). | ~22 KB ESM |
| [`@formosaic/heroui`](./packages/heroui) | HeroUI field components (28 field types). | ~22 KB ESM |
| [`@formosaic/radix`](./packages/radix) | Radix UI primitives field components (28 field types). Unstyled. | ~32 KB ESM |
| [`@formosaic/react-aria`](./packages/react-aria) | React Aria Components field components (28 field types). | ~31 KB ESM |
| [`@formosaic/designer`](./packages/designer) | Visual drag-and-drop form builder with rule editor and JSON export. | ~65 KB ESM |
| [`@formosaic/examples`](./packages/examples) | 3 example apps (login+MFA, checkout wizard, data entry). | -- |

## Quick Start

```bash
# With Fluent UI
npm install @formosaic/core @formosaic/fluent

# Or with MUI
npm install @formosaic/core @formosaic/mui @mui/material @emotion/react @emotion/styled

# Or headless (no UI framework)
npm install @formosaic/core @formosaic/headless

# Or with Ant Design
npm install @formosaic/core @formosaic/antd antd dayjs

# Or with Mantine
npm install @formosaic/core @formosaic/mantine @mantine/core @mantine/hooks

# Or with Radix UI (unstyled primitives, great for Tailwind/shadcn)
npm install @formosaic/core @formosaic/radix @radix-ui/react-checkbox @radix-ui/react-radio-group @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-switch

# Or with React Aria (accessibility-first)
npm install @formosaic/core @formosaic/react-aria react-aria-components
```

```tsx
import {
  RulesEngineProvider,
  InjectedFieldProvider,
  FormEngine,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";
// Or: import { createMuiFieldRegistry } from "@formosaic/mui";
// Or: import { createHeadlessFieldRegistry } from "@formosaic/headless";

const formConfig = {
  version: 2 as const,
  fields: {
    name: { type: "Textbox", label: "Name", required: true },
    status: {
      type: "Dropdown",
      label: "Status",
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
    },
    notes: { type: "Textarea", label: "Notes" },
  },
  fieldOrder: ["name", "status", "notes"],
};

function App() {
  return (
    <RulesEngineProvider>
      <InjectedFieldProvider injectedFields={createFluentFieldRegistry()}>
        <FormEngine
          configName="myForm"
          programName="myApp"
          formConfig={formConfig}
          defaultValues={{ name: "", status: "Active", notes: "" }}
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

## How It Works

### Configuration-Driven Forms

Every form is defined by an `IFormConfig` object containing a dictionary of `IFieldConfig` entries. Each config specifies:

- **`type`** -- Which field type to render (`"Textbox"`, `"Dropdown"`, `"Toggle"`, etc.)
- **`label`** -- Display label
- **`required`** / **`hidden`** / **`readOnly`** -- Default field states
- **`rules`** -- Declarative rules with rich conditions (`when`/`then`/`else`) that change field states based on other field values
- **`options`** -- Dropdown/select options as `{ value, label }` pairs
- **`validate`** -- Validation rules referencing the unified validator registry
- **`computedValue`** -- Expressions like `"$values.qty * $values.price"` or `"$fn.calculateTotal()"`
- **`items`** -- Field array item definitions (full `IFieldConfig` per item field)
- **`config`** -- Arbitrary metadata passed through to the field component

### Business Rules Engine

Rules are **declarative** -- defined as `IRule[]` on each field config, not imperative code. Each rule has a `when` condition, a `then` effect, and an optional `else` effect.

When a field value changes, the engine:

1. Identifies transitively affected fields via the dependency graph
2. Re-evaluates rules for affected fields only (incremental evaluation)
3. Resolves conflicts via priority (higher priority rule wins)
4. Applies effects (required, hidden, readOnly, component swap, options, validation, computed value, setValue)
5. Dispatches to the rules engine reducer for React re-render

The engine includes **circular dependency detection** via Kahn's algorithm and **config validation** for dev-mode diagnostics.

**20 condition operators:** `equals`, `notEquals`, `greaterThan`, `lessThan`, `greaterThanOrEqual`, `lessThanOrEqual`, `contains`, `notContains`, `startsWith`, `endsWith`, `in`, `notIn`, `isEmpty`, `isNotEmpty`, `matches`, `arrayContains`, `arrayNotContains`, `arrayLengthEquals`, `arrayLengthGreaterThan`, `arrayLengthLessThan`

**Logical operators:** `and`, `or`, `not` (composable condition trees)

```tsx
const formConfig = {
  version: 2 as const,
  fields: {
    type: {
      type: "Dropdown",
      label: "Type",
      options: [
        { value: "bug", label: "Bug" },
        { value: "feature", label: "Feature" },
      ],
      rules: [
        {
          when: { field: "type", operator: "equals", value: "bug" },
          then: { severity: { required: true, hidden: false } },
          else: { severity: { hidden: true } },
          priority: 1,
        },
      ],
    },
    severity: {
      type: "Dropdown",
      label: "Severity",
      hidden: true,
      options: [
        { value: "low", label: "Low" },
        { value: "high", label: "High" },
      ],
    },
  },
  fieldOrder: ["type", "severity"],
};
```

#### Compound Conditions

Combine conditions with `and`, `or`, and `not`:

```tsx
rules: [
  {
    when: {
      operator: "and",
      conditions: [
        { field: "type", operator: "equals", value: "bug" },
        { field: "priority", operator: "greaterThanOrEqual", value: 3 },
      ],
    },
    then: { assignee: { required: true } },
  },
]
```

#### Computed Values

Use `computedValue` with `$values`, `$fn`, and `$parent` expressions:

```tsx
fields: {
  qty: { type: "Number", label: "Quantity" },
  price: { type: "Number", label: "Unit Price" },
  total: {
    type: "ReadOnly",
    label: "Total",
    computedValue: "$values.qty * $values.price",
  },
  createdDate: {
    type: "ReadOnly",
    label: "Created",
    computedValue: "$fn.setDate()",
  },
}
```

### Multi-Step Wizard

Split forms into wizard steps with conditional visibility and per-step validation:

```tsx
import { WizardForm } from "@formosaic/core";

const formConfig = {
  version: 2 as const,
  fields: { /* ... */ },
  wizard: {
    steps: [
      { id: "basics", title: "Basic Info", fields: ["name", "type"] },
      {
        id: "details",
        title: "Details",
        fields: ["severity", "description"],
        visibleWhen: { field: "type", operator: "equals", value: "bug" },
      },
      { id: "review", title: "Review", fields: ["notes"] },
    ],
    validateOnStepChange: true,
  },
};

<WizardForm
  wizardConfig={formConfig.wizard}
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

All fields stay in a single `react-hook-form` context. Steps control which fields are visible. Cross-step rules work automatically.

### Field Arrays (Repeating Sections)

Add "add another" patterns for addresses, line items, etc.:

```tsx
import { FieldArray } from "@formosaic/core";

<FieldArray
  fieldName="contacts"
  config={{
    items: {
      name: { type: "Textbox", label: "Name", required: true },
      email: { type: "Textbox", label: "Email", validate: [{ name: "email" }] },
    },
    minItems: 1,
    maxItems: 5,
    defaultItem: { name: "", email: "" },
  }}
  renderItem={(fieldNames, index, remove) => (
    <div key={index}>
      {/* fieldNames = ["contacts.0.name", "contacts.0.email"] */}
      <FieldRenderer fields={fieldNames} />
      <button onClick={remove}>Remove</button>
    </div>
  )}
  renderAddButton={(append, canAdd) => (
    <button onClick={append} disabled={!canAdd}>Add Contact</button>
  )}
/>
```

### Component Injection

The library uses a component injection system for field rendering. Core provides the orchestration, and UI packages provide the field implementations:

```tsx
// Use built-in Fluent UI fields
import { createFluentFieldRegistry } from "@formosaic/fluent";

// Or use MUI fields (swap with one line)
import { createMuiFieldRegistry } from "@formosaic/mui";

// Or use headless semantic HTML fields
import { createHeadlessFieldRegistry } from "@formosaic/headless";

// Pass via the injectedFields prop
<InjectedFieldProvider injectedFields={createFluentFieldRegistry()}>

// Or mix in custom fields
<InjectedFieldProvider injectedFields={{
  ...createFluentFieldRegistry(),
  MyCustomField: <MyCustomField />,
}}>
```

### Pluggable Validation

14 built-in validators plus support for custom sync, async, and cross-field validators via the unified `registerValidators()` API:

```tsx
import {
  registerValidators,
  createMinLengthValidation,
  createPatternValidation,
} from "@formosaic/core";

// Register built-in factory validators
registerValidators({
  MinLength5: createMinLengthValidation(5),
  AlphaOnly: createPatternValidation(/^[a-zA-Z]+$/, "Letters only"),
});

// Add async validators (e.g., server-side uniqueness check)
registerValidators({
  CheckUniqueEmail: async (value, entityData, signal) => {
    const response = await fetch(`/api/check-email?email=${value}`, { signal });
    const { exists } = await response.json();
    return exists ? "Email already in use" : undefined;
  },
});
```

Reference validators in field configs:

```tsx
fields: {
  email: {
    type: "Textbox",
    label: "Email",
    validate: [
      { name: "email" },
      { name: "CheckUniqueEmail", async: true, debounceMs: 500 },
    ],
  },
  username: {
    type: "Textbox",
    label: "Username",
    validate: [
      { name: "minLength", params: { min: 3 } },
      { name: "AlphaOnly" },
    ],
  },
}
```

Built-in validators: `EmailValidation`, `PhoneNumberValidation`, `YearValidation`, `Max150KbValidation`, `Max32KbValidation`, `isValidUrl`, `NoSpecialCharactersValidation`, `CurrencyValidation`, `UniqueInArrayValidation` + factory functions: `createMinLengthValidation`, `createMaxLengthValidation`, `createNumericRangeValidation`, `createPatternValidation`, `createRequiredIfValidation`

Use `registerValidatorMetadata()` to attach human-readable metadata (label, description, parameter schema) to validators for use in the visual form designer's RuleBuilder UI:

```tsx
import { registerValidatorMetadata } from "@formosaic/core";

registerValidatorMetadata("CheckUniqueEmail", {
  label: "Unique Email",
  description: "Checks that the email address is not already in use",
});
```

### i18n / Localization

All user-facing strings are localizable:

```tsx
import { registerLocale } from "@formosaic/core";

registerLocale({
  required: "Obligatoire",
  save: "Sauvegarder",
  cancel: "Annuler",
  saving: "Sauvegarde en cours...",
  invalidEmail: "Adresse e-mail invalide",
  // Partial registration -- unspecified keys fall back to English
});
```

### Analytics and Telemetry

Track form lifecycle events via `IAnalyticsCallbacks` in form settings:

```tsx
const formConfig: IFormConfig = {
  version: 2,
  fields: { /* ... */ },
  settings: {
    analytics: {
      onFieldFocus: (fieldName) => console.log("Focus:", fieldName),
      onFieldBlur: (fieldName, timeSpentMs) => console.log("Blur:", fieldName, timeSpentMs),
      onFieldChange: (fieldName, oldValue, newValue) => console.log("Change:", fieldName),
      onValidationError: (fieldName, errors) => console.log("Validation:", fieldName, errors),
      onFormSubmit: (values, durationMs) => console.log("Submit:", durationMs, "ms"),
      onFormAbandonment: (filledFields, emptyRequired) => console.log("Abandoned:", emptyRequired),
      onWizardStepChange: (from, to) => console.log("Step:", from, "->", to),
      onRuleTriggered: (event) => console.log("Rule:", event),
    },
  },
};
```

The `useFormAnalytics` hook wraps these callbacks into stable, memoized functions with automatic timing (field focus duration, form completion time).

### FormDevTools

A collapsible dev-only panel with 7 tabs for debugging form state at runtime:

| Tab | Description |
|-----|-------------|
| **Rules** | Current runtime state of every field (type, required, hidden, readOnly, active rules) |
| **Values** | Live JSON dump of all form values |
| **Errors** | Current validation errors |
| **Graph** | Text representation of the dependency graph |
| **Perf** | Per-field render counts, hot field detection, total form renders (via `RenderTracker`) |
| **Deps** | Sortable dependency table with effect types, cycle detection |
| **Timeline** | Chronological event log with filtering (via `EventTimeline`) |

```tsx
import { FormDevTools } from "@formosaic/core";

<FormDevTools
  configName="myForm"
  formState={runtimeFormState}
  formValues={formValues}
  formErrors={formErrors}
  dirtyFields={dirtyFields}
  enabled={process.env.NODE_ENV === "development"}
/>
```

### Config Validation (Dev Mode)

Catch configuration errors early:

```tsx
import { validateFieldConfigs } from "@formosaic/core";

const errors = validateFieldConfigs(fieldConfigs, registeredComponentTypes);
// Returns: missing dependency targets, unregistered components,
// unregistered validators, circular dependencies, missing dropdown options
```

### Error Boundary

Each field is individually wrapped in a `FormErrorBoundary` so a single field crash does not take down the entire form:

```tsx
import { FormErrorBoundary } from "@formosaic/core";

<FormErrorBoundary
  fallback={(error, resetErrorBoundary) => (
    <div>
      <p>Field failed to render: {error.message}</p>
      <button onClick={resetErrorBoundary}>Retry</button>
    </div>
  )}
  onError={(error, errorInfo) => console.error("Field error:", error)}
>
  <MyField />
</FormErrorBoundary>
```

This is built into the core rendering pipeline -- you do not need to add it yourself unless you want custom error handling.

### Manual Save vs Auto-Save

By default, forms auto-save on every field change (debounced). Set `isManualSave={true}` for explicit save control:

```tsx
// Auto-save (default) -- saves on every field change with debounce
<FormEngine
  configName="myForm"
  formConfig={formConfig}
  defaultValues={defaultValues}
  saveData={async (data) => { await api.save(data); return data; }}
/>

// Manual save -- shows Save/Cancel buttons, no auto-save
<FormEngine
  configName="myForm"
  formConfig={formConfig}
  defaultValues={defaultValues}
  isManualSave={true}
  saveData={async (data) => { await api.save(data); return data; }}
/>

// Manual save with custom button
<FormEngine
  isManualSave={true}
  renderSaveButton={({ onSave, isDirty, isSubmitting }) => (
    <button onClick={onSave} disabled={!isDirty || isSubmitting}>
      Save Changes
    </button>
  )}
  // ... other props
/>
```

### Save Reliability

FormEngine includes robust save handling:

- **AbortController** cancels previous in-flight saves when a new save is triggered
- **Configurable timeout** via `saveTimeoutMs` prop (default 30 seconds)
- **Retry with exponential backoff** via `maxSaveRetries` prop (default 3 retries)

```tsx
<FormEngine
  saveTimeoutMs={15000}   // 15 second timeout
  maxSaveRetries={5}      // Retry up to 5 times with exponential backoff
  saveData={async (data) => { /* ... */ }}
/>
```

### Accessibility

Built-in accessibility features:

- **Focus trap** in `ConfirmInputsModal` -- Tab key wraps within modal, Escape closes, focus restored on close
- **Focus-to-first-error** on validation failure -- automatically focuses the first field with an error
- **ARIA live regions** -- `<div role="status" aria-live="polite">` announces saving/saved/error status to screen readers
- **aria-label** on filter inputs, **aria-busy** on fields during save
- **Wizard step announcements** -- screen readers announce "Step 2 of 4: Details" on navigation

### Draft Persistence

Auto-save form state to localStorage for recovery after accidental page closures:

```tsx
import { useDraftPersistence, useBeforeUnload } from "@formosaic/core";

function MyForm() {
  const { isDirty, formValues } = useFormState();

  // Auto-save drafts to localStorage every 5 seconds
  const { hasDraft, clearDraft } = useDraftPersistence({
    formId: "my-form-123",
    data: formValues,
    saveIntervalMs: 5000,
    enabled: isDirty,
    storageKeyPrefix: "myApp",
  });

  // Warn user before leaving page with unsaved changes
  useBeforeUnload(isDirty, "You have unsaved changes.");

  return <FormEngine /* ... */ />;
}
```

Includes `serializeFormState` / `deserializeFormState` utilities for Date-safe JSON round-trips.

### Theming and Customization

Customize field chrome without replacing components:

```tsx
// Render props on FieldWrapper
<FieldWrapper
  renderLabel={(label, required) => <MyCustomLabel text={label} isRequired={required} />}
  renderError={(error) => <MyCustomError message={error} />}
  renderStatus={(status) => <MyCustomStatus type={status} />}
/>
```

CSS custom properties for global theming (import optional `styles.css`):

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

Form-level error banner via `formErrors` prop on `FormEngine`:

```tsx
<FormEngine
  formErrors={["End date must be after start date"]}
  /* ... */
/>
```

### Headless Adapter

The headless package renders all 28 field types using native HTML elements with `data-field-type` and `data-field-state` attributes for CSS targeting. No UI framework required.

```tsx
import { createHeadlessFieldRegistry } from "@formosaic/headless";
import "@formosaic/headless/styles.css"; // optional minimal styles

<InjectedFieldProvider injectedFields={createHeadlessFieldRegistry()}>
```

Style with Tailwind CSS, your own stylesheet, or CSS custom properties:

```css
[data-field-type="Textbox"] input {
  @apply w-full rounded-md border border-gray-300 px-3 py-2 text-sm
         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200;
}

[data-field-state="error"] input {
  @apply border-red-500;
}
```

See the [headless package README](./packages/headless/README.md) for full details.

### Visual Form Builder

The designer package provides a drag-and-drop form builder that exports valid `IFormConfig` v2 JSON:

```tsx
import { DesignerProvider, FormDesigner } from "@formosaic/designer";
import "@formosaic/designer/dist/styles.css";

function Builder() {
  return (
    <DesignerProvider>
      <FormDesigner style={{ height: "100vh" }} />
    </DesignerProvider>
  );
}
```

Features: field palette, drag-and-drop canvas, property editor, rule builder (full v2 condition system), wizard configurator, live JSON preview, import/export, undo/redo.

Use `useDesigner()` to access the exported config programmatically. See the [designer package README](./packages/designer/README.md) for full details.

### SSR / Next.js

All core components are SSR-safe. Browser-only API access (`localStorage`, `document.activeElement`, `window.addEventListener`) is guarded behind `typeof` checks or confined to `useEffect` callbacks.

For Next.js App Router, add `"use client"` to files containing form components. Server-fetched data can be passed as props across the client boundary.

See the [SSR / Next.js integration guide](./docs/ssr-guide.md) for full setup instructions covering App Router, Pages Router, draft persistence, lazy loading, and common pitfalls.

### RJSF Schema Import

Migrate from [react-jsonschema-form](https://github.com/rjsf-team/react-jsonschema-form) with zero rewrite. Bring your existing `schema` + `uiSchema` + `formData` and get a full `IFormConfig` with our rules engine layered on top. JSON Schema `dependencies` and `if/then/else` are auto-converted to `IRule[]`.

```tsx
import { fromRjsfSchema } from "@formosaic/core";

// Your existing RJSF schema
const schema = {
  type: "object",
  properties: {
    name: { type: "string", title: "Name", minLength: 1 },
    age: { type: "integer", title: "Age", minimum: 0, maximum: 150 },
    role: { type: "string", enum: ["admin", "user", "guest"] },
    email: { type: "string", format: "email" },
  },
  required: ["name"],
  dependencies: {
    role: {
      oneOf: [
        {
          properties: {
            role: { const: "admin" },
            adminCode: { type: "string", title: "Admin Code" },
          },
          required: ["adminCode"],
        },
      ],
    },
  },
};

const uiSchema = {
  age: { "ui:widget": "updown" },
  email: { "ui:placeholder": "you@example.com" },
  "ui:order": ["name", "email", "role", "age", "*"],
};

// Convert to IFormConfig -- dependencies become IRule[] automatically
const formConfig = fromRjsfSchema(schema, uiSchema, existingFormData);
// formConfig.fields.adminCode has rules for conditional visibility based on role

// Use directly with FormEngine
<FormEngine formConfig={formConfig} /* ... */ />
```

Also exports `toRjsfSchema(config)` for converting back to JSON Schema + uiSchema (best-effort, structural fidelity only).

### Zod Schema Import

Convert Zod object schemas to field configs without adding zod as a dependency:

```tsx
import { zodSchemaToFieldConfig } from "@formosaic/core";
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

### Lazy Field Registry

Load field components on demand using React.lazy for bundle optimization:

```tsx
import { createLazyFieldRegistry } from "@formosaic/core";

const lazyFields = createLazyFieldRegistry({
  Textbox: () => import("./fields/HookTextbox"),
  Dropdown: () => import("./fields/HookDropdown"),
  // Components are loaded only when first rendered
});

<InjectedFieldProvider injectedFields={lazyFields}>
```

## Available Field Types

All 28 field types (22 editable + 6 read-only) are available in the Fluent UI, MUI, and headless adapters:

### Editable Fields

| Component Key | Description |
|---------------|-------------|
| `Textbox` | Single-line text input |
| `Number` | Numeric input with validation |
| `Toggle` | Boolean toggle switch |
| `Dropdown` | Single-select dropdown |
| `Multiselect` | Multi-select dropdown |
| `DateControl` | Date picker with clear button |
| `Slider` | Numeric slider |
| `SimpleDropdown` | Dropdown from string array in config |
| `MultiSelectSearch` | Searchable multi-select |
| `Textarea` | Multiline text with expand-to-modal |
| `DocumentLinks` | URL link CRUD |
| `StatusDropdown` | Dropdown with color status indicator |
| `DynamicFragment` | Hidden field (form state only) |
| `FieldArray` | Repeating section (add/remove items) |
| `RadioGroup` | Single-select radio button group |
| `CheckboxGroup` | Multi-select checkbox group (value: `string[]`) |
| `Rating` | Star rating input (value: `number`; configurable `max`, `allowHalf`) |
| `ColorPicker` | Native color picker returning hex string |
| `Autocomplete` | Searchable single-select with type-ahead |
| `FileUpload` | File picker (single or multiple); validates size via `config.maxSizeMb` |
| `DateRange` | Two date inputs (From / To); value: `{ start, end }` ISO strings |
| `DateTime` | Combined date+time input; value: ISO datetime-local string |
| `PhoneInput` | Phone input with inline masking (`us`, `international`, `raw` formats) |

### Read-Only Fields

| Component Key | Description |
|---------------|-------------|
| `ReadOnly` | Plain text display |
| `ReadOnlyArray` | Array of strings |
| `ReadOnlyDateTime` | Formatted date/time |
| `ReadOnlyCumulativeNumber` | Computed sum of other fields |
| `ReadOnlyRichText` | Rendered HTML |
| `ReadOnlyWithButton` | Text with action button |

## Architecture

Form-engine separates **what** a form contains (the `IFormConfig` JSON object) from **how** it renders (UI adapter packages). The core package owns form state (via react-hook-form), evaluates declarative rules to compute field visibility/required/readOnly state, and delegates rendering to pluggable field components registered through the component injection system. This means you can swap your entire UI layer -- from Fluent UI to MUI to headless HTML -- by changing one import.

```
<RulesEngineProvider>           -- Owns rule state via useReducer (memoized)
  <InjectedFieldProvider>       -- Component injection registry (memoized)
    <FormEngine>               -- Form state (react-hook-form), auto-save with retry, rules
      <FormFields>              -- Renders ordered field list
        <FormErrorBoundary>     -- Per-field error boundary (crash isolation)
          <RenderField>         -- Per-field: Controller + component lookup (useMemo)
            <FieldWrapper>      -- Label, error, saving status (React.memo, render props)
              <InjectedField /> -- Your UI component via cloneElement
```

## Building a Custom UI Adapter

See [docs/creating-an-adapter.md](./docs/creating-an-adapter.md) for a complete guide. The short version:

1. Create field components that accept `IFieldProps<T>`
2. Build a registry mapping `ComponentTypes` to your field elements
3. Pass the registry via the `injectedFields` prop on `InjectedFieldProvider`

## Development

```bash
# Install dependencies
npm install --legacy-peer-deps

# Build all packages
npm run build

# Build individual packages
npm run build:core
npm run build:fluent
npm run build:mui
npm run build:headless
npm run build:antd     # Build Ant Design package only
npm run build:chakra   # Build Chakra UI package only
npm run build:mantine  # Build Mantine package only
npm run build:atlaskit # Build Atlaskit package only
npm run build:base-web # Build Base Web package only
npm run build:heroui     # Build HeroUI package only
npm run build:radix      # Build Radix package only
npm run build:react-aria # Build React Aria package only

# Run tests
npm run test
npm run test:watch
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run benchmarks
npm run bench

# Storybook
npm run storybook
npm run build-storybook

# Clean build output
npm run clean
```

## Project Structure

```
packages/
  core/       -- @formosaic/core (React + react-hook-form only)
  fluent/     -- @formosaic/fluent (Fluent UI v9 adapter, 28 field types)
  mui/        -- @formosaic/mui (Material UI adapter, 28 field types)
  headless/   -- @formosaic/headless (semantic HTML adapter, 28 field types)
  antd/       -- @formosaic/antd (Ant Design v5 adapter, 28 field types)
  chakra/     -- @formosaic/chakra (Chakra UI v3 adapter, 28 field types)
  mantine/    -- @formosaic/mantine (Mantine v7 adapter, 28 field types)
  atlaskit/   -- @formosaic/atlaskit (Atlassian Design System adapter, 28 field types)
  base-web/   -- @formosaic/base-web (Uber Base Web adapter, 28 field types)
  heroui/     -- @formosaic/heroui (HeroUI adapter, 28 field types)
  radix/      -- @formosaic/radix (Radix UI primitives adapter, 28 field types)
  react-aria/ -- @formosaic/react-aria (React Aria Components adapter, 28 field types)
  designer/   -- @formosaic/designer (visual form builder)
  examples/   -- 3 example apps (login+MFA, checkout wizard, data entry)
e2e/          -- Playwright end-to-end tests
benchmarks/   -- Vitest benchmarks for rules engine performance
stories/      -- Storybook stories for field components
docs/
  choosing-an-adapter.md      -- Adapter recommendation guide
  creating-an-adapter.md      -- Guide for building custom UI adapters
  adapter-architecture.md     -- Adapter classification and architecture
  canonical-field-contracts.md -- Canonical field behavior contracts
  parity-matrix.md            -- Field implementation matrix across all adapters
  divergence-register.md      -- Cross-adapter divergence register
  api-stability.md            -- Public API stability classification
  tier2-handoff.md            -- Tier 2 planning (feasibility, waves, go/no-go)
  tier1-patterns.md           -- Implementation patterns for Tier 2
  shadcn-integration.md       -- shadcn/ui integration guide
  ssr-guide.md                -- SSR / Next.js integration guide
  ACCESSIBILITY.md            -- Accessibility documentation
```

## License

MIT
