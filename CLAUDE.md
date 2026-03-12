# Formosaic

## Project Overview

A React library for rendering complex, configuration-driven forms with a built-in rules engine. Forms are defined as a single `IFormConfig` JSON object (field definitions, rules with rich conditions, validation, ordering) and the library handles rendering, validation, auto-save, and field interactions automatically.

Published as thirteen npm packages:
- `@formosaic/core` -- UI-library agnostic rules engine and form orchestration (React + react-hook-form only)
- `@formosaic/fluent` -- Fluent UI v9 field component implementations
- `@formosaic/mui` -- Material UI (MUI) field component implementations
- `@formosaic/headless` -- Unstyled semantic HTML field implementations (no UI framework dependency)
- `@formosaic/antd` -- Ant Design v5 field component implementations
- `@formosaic/chakra` -- Chakra UI v3 field component implementations
- `@formosaic/mantine` -- Mantine v7 field component implementations
- `@formosaic/atlaskit` -- Atlassian Design System field component implementations
- `@formosaic/base-web` -- Uber Base Web field component implementations
- `@formosaic/heroui` -- HeroUI (formerly NextUI) field component implementations
- `@formosaic/radix` -- Radix UI primitives field implementations (unstyled, ideal for Tailwind/shadcn)
- `@formosaic/react-aria` -- React Aria Components field implementations (accessibility-first)
- `@formosaic/examples` -- 3 example apps (login+MFA, checkout wizard, data entry)

## Architecture

### Rendering Pipeline

```
IFormConfig (v2)
  -> Formosaic (form state via react-hook-form, save with AbortController/retry)
    -> evaluateAllRules() -> IRuntimeFormState
    -> FormFields (ordered field list)
      -> FormErrorBoundary (per-field crash isolation)
        -> RenderField (per field, useMemo for component resolution)
          -> Looks up injectedFields[type] from context
          -> Controller (react-hook-form integration, unified validation)
          -> FieldWrapper (label, error, status chrome, render props for theming)
            -> React.cloneElement(InjectedFieldComponent, IFieldProps)
```

### Provider Hierarchy

Two React context providers must wrap the form tree (both memoized via useMemo):

```
<RulesEngineProvider>          -- Owns rule state via useReducer (memoized context value)
  <InjectedFieldProvider>      -- Component injection registry (memoized context value)
    <Formosaic>               -- Entry point
```

### Rules Engine (v2)

Rules are **declarative** -- defined as `IRule[]` on each field config with rich conditions and effects.

**Condition operators (20):** equals, notEquals, greaterThan, lessThan, greaterThanOrEqual, lessThanOrEqual, contains, notContains, startsWith, endsWith, in, notIn, isEmpty, isNotEmpty, matches, arrayContains, arrayNotContains, arrayLengthEquals, arrayLengthGreaterThan, arrayLengthLessThan

**Logical operators:** and, or, not (composable condition trees)

**Lifecycle:**
1. **Init**: `IFormConfig` + entity data -> `evaluateAllRules()` -> builds dependency graph via topological sort + evaluates all rules
2. **Validate**: `validateDependencyGraph()` checks for circular/self dependencies via Kahn's algorithm
3. **Trigger**: Field value change -> `processFieldChange()`
4. **Evaluate**: `evaluateAffectedFields()` -- only re-evaluates transitively affected fields (incremental)
5. **Resolve**: Priority-based conflict resolution (higher priority rule wins)
6. **Apply**: Dispatch to reducer -> React re-render -> fields read updated `IRuntimeFieldState`

**Rule effects supported:**
- Required/Hidden/ReadOnly toggle
- Component type swap
- Validation rule replacement
- Computed value expressions ($values.field, $fn.name(), $parent.field)
- Dropdown option filtering/replacement
- Field ordering
- Cross-field effects (one rule can affect multiple fields)
- Conditional validation (validate only when condition met)
- Confirm input modal trigger

### Component Injection System

