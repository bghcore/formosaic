# AGENTS.md -- @formosaic/core

## Package Purpose

UI-library agnostic React library for rendering configuration-driven forms with a built-in rules engine. This package has **zero UI library dependencies** -- it depends only on React and react-hook-form. It is NOT "framework agnostic" (it is built for React); it is "UI-library agnostic" meaning it does not depend on any specific component library (Fluent UI, MUI, Ant Design, etc.).

## Critical Constraints

- **No UI library imports allowed.** No `@fluentui/*`, no `@mui/*`, no CSS-in-JS libraries. Plain HTML only for any visual elements (see `FieldWrapper.tsx`).
- **`strict: true`** in tsconfig.
- **Use `React.JSX.Element`** not bare `JSX.Element` for return types.
- **Use `structuredClone`** for deep copies, not `JSON.parse(JSON.stringify(...))` or lodash.

## Architecture

```
RulesEngineProvider (useReducer for rules engine state)
  -> InjectedFieldProvider (component registry)
    -> Formosaic (react-hook-form, auto-save, rules engine init)
      -> FormFields (ordered field list)
        -> FormErrorBoundary (per-field crash isolation)
          -> RenderField (Controller + component injection lookup)
            -> FieldWrapper (label, error, status chrome -- plain HTML)
              -> React.cloneElement(injectedField, IFieldProps)
```

## Key Files

