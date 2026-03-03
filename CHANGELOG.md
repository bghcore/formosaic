# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2026-03-03

Business rules engine audit — critical bug fixes, new features, and comprehensive documentation.

### Fixed

- **String coercion in dependency matching** — `null` no longer matches `"null"`, `true` no longer matches `"true"`. New `dependencyValueMatches()` helper prevents phantom rule matches.
- **CombineBusinessRules now immutable** — returns new object instead of mutating first argument. All 9 call sites updated. Eliminates class of mutation-related bugs.
- **Reducer uses shallow copy** — `structuredClone(state)` replaced with spread operator. Only the affected config is copied, reducing GC pressure on every keystroke.
- **Hidden fields skip validation** — `clearErrors()` called on hidden fields before `trigger()`, preventing ghost error messages.
- **Self-dependency detection** — `ConfigValidator` now catches fields that have dependencies on themselves.

### Added

- **Expression engine** — `evaluateExpression("$values.qty * $values.price", formValues)` with safe evaluation (Function constructor with restricted Math-only scope, no eval)
- **Cross-field validation** — `registerCrossFieldValidations()` + `CheckCrossFieldValidationRules()` for rules like "password must match confirmPassword"
- **Rule tracing** — `enableRuleTracing()` / `getRuleTraceLog()` / `clearRuleTraceLog()` for debugging which rules fired, when, and what they changed
- **BUSINESSRULES_CLEAR action** — reset business rules for a specific config or all configs via `clearBusinessRules()`
- **`computedValue`** property on `IFieldConfig` — declare reactive computed expressions
- **`crossFieldValidations`** property on `IFieldConfig` — declare cross-field validation rules
- **Comprehensive JSDoc** on all 13 engine functions documenting lifecycle, params, returns, side effects
- 62 new tests (expression engine, cross-field validation, rule tracing, updated CombineBusinessRules immutability tests)

## [1.3.0] - 2026-03-03

Enterprise features: reliability, accessibility, persistence, theming, developer tools, and performance.

### Added

- **Async validation wired into rendering** — `HookRenderField` now runs async validators after sync pass. `AbortController` cancels in-flight checks on re-type.
- **`HookFormErrorBoundary`** — per-field error boundary wrapping each `HookRenderField`. One crashing field no longer kills the entire form. Props: `fallback`, `onError`.
- **Save reliability** — `AbortController` cancels previous in-flight saves, configurable timeout via `saveTimeoutMs` (default 30s), retry with exponential backoff via `maxSaveRetries` (default 3).
- **Accessibility (WCAG AA)** — focus trap in `HookConfirmInputsModal`, focus-to-first-error on validation failure, ARIA live regions for form status, `aria-label` on filter input, `aria-busy` during save, wizard step announcements for screen readers.
- **`useDraftPersistence`** hook — auto-save form state to localStorage on configurable interval, recover draft on mount, clear after server save.
- **`useBeforeUnload`** hook — browser warning on page leave with unsaved changes.
- **`serializeFormState` / `deserializeFormState`** — Date-safe JSON round-trip utilities.
- **Theming render props** — `renderLabel`, `renderError`, `renderStatus` on `HookFieldWrapper` for custom field chrome without replacing components.
- **CSS custom properties** — `--hook-form-error-color`, `--hook-form-warning-color`, `--hook-form-saving-color`, etc. in optional `styles.css`.
- **`formErrors`** prop on `HookInlineForm` — form-level error banner for cross-field validation.
- **`HookFormDevTools`** — collapsible dev-only panel showing business rules state, form values, errors, and dependency graph.
- **`jsonSchemaToFieldConfig()`** — convert JSON Schema to `Dictionary<IFieldConfig>`. Maps types, enums, formats, required.
- **`createLazyFieldRegistry()`** — React.lazy field registry for on-demand component loading.
- 79 new tests across 8 new test files.

### Changed

- **`HookRenderField`** refactored from `useState` + `useEffect` to `useMemo` — eliminates one render cycle per field update.

## [1.2.0] - 2026-03-02

TypeScript strict mode and MUI adapter.

### Added

