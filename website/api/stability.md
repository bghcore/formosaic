---
title: API Stability
---

# API Stability

This document classifies every public export from the `@formosaic/*` packages by stability level and intended audience.

## Stability Levels

- **Stable**: Covered by semver. Breaking changes require a major version bump.
- **Internal**: Not part of the public API. May change or be removed in any release.

## Audience Categories

- **All consumers**: Anyone using Formosaic to render forms.
- **Advanced**: Consumers who need direct access to the rules engine or dependency graph.
- **Extension authors**: Developers registering custom validators, value functions, or locales.
- **Adapter authors**: Developers building or maintaining adapter packages.
- **Adapter + CI**: Adapter authors using the contract test infrastructure.
- **Schema importers**: Consumers converting from external schema formats.
- **DevTools only**: Internal debugging/profiling tools.

---

## Types and Interfaces

| Export | Stability | Audience |
|--------|-----------|----------|
| `IFormConfig` | Stable | All consumers |
| `IFieldConfig` | Stable | All consumers |
| `IFieldProps` | Stable | All consumers |
| `IRule` | Stable | All consumers |
| `ICondition` | Stable | All consumers |
| `IOption` | Stable | All consumers |
| `IRuntimeFieldState` | Stable | All consumers |
| `IRuntimeFormState` | Stable | All consumers |
| `IWizardConfig` | Stable | All consumers |

## Components

| Export | Stability | Audience |
|--------|-----------|----------|
| `Formosaic` | Stable | All consumers |
| `FormFields` | Stable | All consumers |
| `FieldWrapper` | Stable | All consumers |
| `WizardForm` | Stable | All consumers |
| `FieldArray` | Stable | All consumers |
| `ConfirmInputsModal` | Stable | All consumers |
| `FormErrorBoundary` | Stable | All consumers |
| `FormDevTools` | Internal | DevTools only |

## Providers and Context

| Export | Stability | Audience |
|--------|-----------|----------|
| `RulesEngineProvider` | Stable | All consumers |
| `InjectedFieldProvider` | Stable | All consumers |

## Hooks

| Export | Stability | Audience |
|--------|-----------|----------|
| `useDraftPersistence` | Stable | All consumers |
| `useBeforeUnload` | Stable | All consumers |
| `useFormAnalytics` | Stable | All consumers |

## Rules Engine (Advanced)

| Export | Stability | Audience |
|--------|-----------|----------|
| `evaluateAllRules` | Stable | Advanced |
| `evaluateAffectedFields` | Stable | Advanced |
| `buildDependencyGraph` | Stable | Advanced |
| `evaluateCondition` | Stable | Advanced |
| `topologicalSort` | Stable | Advanced |

## Registries (Extension Authors)

| Export | Stability | Audience |
|--------|-----------|----------|
| `registerValidators` | Stable | Extension authors |
| `registerValueFunctions` | Stable | Extension authors |
| `registerLocale` | Stable | Extension authors |
| `getLocaleString` | Stable | Extension authors |
| `resetLocale` | Stable | Extension authors |

## Adapter Utilities

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `GetFieldDataTestId` | `@formosaic/core/adapter-utils` | Stable | Adapter authors |
| `FieldClassName` | `@formosaic/core/adapter-utils` | Stable | Adapter authors |
| `getFieldState` | `@formosaic/core/adapter-utils` | Stable | Adapter authors |
| `formatDateTime` | `@formosaic/core/adapter-utils` | Stable | Adapter authors |

## Contract Test Infrastructure

| Export | Path | Stability | Audience |
|--------|------|-----------|----------|
| `runAdapterContractTests` | `@formosaic/core/testing` | Stable | Adapter + CI |
| `TIER_1_FIELDS` | `@formosaic/core/testing` | Stable | Adapter + CI |
| `ALL_FIELD_TYPES` | `@formosaic/core/testing` | Stable | Adapter + CI |
| `runParityTests` | `@formosaic/core/testing` | Stable | Adapter + CI |

## Schema Import/Export

| Export | Stability | Audience |
|--------|-----------|----------|
| `fromRjsfSchema` | Stable | Schema importers |
| `toRjsfSchema` | Stable | Schema importers |
| `fromZodSchema` | Stable | Schema importers |

## Internal / DevTools

| Export | Stability | Audience |
|--------|-----------|----------|
| `RenderTracker` | Internal | DevTools only |
| `EventTimeline` | Internal | DevTools only |
| `FormDevTools` | Internal | DevTools only |
| `RuleTracer` | Internal | DevTools only |

---

## Notes

- Internal exports are tree-shakeable and will not appear in production bundles when unused.
- The `@formosaic/core/adapter-utils` and `@formosaic/core/testing` subpath exports keep adapter and test dependencies isolated from the main bundle.