| File | Purpose |
|------|---------|
| `src/helpers/RuleEngine.ts` | Core rules engine (~800 lines, largest file). Builds dependency graph via topological sort, evaluates all rules, evaluates affected fields incrementally, priority-based conflict resolution. Exports `buildDependencyGraph`, `evaluateAllRules`, `evaluateAffectedFields`, `processFieldChange`, `topologicalSort`. |
| `src/helpers/ConditionEvaluator.ts` | Evaluates rule conditions. 20 operators (equals, notEquals, greaterThan, lessThan, greaterThanOrEqual, lessThanOrEqual, contains, notContains, startsWith, endsWith, in, notIn, isEmpty, isNotEmpty, matches, arrayContains, arrayNotContains, arrayLengthEquals, arrayLengthGreaterThan, arrayLengthLessThan) + AND/OR/NOT logical composition. Exports `evaluateCondition`. |
| `src/helpers/FormosaicHelper.ts` | Form initialization, validation execution, value functions, schema merging. Exports `GetFieldsToRender`, `CheckFieldValidationRules`, `ExecuteValueFunction`, etc. |
| `src/helpers/ValidationRegistry.ts` | Unified sync/async/cross-field validation registry. Register custom validators via `registerValidators()`. Includes factory functions: `createMinLengthValidation`, `createMaxLengthValidation`, `createNumericRangeValidation`, `createPatternValidation`, `createRequiredIfValidation`. |
| `src/helpers/ValueFunctionRegistry.ts` | Pluggable value function registry. Register custom value functions via `registerValueFunctions()`. Built-in: `setDate`, `setDateIfNull`, `setLoggedInUser`. |
| `src/helpers/ExpressionEngine.ts` | Expression evaluation for computed values. Handles `$values.field`, `$fn.name()`, `$parent.field`, `$root.field` syntax. |
| `src/helpers/DependencyGraphValidator.ts` | Cycle detection for field dependencies using Kahn's algorithm. Exports `validateDependencyGraph`. |
| `src/helpers/ConfigValidator.ts` | Dev-mode config validation. Checks missing dependency targets, unregistered components/validators, circular deps. Exports `validateFieldConfigs`. |
| `src/helpers/LocaleRegistry.ts` | i18n locale registry. Exports `registerLocale`, `getLocaleString`, `resetLocale`, `getCurrentLocale`. Defaults to English. |
| `src/helpers/WizardHelper.ts` | Pure functions for multi-step wizard logic. Exports `getVisibleSteps`, `getStepFields`, `getStepFieldOrder`, `validateStepFields`, `isStepValid`, `getStepIndex`. |
| `src/helpers/FieldHelper.ts` | Option sorting utility. Exports `SortOptions`. |
| `src/helpers/RuleTracer.ts` | Rule evaluation tracing/debugging. |
| `src/helpers/RenderTracker.ts` | Per-field render count tracking for DevTools Perf tab. |
| `src/helpers/EventTimeline.ts` | Chronological event log for DevTools Timeline tab. |
| `src/components/Formosaic.tsx` | Formosaic component. Orchestrates react-hook-form, auto-save (AbortController, timeout via `saveTimeoutMs`, retry via `maxSaveRetries`), expand/collapse, confirm modal. Supports `formErrors` prop for form-level error banner. |
| `src/components/WizardForm.tsx` | WizardForm component. Multi-step wizard with render props for step content, navigation, and header. Screen reader step announcements. |
| `src/components/FieldArray.tsx` | FieldArray component. Wraps react-hook-form's `useFieldArray` with min/max/reorder support. Items use full `IFieldConfig`. |
| `src/components/RenderField.tsx` | RenderField component. Per-field rendering with useMemo for component resolution. Async validation wired with AbortController -- sync runs first, async only if sync passes. |
| `src/components/FieldWrapper.tsx` | FieldWrapper component. Field chrome (label, error, status) using plain HTML. Render props: `renderLabel`, `renderError`, `renderStatus` for theming. Supports CSS custom properties via optional `styles.css`. |
| `src/components/ConfirmInputsModal.tsx` | ConfirmInputsModal component. Confirmation dialog using native `<dialog>` element. Focus trap (Tab wraps, Escape closes, focus restored on close). |
| `src/components/FormErrorBoundary.tsx` | FormErrorBoundary component. Per-field error boundary. Props: `children`, `fallback` (render function), `onError` callback. Each field is wrapped automatically in the rendering pipeline. |
| `src/components/FormDevTools.tsx` | FormDevTools component. Collapsible dev-only panel with tabs: Rules, Values, Errors, Graph, Perf, Deps, Timeline. |
| `src/hooks/useDraftPersistence.ts` | Auto-save form state to localStorage on interval, recover draft on mount, clear after server save. Options: `formId`, `data`, `saveIntervalMs`, `enabled`, `storageKeyPrefix`. |
| `src/hooks/useBeforeUnload.ts` | Browser warning on page leave with unsaved changes. Args: `shouldWarn` (boolean), `message?` (string). |
| `src/hooks/useFormAnalytics.ts` | Analytics callback wrapper hook. Accepts `IAnalyticsCallbacks` (8 event hooks) and returns `IFormAnalytics`. |
| `src/utils/formStateSerialization.ts` | `serializeFormState` / `deserializeFormState` -- Date-safe JSON round-trip utilities. |
| `src/utils/jsonSchemaImport.ts` | `jsonSchemaToFieldConfig(schema)` -- converts JSON Schema to `Record<string, IFieldConfig>`. Maps types, enums, formats, required. |
| `src/utils/lazyFieldRegistry.ts` | `createLazyFieldRegistry(imports)` -- creates field registry using `React.lazy()` for on-demand component loading. |
| `src/utils/zodSchemaImport.ts` | `zodSchemaToFieldConfig(zodSchema)` -- converts Zod object schemas to `Record<string, IFieldConfig>`. Maps ZodString->Textbox, ZodNumber->Number, ZodBoolean->Toggle, ZodEnum->Dropdown, ZodDate->DateControl, ZodArray->Multiselect. No zod dependency. |
| `src/types/IFormConfig.ts` | `IFormConfig` (version 2 wrapper), `IFormSettings`. |
| `src/types/IFieldConfig.ts` | `IFieldConfig` (v2 schema). Primary consumer-facing type. |
| `src/types/IRule.ts` | `IRule` (when/then/else/priority). |
| `src/types/ICondition.ts` | `ICondition`, `IFieldCondition`, `ILogicalCondition`. |
| `src/types/IFieldEffect.ts` | `IFieldEffect` (required, hidden, readOnly, type, options, validate, computedValue, order, label). |
| `src/types/IOption.ts` | `IOption` (`{ value, label, disabled?, group?, icon?, color? }`). |
| `src/types/IValidationRule.ts` | `IValidationRule` (unified: name, params, message, async, debounceMs, when). |
| `src/types/IFieldProps.ts` | `IFieldProps<T>` -- Props contract all injected field components receive via `React.cloneElement`. |
| `src/types/IRuntimeFieldState.ts` | `IRuntimeFieldState`, `IRuntimeFormState`, `IRulesEngineState`. |
| `src/types/IRulesEngineAction.ts` | `RulesEngineActionType` enum, action types for reducer. |
| `src/types/IWizardConfig.ts` | `IWizardStep`, `IWizardConfig` (condition-based visibility using `ICondition`). |
| `src/types/ILocaleStrings.ts` | `ICoreLocaleStrings` (~50 keys). |
| `src/types/IAnalyticsCallbacks.ts` | `IAnalyticsCallbacks` (8 event hooks for analytics/telemetry). |
| `src/types/TypedFieldConfig.ts` | `defineFormConfig()` type-safe builder. |
| `src/styles.css` | Optional CSS custom properties for theming: `--formosaic-error-color`, `--formosaic-warning-color`, `--formosaic-saving-color`, `--formosaic-label-color`, `--formosaic-required-color`, `--formosaic-border-radius`, `--formosaic-field-gap`, `--formosaic-font-size`. |
| `src/providers/RulesEngineProvider.tsx` | RulesEngineProvider (React context provider owning rules engine state via useReducer). |
| `src/providers/InjectedFieldProvider.tsx` | InjectedFieldProvider (React context provider for component injection registry). |
| `src/reducers/RulesEngineReducer.ts` | Reducer for rules engine state mutations. |
| `src/utils/index.ts` | Local utilities: `isEmpty`, `isNull`, `deepCopy` (structuredClone), `Dictionary<T>`, `IEntityData`, `SubEntityType`, option helpers. |
| `src/constants.ts` | `ComponentTypes` enum (28 component type string keys), `FormConstants`, `FIELD_PARENT_PREFIX` (internal). |
| `src/strings.ts` | `FormStrings` (i18n-aware, getters over LocaleRegistry). |

