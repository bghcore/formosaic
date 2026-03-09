# API Stability

This document classifies every public export from the `@form-eng/*` packages by stability level and intended audience. Use this guide to understand which APIs are safe to depend on and which are internal implementation details.

## Stability Levels

- **Stable**: Covered by semver. Breaking changes require a major version bump.
- **Internal**: Not part of the public API. May change or be removed in any release without notice.

## Audience Categories

- **All consumers**: Anyone using form-engine to render forms.
- **Advanced**: Consumers who need direct access to the rules engine or dependency graph.
- **Extension authors**: Developers registering custom validators, value functions, or locales.
- **Adapter authors**: Developers building or maintaining adapter packages.
- **Adapter + CI**: Adapter authors using the contract test infrastructure.
- **Schema importers**: Consumers converting from external schema formats (JSON Schema, Zod).
- **DevTools only**: Internal debugging/profiling tools, not intended for production use.

---

## Export Classification

### Types and Interfaces

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `IFormConfig` | `@form-eng/core` | Stable | All consumers |
| `IFieldConfig` | `@form-eng/core` | Stable | All consumers |
| `IFieldProps` | `@form-eng/core` | Stable | All consumers |
| `IRule` | `@form-eng/core` | Stable | All consumers |
| `ICondition` | `@form-eng/core` | Stable | All consumers |
| `IOption` | `@form-eng/core` | Stable | All consumers |
| `IRuntimeFieldState` | `@form-eng/core` | Stable | All consumers |
| `IRuntimeFormState` | `@form-eng/core` | Stable | All consumers |
| `IWizardConfig` | `@form-eng/core` | Stable | All consumers |

### Components

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `FormEngine` | `@form-eng/core` | Stable | All consumers |
| `FormFields` | `@form-eng/core` | Stable | All consumers |
| `FieldWrapper` | `@form-eng/core` | Stable | All consumers |
| `WizardForm` | `@form-eng/core` | Stable | All consumers |
| `FieldArray` | `@form-eng/core` | Stable | All consumers |
| `ConfirmInputsModal` | `@form-eng/core` | Stable | All consumers |
| `FormErrorBoundary` | `@form-eng/core` | Stable | All consumers |
| `FormDevTools` | `@form-eng/core` | Internal | DevTools only |

### Providers and Context

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `RulesEngineProvider` | `@form-eng/core` | Stable | All consumers |
| `InjectedFieldProvider` | `@form-eng/core` | Stable | All consumers |
| `UseRulesEngineContext` | `@form-eng/core` | Stable | All consumers |
| `UseInjectedFieldContext` | `@form-eng/core` | Stable | All consumers |

### Constants

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `ComponentTypes` | `@form-eng/core` | Stable | All consumers |
| `FormConstants` | `@form-eng/core` | Stable | All consumers |

### Hooks

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `useDraftPersistence` | `@form-eng/core` | Stable | All consumers |
| `useBeforeUnload` | `@form-eng/core` | Stable | All consumers |
| `useFormAnalytics` | `@form-eng/core` | Stable | All consumers |

### Rules Engine (Advanced)

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `evaluateAllRules` | `@form-eng/core` | Stable | Advanced |
| `evaluateAffectedFields` | `@form-eng/core` | Stable | Advanced |
| `buildDependencyGraph` | `@form-eng/core` | Stable | Advanced |
| `evaluateCondition` | `@form-eng/core` | Stable | Advanced |
| `topologicalSort` | `@form-eng/core` | Stable | Advanced |

### Registries (Extension Authors)

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `registerValidators` | `@form-eng/core` | Stable | Extension authors |
| `registerValueFunctions` | `@form-eng/core` | Stable | Extension authors |
| `registerLocale` | `@form-eng/core` | Stable | Extension authors |
| `getLocaleString` | `@form-eng/core` | Stable | Extension authors |
| `resetLocale` | `@form-eng/core` | Stable | Extension authors |

### Adapter Utilities

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `GetFieldDataTestId` | `@form-eng/core/adapter-utils` | Stable | Adapter authors |
| `FieldClassName` | `@form-eng/core/adapter-utils` | Stable | Adapter authors |
| `getFieldState` | `@form-eng/core/adapter-utils` | Stable | Adapter authors |
| `formatDateTime` | `@form-eng/core/adapter-utils` | Stable | Adapter authors |
| `convertBooleanToYesOrNoText` | `@form-eng/core/adapter-utils` | Stable | Adapter authors |
| `isNull` | `@form-eng/core/adapter-utils` | Stable | Adapter authors |

### Contract Test Infrastructure

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `runAdapterContractTests` | `@form-eng/core/testing` | Stable | Adapter + CI |
| `TIER_1_FIELDS` | `@form-eng/core/testing` | Stable | Adapter + CI |
| `ALL_FIELD_TYPES` | `@form-eng/core/testing` | Stable | Adapter + CI |
| `runParityTests` | `@form-eng/core/testing` | Stable | Adapter + CI |

### Schema Import/Export

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `fromRjsfSchema` | `@form-eng/core` | Stable | Schema importers |
| `toRjsfSchema` | `@form-eng/core` | Stable | Schema importers |
| `fromZodSchema` | `@form-eng/core` | Stable | Schema importers |

### Internal / DevTools

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `RenderTracker` | `@form-eng/core` | Internal | DevTools only |
| `EventTimeline` | `@form-eng/core` | Internal | DevTools only |
| `FormDevTools` | `@form-eng/core` | Internal | DevTools only |
| `RuleTracer` | `@form-eng/core` | Internal | DevTools only |

---

## Notes

- Internal exports are tree-shakeable and will not appear in production bundles when unused.
- The `@form-eng/core/adapter-utils` and `@form-eng/core/testing` subpath exports are separate entry points to keep adapter and test dependencies isolated from the main bundle.
- Adapter package exports (e.g., `createFluentFieldRegistry`, `createMuiFieldRegistry`) follow the same Stable/All consumers classification.