Fields are registered as a `Record<string, JSX.Element>` via `InjectedFieldProvider`. `RenderField` looks up the component by `type` string key and uses `React.cloneElement()` to pass standardized `IFieldProps`. Consumers can override any built-in field or add custom ones.

### Pluggable Registries

- `ValidationRegistry` -- Unified `ValidatorFn` for sync, async, and cross-field validation. 14 built-in validators + `registerValidators()` for custom. Per-rule `when` condition, `debounceMs`, `async` flag.
- `ValueFunctionRegistry` -- Value functions via `$fn.name()` syntax in computed expressions. `registerValueFunctions()` for custom.
- `LocaleRegistry` -- i18n support via `registerLocale()` with partial overrides and English fallback
- `formStateSerialization` -- Date-safe JSON round-trip for draft persistence
- `rjsf/` -- RJSF-compatible schema import: `fromRjsfSchema()` converts JSON Schema + uiSchema + formData to `IFormConfig` with auto-generated `IRule[]` from dependencies/if-then-else/oneOf. `toRjsfSchema()` for reverse export.
- `zodSchemaImport` -- Convert Zod schema to `Record<string, IFieldConfig>` (no zod dependency)
- `lazyFieldRegistry` -- Create field registries with React.lazy for on-demand loading

## Key Types

```typescript
interface IFormConfig {
  version: 2;
  fields: Record<string, IFieldConfig>;
  fieldOrder?: string[];
  wizard?: IWizardConfig;
  settings?: IFormSettings;
}

interface IFieldConfig {
  type: string;            // "Textbox", "Dropdown", "Toggle", etc.
  label: string;
  required?: boolean;
  hidden?: boolean;
  readOnly?: boolean;
  defaultValue?: unknown;
  computedValue?: string;  // "$values.qty * $values.price" or "$fn.setDate()"
  options?: IOption[];      // { value, label, disabled?, group?, icon?, color? }
  validate?: IValidationRule[];  // { name, params?, message?, async?, debounceMs?, when? }
  rules?: IRule[];          // { when: ICondition, then: IFieldEffect, else?, priority? }
  items?: Record<string, IFieldConfig>;  // field array items (full config)
  config?: Record<string, unknown>;      // arbitrary metadata for field component
}

type ICondition = IFieldCondition | ILogicalCondition;
// IFieldCondition: { field, operator, value? }
// ILogicalCondition: { operator: "and"|"or"|"not", conditions: ICondition[] }
```

## Key Directories

