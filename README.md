# Dynamic React Business Forms

[![npm core](https://img.shields.io/npm/v/@bghcore/dynamic-forms-core?label=core)](https://www.npmjs.com/package/@bghcore/dynamic-forms-core)
[![npm fluent](https://img.shields.io/npm/v/@bghcore/dynamic-forms-fluent?label=fluent)](https://www.npmjs.com/package/@bghcore/dynamic-forms-fluent)
[![npm mui](https://img.shields.io/npm/v/@bghcore/dynamic-forms-mui?label=mui)](https://www.npmjs.com/package/@bghcore/dynamic-forms-mui)
[![npm headless](https://img.shields.io/npm/v/@bghcore/dynamic-forms-headless?label=headless)](https://www.npmjs.com/package/@bghcore/dynamic-forms-headless)
[![npm designer](https://img.shields.io/npm/v/@bghcore/dynamic-forms-designer?label=designer)](https://www.npmjs.com/package/@bghcore/dynamic-forms-designer)
[![CI](https://github.com/bghcore/dynamic-react-business-forms/actions/workflows/ci.yml/badge.svg)](https://github.com/bghcore/dynamic-react-business-forms/actions/workflows/ci.yml)

[Storybook](https://bghcore.github.io/dynamic-react-business-forms/storybook/) | [Designer Demo](https://bghcore.github.io/dynamic-react-business-forms/designer/) | [npm](https://www.npmjs.com/org/bghcore)

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
- JSON Schema compliance -- use [RJSF](https://github.com/rjsf-team/react-jsonschema-form)
- Headless form state with zero opinions -- use [TanStack Form](https://tanstack.com/form)

## Packages

| Package | Description | Size |
|---------|-------------|------|
| [`@bghcore/dynamic-forms-core`](./packages/core) | UI-agnostic rules engine, form orchestration, validation, analytics, devtools. React + react-hook-form only, no UI library dependency. | ~114 KB ESM |
| [`@bghcore/dynamic-forms-fluent`](./packages/fluent) | Fluent UI v9 field components (19 field types). | ~39 KB ESM |
| [`@bghcore/dynamic-forms-mui`](./packages/mui) | Material UI field components (19 field types). | ~39 KB ESM |
| [`@bghcore/dynamic-forms-headless`](./packages/headless) | Unstyled semantic HTML field components (19 field types). | ~36 KB ESM |
| [`@bghcore/dynamic-forms-designer`](./packages/designer) | Visual drag-and-drop form builder with rule editor and JSON export. | ~65 KB ESM |
| [`@bghcore/dynamic-forms-examples`](./packages/examples) | 3 example apps (login+MFA, checkout wizard, data entry). | -- |

## Quick Start

```bash
# With Fluent UI
npm install @bghcore/dynamic-forms-core @bghcore/dynamic-forms-fluent

# Or with MUI
npm install @bghcore/dynamic-forms-core @bghcore/dynamic-forms-mui @mui/material @emotion/react @emotion/styled

# Or headless (no UI framework)
npm install @bghcore/dynamic-forms-core @bghcore/dynamic-forms-headless
```

```tsx
import {
  RulesEngineProvider,
  InjectedFieldProvider,
  DynamicForm,
} from "@bghcore/dynamic-forms-core";
import { createFluentFieldRegistry } from "@bghcore/dynamic-forms-fluent";
// Or: import { createMuiFieldRegistry } from "@bghcore/dynamic-forms-mui";
// Or: import { createHeadlessFieldRegistry } from "@bghcore/dynamic-forms-headless";

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
        <DynamicForm
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
4. Applies effects (required, hidden, readOnly, component swap, options, validation, computed value)
5. Dispatches to the rules engine reducer for React re-render

The engine includes **circular dependency detection** via Kahn's algorithm and **config validation** for dev-mode diagnostics.

**15 condition operators:** `equals`, `notEquals`, `greaterThan`, `lessThan`, `greaterThanOrEqual`, `lessThanOrEqual`, `contains`, `notContains`, `startsWith`, `endsWith`, `in`, `notIn`, `isEmpty`, `isNotEmpty`, `matches`

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
import { WizardForm } from "@bghcore/dynamic-forms-core";

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
import { FieldArray } from "@bghcore/dynamic-forms-core";

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
import { createFluentFieldRegistry } from "@bghcore/dynamic-forms-fluent";

// Or use MUI fields (swap with one line)
import { createMuiFieldRegistry } from "@bghcore/dynamic-forms-mui";

// Or use headless semantic HTML fields
import { createHeadlessFieldRegistry } from "@bghcore/dynamic-forms-headless";

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
} from "@bghcore/dynamic-forms-core";

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

### i18n / Localization

All user-facing strings are localizable:

```tsx
import { registerLocale } from "@bghcore/dynamic-forms-core";

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
import { FormDevTools } from "@bghcore/dynamic-forms-core";

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
import { validateFieldConfigs } from "@bghcore/dynamic-forms-core";

const errors = validateFieldConfigs(fieldConfigs, registeredComponentTypes);
// Returns: missing dependency targets, unregistered components,
// unregistered validators, circular dependencies, missing dropdown options
```

### Error Boundary

Each field is individually wrapped in a `FormErrorBoundary` so a single field crash does not take down the entire form:

```tsx
import { FormErrorBoundary } from "@bghcore/dynamic-forms-core";

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
<DynamicForm
  configName="myForm"
  formConfig={formConfig}
  defaultValues={defaultValues}
  saveData={async (data) => { await api.save(data); return data; }}
/>

// Manual save -- shows Save/Cancel buttons, no auto-save
<DynamicForm
  configName="myForm"
  formConfig={formConfig}
  defaultValues={defaultValues}
  isManualSave={true}
  saveData={async (data) => { await api.save(data); return data; }}
/>

// Manual save with custom button
<DynamicForm
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

DynamicForm includes robust save handling:

- **AbortController** cancels previous in-flight saves when a new save is triggered
- **Configurable timeout** via `saveTimeoutMs` prop (default 30 seconds)
- **Retry with exponential backoff** via `maxSaveRetries` prop (default 3 retries)

```tsx
<DynamicForm
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
import { useDraftPersistence, useBeforeUnload } from "@bghcore/dynamic-forms-core";

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

  return <DynamicForm /* ... */ />;
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
  --hook-form-error-color: #d32f2f;
  --hook-form-warning-color: #ed6c02;
  --hook-form-saving-color: #0288d1;
  --hook-form-label-color: #333;
  --hook-form-required-color: #d32f2f;
  --hook-form-border-radius: 4px;
  --hook-form-field-gap: 12px;
  --hook-form-font-size: 14px;
}
```

Form-level error banner via `formErrors` prop on `DynamicForm`:

```tsx
<DynamicForm
  formErrors={["End date must be after start date"]}
  /* ... */
/>
```

### Headless Adapter

The headless package renders all 19 field types using native HTML elements with `data-field-type` and `data-field-state` attributes for CSS targeting. No UI framework required.

```tsx
import { createHeadlessFieldRegistry } from "@bghcore/dynamic-forms-headless";
import "@bghcore/dynamic-forms-headless/styles.css"; // optional minimal styles

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
import { DesignerProvider, FormDesigner } from "@bghcore/dynamic-forms-designer";
import "@bghcore/dynamic-forms-designer/dist/styles.css";

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

### JSON Schema Import

Convert JSON Schema to field configs for rapid prototyping or schema-driven forms:

```tsx
import { jsonSchemaToFieldConfig } from "@bghcore/dynamic-forms-core";

const fieldConfigs = jsonSchemaToFieldConfig({
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    age: { type: "number", minimum: 0 },
    role: { type: "string", enum: ["admin", "user", "guest"] },
  },
  required: ["name"],
});
// Result: Dictionary<IFieldConfig> with Textbox, Number, and Dropdown fields
```

### Zod Schema Import

Convert Zod object schemas to field configs without adding zod as a dependency:

```tsx
import { zodSchemaToFieldConfig } from "@bghcore/dynamic-forms-core";
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
import { createLazyFieldRegistry } from "@bghcore/dynamic-forms-core";

const lazyFields = createLazyFieldRegistry({
  Textbox: () => import("./fields/HookTextbox"),
  Dropdown: () => import("./fields/HookDropdown"),
  // Components are loaded only when first rendered
});

<InjectedFieldProvider injectedFields={lazyFields}>
```

## Available Field Types

All 19 field types are available in the Fluent UI, MUI, and headless adapters:

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

```
<RulesEngineProvider>           -- Owns rule state via useReducer (memoized)
  <InjectedFieldProvider>       -- Component injection registry (memoized)
    <DynamicForm>               -- Form state (react-hook-form), auto-save with retry, rules
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
  core/       -- @bghcore/dynamic-forms-core (React + react-hook-form only)
  fluent/     -- @bghcore/dynamic-forms-fluent (Fluent UI v9 adapter)
  mui/        -- @bghcore/dynamic-forms-mui (Material UI adapter)
  headless/   -- @bghcore/dynamic-forms-headless (semantic HTML adapter)
  designer/   -- @bghcore/dynamic-forms-designer (visual form builder)
  examples/   -- 3 example apps (login+MFA, checkout wizard, data entry)
e2e/          -- Playwright end-to-end tests
benchmarks/   -- Vitest benchmarks for rules engine performance
stories/      -- Storybook stories for field components
docs/
  creating-an-adapter.md   -- Guide for building custom UI adapters
  ssr-guide.md             -- SSR / Next.js integration guide
  ACCESSIBILITY.md         -- Accessibility documentation
```

## License

MIT