- **`@bghcore/dynamic-forms-mui`** — new package with 19 MUI field components (13 editable + 6 read-only), `createMuiFieldRegistry()`, supporting components, shared helpers.
- **`normalizeFieldConfig()`** — maps deprecated `isReadonly` to `readOnly` with dev-mode console warning.
- **`docs/creating-an-adapter.md`** — complete guide for building custom UI library adapters.
- Better error messages: missing component lists available types, missing provider shows required hierarchy.

### Changed

- **`strict: true`** enabled in core tsconfig (was `strict: false, strictNullChecks: false`). ~30 null-safety fixes applied.
- Per-package publish workflow: `core-v*`, `fluent-v*`, `mui-v*` tags trigger independent deployments.

## [1.1.0] - 2026-03-02

Test infrastructure, async validation, i18n, wizard forms, and field arrays.

### Added

- **Vitest** test framework with 348 tests across 11 test files. 80%+ coverage on all core helpers.
- **Circular dependency detection** — `DependencyGraphValidator` using Kahn's algorithm, runs in `GetDefaultBusinessRules()`.
- **`ConfigValidator`** — dev-mode config validation checking dependency targets, registered components/validators, circular deps.
- **Async validation framework** — `AsyncValidationFunction` type, `registerAsyncValidations()`, `getAsyncValidation()`, `CheckAsyncFieldValidationRules()`.
- **9 new validators** (15 total): `NoSpecialCharactersValidation`, `CurrencyValidation`, `UniqueInArrayValidation` + factories: `createMinLengthValidation`, `createMaxLengthValidation`, `createNumericRangeValidation`, `createPatternValidation`, `createRequiredIfValidation`.
- **i18n** — `LocaleRegistry` with `registerLocale()`, `getLocaleString()`, `resetLocale()`. `ICoreLocaleStrings` interface. `strings.ts` rewritten with ES getters for backwards compatibility.
- **`HookWizardForm`** — multi-step wizard composing around existing form. Steps partition field order, not business rules. Render props for navigation/headers. Conditional step visibility.
- **`HookFieldArray`** — repeating sections via react-hook-form `useFieldArray`. Min/max items, defaultItem, reorderable, qualified names (`addresses.0.city`).
- **`IWizardConfig`**, **`IFieldArrayConfig`**, **`ICoreLocaleStrings`** types.
- **`ComponentTypes.FieldArray`** constant.
- `docs/FINDINGS.md` — codebase analysis and strategic expansion plan.

### Changed

- **Provider memoization** — `useCallback`/`useMemo` on `BusinessRulesProvider` and `InjectedHookFieldProvider`.
- **`React.memo`** on `HookRenderField` and `HookFieldWrapper`.

## [1.0.0] - 2026-03-02

First stable release. Both packages published to npm.

### Added

- `llms.txt` for AI/LLM discoverability (Answer.AI spec)
- `AGENTS.md` files (root, core, fluent) for agentic AI guidance
- npm metadata: `repository`, `homepage`, `bugs`, `keywords` in both package.json files

### Changed

- Version bump from 0.1.0 to 1.0.0
- Fixed README reference from "Fluent UI v8" to "Fluent UI v9"
- Updated fluent package peer dependency on core from `^0.1.0` to `^1.0.0`

## [0.1.0] - 2026-03-02

First buildable release. Restructured from a single broken package (extracted from
an internal monorepo) into two independent, publishable packages.

### Added

- **Monorepo structure** with npm workspaces (`packages/core`, `packages/fluent`)
- **`@bghcore/dynamic-forms-core`** -- UI-library agnostic business rules engine (React only, no UI library deps)
  - `BusinessRulesProvider` and `InjectedHookFieldProvider` React context providers
  - `ProcessAllBusinessRules`, `ProcessFieldBusinessRule`, and full rule evaluation pipeline
  - `HookInlineForm` component with auto-save, expand/collapse, and confirm-input modal
  - `HookRenderField` with component injection via `React.cloneElement`
  - `HookFieldWrapper` with plain HTML status indicators (no UI library dependency)
  - `HookConfirmInputsModal` using native `<dialog>` with optional `renderDialog` prop
  - Pluggable `ValidationRegistry` with built-in validators (email, phone, year, URL, max KB)
  - Pluggable `ValueFunctionRegistry` with built-in functions (setDate, setDateIfNull, setLoggedInUser, inheritFromParent)
  - `CombineSchemaConfig` for merging field configs with schema definitions
  - All TypeScript interfaces exported (`IFieldConfig`, `IBusinessRule`, `IHookFieldSharedProps`, etc.)
  - Local utility types replacing external dependencies (`Dictionary<T>`, `IEntityData`, `SubEntityType`)
  - Local utility functions (`isEmpty`, `isNull`, `deepCopy`, `sortDropdownOptions`, etc.)