```
packages/
  core/                          -- @formosaic/core
    src/
      index.ts                   -- Public API barrel exports
      constants.ts               -- ComponentTypes, FormConstants
      strings.ts                 -- FormStrings (i18n-aware, getters over LocaleRegistry)
      components/
        InlineForm.tsx       -- Formosaic (main form component)
        InlineFormFields.tsx -- FormFields (field list rendering)
        RenderField.tsx      -- RenderField (per-field routing + Controller)
        FieldWrapper.tsx     -- FieldWrapper (label, error, status chrome)
        ConfirmInputsModal.tsx -- ConfirmInputsModal (native <dialog>, focus trap)
        WizardForm.tsx       -- WizardForm (multi-step, render props)
        FieldArray.tsx       -- FieldArray (react-hook-form useFieldArray)
        FormErrorBoundary.tsx -- FormErrorBoundary (crash isolation)
        FormDevTools.tsx     -- FormDevTools (dev panel: rules, values, errors, graph)
      helpers/
        ConditionEvaluator.ts    -- evaluateCondition (20 operators + AND/OR/NOT)
        RuleEngine.ts            -- buildDependencyGraph, evaluateAllRules, evaluateAffectedFields, topologicalSort
        InlineFormHelper.ts  -- Form init, validation, computed values, field rendering
        ValidationRegistry.ts    -- Unified ValidatorFn registry (sync+async+cross-field)
        ValueFunctionRegistry.ts -- $fn.name() value function registry
        ExpressionEngine.ts      -- $values, $fn, $parent, $root expression evaluation
        DependencyGraphValidator.ts -- Cycle/self-dependency detection (Kahn's algorithm)
        ConfigValidator.ts       -- Dev-mode config validation
        LocaleRegistry.ts        -- i18n: registerLocale(), getLocaleString(), resetLocale()
        WizardHelper.ts          -- getVisibleSteps, getStepFields, validateStepFields
        FieldHelper.ts           -- SortOptions utility
        RuleTracer.ts            -- Rule evaluation tracing/debugging
        RenderTracker.ts         -- Per-field render count tracking for DevTools Perf tab
        EventTimeline.ts         -- Chronological event log for DevTools Timeline tab
      types/
        IFormConfig.ts           -- IFormConfig, IFormSettings
        IFieldConfig.ts          -- IFieldConfig (v2 schema)
        IRule.ts                 -- IRule
        ICondition.ts            -- ICondition, IFieldCondition, ILogicalCondition
        IFieldEffect.ts          -- IFieldEffect
        IOption.ts               -- IOption (value/label)
        IValidationRule.ts       -- IValidationRule (unified)
        IFieldProps.ts           -- IFieldProps<T> (injected field component props)
        IRuntimeFieldState.ts    -- IRuntimeFieldState, IRuntimeFormState, IRulesEngineState
        IRulesEngineAction.ts    -- RulesEngineActionType, action types
        IWizardConfig.ts         -- IWizardStep, IWizardConfig (condition-based visibility)
        ILocaleStrings.ts        -- ICoreLocaleStrings (~50 keys)
        TypedFieldConfig.ts      -- defineFormConfig() type-safe builder
        IAnalyticsCallbacks.ts    -- Analytics/telemetry callback interface (8 event hooks)
        IConfirmInputModalProps.ts, IFieldToRender.ts, IFormosaicProps.ts
      providers/
        BusinessRulesProvider.tsx -- RulesEngineProvider (useReducer + memoized)
        InjectedHookFieldProvider.tsx -- InjectedFieldProvider (useMemo memoized)
      reducers/
        BusinessRulesReducer.ts  -- useReducer reducer for rules engine state
      hooks/
        useDraftPersistence.ts   -- Auto-save form state to localStorage
        useBeforeUnload.ts       -- Browser warning on unsaved changes
        useFormAnalytics.ts      -- Analytics callback wrapper hook (IFormAnalytics)
      utils/
        index.ts                 -- isEmpty, isNull, deepCopy, Dictionary, etc.
        formStateSerialization.ts -- Date-safe JSON round-trip
        rjsf/                    -- RJSF-compatible schema import/export
          types.ts               -- IJsonSchemaNode, IRjsfUiSchema, IRjsfConvertOptions
          refResolver.ts         -- $ref / definitions / $defs resolution
          fieldMapper.ts         -- JSON Schema node -> IFieldConfig, uiSchema application
          ruleConverter.ts       -- dependencies, if/then/else, oneOf/anyOf -> IRule[]
          converter.ts           -- fromRjsfSchema() orchestrator
          reverseConverter.ts    -- toRjsfSchema() export
          index.ts               -- Barrel export
        zodSchemaImport.ts       -- Zod schema -> IFieldConfig (no zod dep)
        lazyFieldRegistry.ts     -- React.lazy field loading
      styles.css                 -- Optional CSS custom properties for theming
      __tests__/                 -- Vitest tests (616 tests, 29 files)
        __fixtures__/            -- Shared test configs and entity data (v2 format)

  fluent/                        -- @formosaic/fluent
    src/
      index.ts, registry.ts, helpers.ts
      components/ (ReadOnlyText, StatusMessage, HookFormLoading, StatusDropdown/, DocumentLinks/)
      fields/ (13 editable + 6 read-only, accept IFieldProps)

  mui/                           -- @formosaic/mui
    src/
      index.ts, registry.ts, helpers.ts
      components/ (ReadOnlyText, StatusMessage, HookFormLoading)
      fields/ (13 editable + 6 read-only, accept IFieldProps, using @mui/material)

  headless/                      -- @formosaic/headless
    src/
      index.ts, registry.ts, helpers.ts
      components/ (ReadOnlyText, StatusMessage, HookFormLoading)
      fields/ (13 editable + 6 read-only, semantic HTML, data-* attributes, ARIA)
      styles.css (optional CSS custom properties)

  antd/                          -- @formosaic/antd
    src/
      index.ts, registry.ts, helpers.ts
      components/ (ReadOnlyText, StatusMessage, FormLoading)
      fields/ (22 editable + 6 read-only, Ant Design v5 components)

  chakra/                        -- @formosaic/chakra
    src/
      index.ts, registry.ts, helpers.ts
      components/ (ReadOnlyText, StatusMessage, FormLoading)
      fields/ (22 editable + 6 read-only, Chakra UI v3 + semantic HTML)

  mantine/                       -- @formosaic/mantine
    src/
      index.ts, registry.ts, helpers.ts
      components/ (ReadOnlyText, StatusMessage, FormLoading)
      fields/ (22 editable + 6 read-only, Mantine v7 components)

  atlaskit/                      -- @formosaic/atlaskit
    src/
      index.ts, registry.ts, helpers.ts
      components/ (ReadOnlyText, StatusMessage, FormLoading)
      fields/ (22 editable + 6 read-only, Atlassian Design System components)

  base-web/                      -- @formosaic/base-web
    src/
      index.ts, registry.ts, helpers.ts
      components/ (ReadOnlyText, StatusMessage, FormLoading)
      fields/ (22 editable + 6 read-only, semantic HTML for Base Web integration)

  heroui/                        -- @formosaic/heroui
    src/
      index.ts, registry.ts, helpers.ts
      components/ (ReadOnlyText, StatusMessage, FormLoading)
      fields/ (22 editable + 6 read-only, HeroUI components)

  radix/                         -- @formosaic/radix
    src/
      index.ts, registry.ts, helpers.ts
      components/ (ReadOnlyText, StatusMessage, FormLoading)
      fields/ (6 Radix UI primitives + 22 semantic HTML)

  react-aria/                    -- @formosaic/react-aria
    src/
      index.ts, registry.ts, helpers.ts
      components/ (ReadOnlyText, StatusMessage, FormLoading)
      fields/ (11 React Aria Components + 17 semantic HTML)

  examples/                      -- @formosaic/examples
    src/
      login-mfa/ (conditional MFA fields, dynamic labels)
      checkout/ (wizard, dropdown dependencies, payment branching)
      data-entry/ (field arrays, computed values, cross-field validation)

e2e/                             -- Playwright E2E tests (54 tests, 7 specs)
benchmarks/                      -- Performance benchmark suite (vitest bench)
stories/                         -- Storybook stories (64 stories + MDX docs)
website/                         -- VitePress docs site (https://bghcore.github.io/formosaic/)
  guide/
    getting-started.md           -- Quick start and setup
    comparison.md                -- Comparison vs RJSF, TanStack Form, Formik, uniforms, etc.
    migrating.md                 -- Migration guide from @form-eng/* to @formosaic/*
    rules-engine.md              -- Rules engine architecture and lifecycle
    condition-operators.md       -- All 20 condition operators reference
    expression-syntax.md         -- $values, $fn, $parent expression syntax
    validation.md                -- Built-in and custom validators reference
    value-functions.md           -- Value function registry reference
    field-types.md               -- All 28 field types reference
    field-config.md              -- IFieldConfig v2 property reference
    analytics.md                 -- Analytics and telemetry integration
    i18n.md                      -- Internationalization / localization guide
    ssr.md                       -- SSR / Next.js integration guide
    debugging-rules.md           -- Rules engine debugging guide
    performance.md               -- Performance debugging with DevTools
    accessibility.md             -- WCAG 2.1 AA compliance and ARIA guide
    date-policy.md               -- ISO 8601 date handling policy
  adapters/
    choosing.md                  -- Adapter recommendation guide
    creating.md                  -- Guide for building custom UI adapters
    architecture.md              -- Adapter classification and architecture
    parity-matrix.md             -- Field implementation matrix (Y/FB/---) across all adapters
    field-contracts.md           -- Canonical field behavior contracts (13 Tier 1 types)
    divergence-register.md       -- Cross-adapter divergence register (12 entries)
    shadcn.md                    -- shadcn/ui integration guide
  api/
    field-config.md              -- Field config API reference
    stability.md                 -- Public API stability classification
docs/                            -- Internal planning docs only
  tier1-baseline-report.md       -- Tier 1 stabilization assessment
  tier1-patterns.md              -- Implementation patterns for Tier 2
  tier2-handoff.md               -- Tier 2 planning (feasibility, waves, go/no-go)
```