## Template & Composition System

The template system is a **pure pre-processing layer** that runs before the rules engine. `resolveTemplates()` converts an `IFormConfig` containing `ITemplateFieldRef` entries into a standard `IFormConfig` with only concrete `IFieldConfig` fields. The rules engine, dependency graph, validation, and rendering see only the resolved output.

### New directory: `src/templates/`

| File | Purpose |
|------|---------|
| `src/templates/TemplateRegistry.ts` | Global template store. Exports `registerFormTemplate`, `registerFormTemplates`, `getFormTemplate`, `resetFormTemplates`. Templates are `IFormTemplate` objects: typed params, fields (may include nested `ITemplateFieldRef`), ports, and optional wizard config. |
| `src/templates/LookupRegistry.ts` | Static lookup table store for `$lookup.tableName` expressions. Exports `registerLookupTables`, `getLookupTable`, `resetLookupTables`. |
| `src/templates/TemplateResolver.ts` | 11-step resolution pipeline: expand refs, interpolate expressions, prefix paths, rewrite rules, scope `$values` expressions, merge ports, expand wizard steps, apply overrides, apply default values, validate, attach provenance metadata. Exports `resolveTemplates(config, options?)`. |
| `src/templates/ExpressionInterpolator.ts` | Custom parser for `{{params.name}}` and `{{$lookup.table.key}}` expression syntax used in template field labels, computedValue, and config values. |
| `src/templates/ConnectionCompiler.ts` | Compiles `IFormConnection` declarations into concrete `IRule[]` arrays. Supports `copyValues`, `hide`, `readOnly`, `computeFrom` connection effects. |
| `src/templates/ComposedFormBuilder.ts` | Orchestrates `composeForm(options)` and `defineComposedForm()`. Merges fragments, compiles connections, resolves templates, returns final `IFormConfig`. |

### New components

| File | Purpose |
|------|---------|
| `src/components/ComposedForm.tsx` | JSX wrapper that accepts `<FormFragment>`, `<FormConnection>`, and `<FormField>` children, compiles them via `ComposedFormBuilder`, and renders `<Formosaic>`. |
| `src/components/FormFragment.tsx` | Declaration-only component (renders nothing). Declares a template fragment with `name`, `templateRef`, `params`, `overrides`, and `defaultValues` props. |
| `src/components/FormConnection.tsx` | Declaration-only component (renders nothing). Declares a cross-fragment connection with `from`, `to`, and `effect` props. |
| `src/components/FormField.tsx` | Declaration-only component (renders nothing). Declares a standalone field inline in JSX composition. |