- **`@bghcore/dynamic-forms-fluent`** -- Fluent UI v8 field components
  - 13 editable field components: Textbox, Number, Toggle, Dropdown, MultiSelect, DateControl, Slider, Fragment, SimpleDropdown, MultiSelectSearch, PopOutEditor, DocumentLinks, StatusDropdown
  - 6 read-only field components: ReadOnly, ReadOnlyArray, ReadOnlyDateTime, ReadOnlyCumulativeNumber, ReadOnlyRichText, ReadOnlyWithButton
  - Supporting components: ReadOnlyText, StatusMessage, HookFormLoading (Shimmer), StatusColor, StatusDropdown, DocumentLink, DocumentLinks
  - `createFluentFieldRegistry()` for one-line setup with `InjectedHookFieldProvider`
  - Shared helpers: `FieldClassName`, `GetFieldDataTestId`, `onRenderDropdownItemWithIcon`, `formatDateTime`
- **tsup build system** producing CJS, ESM, and `.d.ts` for both packages
- `tsconfig.base.json` shared TypeScript configuration

### Changed

- **`HookInlineForm`** now accepts `currentUserUpn` prop instead of reading from a legacy auth context
- **`HookInlineForm`** now accepts `onSaveError` callback instead of using a legacy notification system
- **`HookInlineForm`** now accepts `renderExpandButton`, `renderFilterInput`, and `renderDialog` render props instead of depending on Fluent UI `DefaultButton` and legacy UI components
- **`HookRenderField`** no longer uses external entity state hooks -- external entity sync is now the consumer's responsibility
- **`HookFieldWrapper`** uses plain HTML elements for error/warning/saving icons instead of Fluent UI `Icon` and `Spinner`
- **`HookConfirmInputsModal`** uses native `<dialog>` instead of legacy UI components
- **`HookPopOutEditor`** simplified to Textarea-only mode (removed rich text editor dependency)
- **`HookMultiSelectSearch`** uses Fluent UI `ComboBox` instead of legacy UI components
- **`DocumentLinks`** uses Fluent UI `Dialog` instead of legacy UI components
- **`DocumentLink`** uses `<a>` tag instead of a legacy anchor component
- **`BusinessRulesReducer`** uses `structuredClone` instead of a legacy `DeepCopy` utility
- **`OrderDependencies`** recursive type uses `interface OrderDependencyMap` to avoid circular reference
- Validation functions are now pluggable via `registerValidations()` instead of hardcoded switch/case
- Value functions are now pluggable via `registerValueFunctions()` instead of hardcoded switch/case
- `IHookFieldSharedProps.setFieldValue` generic parameter simplified to `unknown`

### Removed

- All legacy internal monorepo dependencies (replaced with local implementations or props)
- All legacy UI component library imports
- All `lodash` imports
- `react-error-boundary` dependency
- **14 domain-specific field components**: removed components tightly coupled to the original host application's data models and APIs
- **Host-app coupled components**: HookInlineFormWrapper (data fetching), HookFormPanel (slide-out panel), HookFormBoundary (error boundary with hardcoded internal link)
- **Panel system**: HookInlineFormPanelProvider, IHookFormPanelActionProps, IHookPanelConfig
- **Domain-specific helpers**: People picker rendering, product taxonomy API, work item creation, block status change processing, customer resolution
- `InjectComponents.tsx` (replaced by `@bghcore/dynamic-forms-fluent` `createFluentFieldRegistry()`)
- `HookInlineForm.scss` (broken -- used undefined SCSS variables)
- `rollup.config.js` (replaced by tsup)
- Domain-specific strings and constants