## Build & Dev

```bash
npm run build            # Build all packages
npm run build:core       # Build core package only
npm run build:fluent     # Build fluent package only
npm run build:mui        # Build MUI package only
npm run build:headless   # Build headless package only
npm run build:antd       # Build Ant Design package only
npm run build:chakra     # Build Chakra UI package only
npm run build:mantine    # Build Mantine package only
npm run build:atlaskit   # Build Atlaskit package only
npm run build:base-web   # Build Base Web package only
npm run build:heroui     # Build HeroUI package only
npm run build:radix      # Build Radix package only
npm run build:react-aria # Build React Aria package only
npm run clean            # Remove all dist/ directories
npm run test             # Run all tests (vitest, 6296 tests)
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
npm run test:e2e         # Run Playwright E2E tests (54 tests)
npm run bench            # Run performance benchmarks
npm run storybook        # Start Storybook dev server
npm run build-storybook  # Build static Storybook
```

**Build output per package:** `dist/index.js` (CJS), `dist/index.mjs` (ESM), `dist/index.d.ts` (types)

**Monorepo:** npm workspaces with `packages/core`, `packages/fluent`, `packages/mui`, `packages/headless`, `packages/antd`, `packages/chakra`, `packages/mantine`, `packages/atlaskit`, `packages/base-web`, `packages/heroui`, `packages/radix`, `packages/react-aria`, `packages/examples` (13 packages)