### New types

- `IFormTemplate` -- Template definition with typed params, fields (union `IFieldConfig | ITemplateFieldRef`), ports, fieldOrder, rules, wizard
- `ITemplateFieldRef` -- Reference to a registered template: `templateRef`, `templateParams`, `templateOverrides`, `defaultValues`
- `IFormConnection` -- Cross-fragment connection declaration: `from`, `to`, `effect` (`copyValues | hide | readOnly | computeFrom`)
- `IResolvedFormConfig` -- Standard `IFormConfig` tagged with `_resolvedFrom` provenance metadata (internal, not public API)
- `TemplateResolutionError` -- Typed error class with `code` (string enum) for resolution failures

### IFormConfig changes (v1.3.0)

- `IFormConfig.fields` is now `Record<string, IFieldConfig | ITemplateFieldRef>` (union type). `Formosaic` auto-detects template refs and calls `resolveTemplates()` before init.
- `IWizardStep.fields` is now optional; steps may use `fragments` instead.

### Testing

- Template tests live in `src/__tests__/templates/` (76 tests across 6 files, one per module)
- Test pattern: each module tested in isolation; `TemplateResolver.test.ts` uses end-to-end snapshot tests for the full 11-step pipeline
- Fixtures in `src/__tests__/__fixtures__/templates/` (address template, contact template, nested composition)

## Testing

- **785 tests** across 40 test files using Vitest (709 pre-v1.3.0 + 76 template tests)
- Run: `npm test` (from monorepo root or `packages/core`)
- Test files are in `src/__tests__/`
- Coverage targets: helpers (RuleEngine, ConditionEvaluator, FormosaicHelper, ValidationRegistry, ValueFunctionRegistry, DependencyGraphValidator, ConfigValidator, LocaleRegistry, WizardHelper), reducers (RulesEngineReducer), hooks (useDraftPersistence, useBeforeUnload, useFormAnalytics), utils (formStateSerialization, jsonSchemaImport, lazyFieldRegistry, zodSchemaImport), components (FormErrorBoundary, FormDevTools), templates (TemplateRegistry, LookupRegistry, TemplateResolver, ExpressionInterpolator, ConnectionCompiler, ComposedFormBuilder)
- All tests must pass before committing

## Known Issues

- `isReadonly` is **deprecated** -- use `readOnly` instead. `normalizeFieldConfig()` auto-migrates and emits a console warning.
- Hardcoded English strings in some older code paths (mostly migrated to `LocaleRegistry`).

## Adding New Features

### Adding a New Rule Effect

1. Add the effect property to `IFieldEffect` in `src/types/IFieldEffect.ts`
2. Add evaluation logic in `RuleEngine.ts` (inside `applyRuleEffect` or as a new effect handler)
3. Update `IRuntimeFieldState` if the effect carries per-field runtime state
4. If it needs reducer support, add an action to `RulesEngineActionType` and handle in `RulesEngineReducer`
5. Write tests in `src/__tests__/helpers/`

### Adding a New Condition Operator

1. Add the operator string to the `operator` union type in `IFieldCondition` (`src/types/ICondition.ts`)
2. Add evaluation logic in `ConditionEvaluator.ts` inside `evaluateFieldCondition`
3. Write tests in `src/__tests__/helpers/`

### Adding a New Validation

```ts
import { registerValidators } from "@formosaic/core";

registerValidators({
  ZipCodeValidation: (value, entityData) => {
    if (!/^\d{5}(-\d{4})?$/.test(value)) return "Invalid ZIP code";
    return undefined;
  },
});
```

### Adding a New Value Function

```ts
import { registerValueFunctions } from "@formosaic/core";

registerValueFunctions({
  setDefaultPriority: ({ parentEntity }) => parentEntity?.defaultPriority ?? "Medium",
});
```

### Adding a New Locale

```ts
import { registerLocale } from "@formosaic/core";

registerLocale({
  saving: "Guardando...",
  required: "Requerido",
  thisFieldIsRequired: "Este campo es obligatorio",
});
```