## Tech Stack

- **React 18/19** with hooks
- **react-hook-form v7** for form state management
- **Fluent UI v9** (`@fluentui/react-components`) for UI components (fluent package)
- **MUI v5/v6** (`@mui/material`) for UI components (mui package)
- **TypeScript** with `strict: true`
- **Vitest** for testing (6296 tests across 55 files)
- **Playwright** for E2E testing (54 tests across 7 specs)
- **Storybook 10** for visual component documentation (67+ stories)
- **tsup** for bundling (CJS + ESM + .d.ts)
- **npm workspaces** for monorepo management

## Coding Conventions

- Core components: `Formosaic`, `FormFields`, `RenderField`, `FieldWrapper`, `WizardForm`, `FieldArray`
- Adapter field components: `Textbox`, `Dropdown`, `Toggle`, etc.
- Read-only variants in `fields/readonly/`: `ReadOnly`, `ReadOnlyArray`, etc.
- Interfaces use `I` prefix (e.g., `IFieldConfig`, `IRuntimeFieldState`)
- Providers export both the provider component and a `Use*Context` hook
- Field components receive `IFieldProps<T>` via `React.cloneElement`
- Rules engine actions follow Redux pattern (type enum + payload)
- All user-facing strings resolve through `LocaleRegistry` for i18n support
- Options use `{ value, label }` (not `{ key, text }`)
- Field config uses `type` (not `component`), `options` (not `dropdownOptions`), `config` (not `meta`), `validate` (not `validations`)
