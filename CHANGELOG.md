# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.2] - 2026-03-09

### Fixed

- **DIV-006 resolved: Dropdown readOnly now shows option label instead of raw value** -- All 11 adapters (fluent, mui, headless, antd, chakra, mantine, atlaskit, base-web, heroui, radix, react-aria) now perform `options?.find()` label lookup before passing to ReadOnlyText. Falls back to raw value if label not found. SimpleDropdown was not affected (string options where value equals label).
- **Parity matrix corrected** -- atlaskit, base-web, and heroui were incorrectly shown as "---" (not implemented) for all Tier 1 fields. Now correctly shows "FB" (semantic HTML fallback).
- **Condition operator count corrected to 20** -- Root README, CLAUDE.md, and core AGENTS.md updated from stale counts (15 or 18) to the actual 20 operators (15 scalar + 5 array: arrayContains, arrayNotContains, arrayLengthEquals, arrayLengthGreaterThan, arrayLengthLessThan).
- **Base-web reclassified as framework-native** -- Base-web uses native baseui components for 10/13 Tier 1 fields, not "semantic HTML fallbacks" as previously documented. Only DateControl, DynamicFragment, and ReadOnly use HTML fallbacks.
- **Radix native count corrected from 7 to 6** -- Actual native Radix UI primitives: Toggle, Dropdown, SimpleDropdown, Slider, RadioGroup, CheckboxGroup (6). Seven fields use semantic HTML.
- Edge-case test updated to expect label ("Option 1") instead of raw value ("opt1") for Dropdown readOnly.

### Added

- **`docs/tier1-baseline-report.md`** -- Full Tier 1 audit table (13 fields x 11 adapters), production-readiness scorecard, gap register, test coverage summary, and Tier 2 target ranking.
- **`docs/tier1-patterns.md`** -- 12 canonical implementation patterns for Tier 2: text-like, selection-single, selection-multi, boolean, numeric, date, readOnly, semantic fallback, primitives-first, recipe/wrapper, validation wiring, and serialization.
- **`docs/tier2-launch-checklist.md`** -- Go/no-go document for Tier 2 launch with adapter priority order, pattern references, and doc sync requirements. Verdict: GO.

### Changed

- All documentation artifacts reconciled: parity-matrix.md, field-capability-matrix.md, divergence-register.md, choosing-an-adapter.md, tier2-handoff.md, pre-expansion-summary.md, CLAUDE.md, AGENTS.md, and package AGENTS.md files now agree on adapter classifications, field counts, and support claims.
- All packages bumped to 1.5.2.

## [1.5.1] - 2026-03-09

### Added

- **Primitives-first edge-case parity tests** — 21 targeted tests in `primitiveAdapterEdgeCases.test.ts` covering DIV-010 (Radix Select null/undefined boundary), DIV-011 (Radix Slider array conversion), DIV-012 (React Aria Key type cast), React Aria NumberField NaN guard, Radix Checkbox indeterminate boundary, and cross-adapter readOnly sentinel consistency.
- **Consumer smoke tests** — 36 tests in `consumerSmoke.test.ts` validating all 11 adapter registries: creation, 13 Tier 1 key coverage, cloneElement compatibility, type key consistency, and radix/react-aria import validation.
- **Radix + react-aria in cross-adapter edge cases** — Both adapters added to `crossAdapterEdgeCases.test.ts` (+66 tests covering Number, Dropdown, MultiSelect, RadioGroup, CheckboxGroup, DateControl, ReadOnly edge cases).
- **Radix + react-aria in business form round-trip** — Both adapters added to `businessFormRoundTrip.test.ts` (+60 tests covering profile, workflow, and option-heavy form configs).
- **shadcn reference implementation** — 7 shadcn-style field wrappers + `createShadcnFieldRegistry()` in `stories/examples/shadcn-fields/`, plus `ShadcnReference.stories.tsx` Storybook story with HybridRegistry and Empty variants.
- **`docs/choosing-an-adapter.md`** — Adapter recommendation guide with quick decision table, classification grid (5 categories), per-adapter cards, and text-based decision flowchart.
- **`docs/tier2-feasibility-matrix.md`** — 19 candidate Tier 2 fields x 12 targets (11 adapters + shadcn recipe) feasibility assessment with 4-wave rollout plan.
- **`docs/tier2-handoff.md`** — Pre-Tier-2 handoff document answering 7 decision questions: parity status, primitives-first readiness, shadcn validation, divergence summary, rollout strategy, recommendations, and go/no-go per adapter.
- **`@form-eng/radix` llms.txt and AGENTS.md** — LLM-optimized API reference and agent instructions for the Radix UI adapter.
- **`@form-eng/react-aria` llms.txt and AGENTS.md** — LLM-optimized API reference and agent instructions for the React Aria adapter.

### Changed

- 4774 tests passing across 55 files (up from 4587 in v1.5.0).
- Storybook aliases updated: `@form-eng/radix` and `@form-eng/react-aria` now resolve in Storybook.
- Updated root README.md, llms.txt, CLAUDE.md, and AGENTS.md with new test counts, packages, and documentation links.
- All packages bumped to 1.5.1.

## [1.5.0] - 2026-03-09

### Added

- **`@form-eng/radix`** -- New Radix UI primitives adapter package. 7 native Radix fields (Toggle, Dropdown, SimpleDropdown, Slider, RadioGroup, CheckboxGroup via @radix-ui/* packages) + 6 semantic HTML fields (Textbox, Number, MultiSelect, DateControl, Textarea, DynamicFragment). Ships with no styles -- ideal as the base for Tailwind CSS, shadcn/ui, and custom design systems. No provider wrapper needed.
- **`@form-eng/react-aria`** -- New React Aria Components adapter package. 10 native React Aria fields (Textbox, Number, Toggle, Dropdown, SimpleDropdown, Slider, RadioGroup, CheckboxGroup, Textarea via react-aria-components) + 3 semantic HTML fields (MultiSelect, DateControl, DynamicFragment). Best-in-class ARIA accessibility patterns. Highest native Tier 1 coverage among primitives-first adapters. No provider wrapper needed.
- **`docs/shadcn-integration.md`** -- Integration guide for shadcn/ui projects: three approaches (use Radix directly, create local wrappers, hybrid overlay), copy-pasteable wrapper examples, registry composition pattern, and Tailwind + data-attribute styling guidance.
- **"Primitives-first" adapter classification** in `docs/adapter-architecture.md` for adapters that provide accessible behavior without styling (radix, react-aria).
- **DIV-010, DIV-011, DIV-012** in divergence register: Radix Select empty value handling, Radix Slider array boundary conversion, React Aria Select Key type cast. All classified as "Permanent acceptable".
- Both new adapters added to cross-adapter parity test suite (11 adapters x 8 fixtures).
- Contract tests for both adapters (92 tests each).

### Changed

- 4587 tests passing across 53 files (up from 4013 in v1.4.1).
- Updated field-capability-matrix.md, parity-matrix.md, pre-expansion-summary.md with radix and react-aria columns.
- Updated README.md and CLAUDE.md with new packages.
- All packages bumped to 1.5.0.
- Root build command includes radix and react-aria workspaces.
- CI/CD publish now supports 13 packages (added radix, react-aria).

## [1.4.1] - 2026-03-09

### Added

- **Cross-adapter ugly edge-case parity tests** — ~250 tests covering Number (null/0/negative/decimal/readOnly), Dropdown (unknown value/placeholder/readOnly), MultiSelect (null/empty array/readOnly labels), RadioGroup/CheckboxGroup (unknown value/readOnly), DateControl (null/invalid/readOnly), and ReadOnly (empty/number) across all 9 adapters.
- **Business-form serialization round-trip tests** — ~160 tests using profileFormConfig, workflowFormConfig, and optionHeavyFormConfig to validate value hydration, readOnly rendering, and serialization shape across headless, antd, mantine, and chakra adapters.
- **`docs/divergence-register.md`** — Structured tracking artifact with 9 classified divergences (DIV-001 through DIV-009). Each entry has severity, affected adapters/fields, observed vs canonical behavior, user-visible flag, jsdom-only flag, and recommended action.
- **`docs/test-architecture-note.md`** — Architecture note evaluating whether parity tests should stay in core or move to a separate package. Recommendation: keep in core for now, revisit at ~5000 tests or when external adapters appear.
- **Provider wrapper documentation** in `docs/adapter-architecture.md` — Documents which adapters require wrappers (Chakra: ChakraProvider, Mantine: MantineProvider + jsdom mocks), why, and test setup reference.
- **Updated adapter classification** in `docs/adapter-architecture.md` — Honest classification with native/fallback field counts, confidence levels, and production readiness assessment per adapter. base-web reclassified as effectively Compatibility for Tier 1.
- **Updated pre-expansion summary** (`docs/pre-expansion-summary.md`) — Final readiness report answering 7 key questions for Tier 2 go/no-go decision.

### Changed

- 4013 tests passing across 51 files (up from 3606 in v1.4.0).
- Adapter classification table now includes native/fallback field counts and confidence levels.
- All packages bumped to 1.4.1.

## [1.4.0] - 2026-03-09

### Added

- **Cross-adapter parity test harness** -- `runParityTests()` in `@form-eng/core/testing` renders the same `IFormConfig` through multiple adapter registries and asserts engine-level equivalence: initial render, readOnly mode (no editable inputs), value hydration, required indicators, and empty-display sentinel (`"-"`).
  - `IParityAdapterConfig` interface with `name`, `registry`, optional `wrapper` (for provider-requiring adapters), `contextDependentFields`, and `skipRequiredCheck` for documenting known adapter gaps.
  - 8 parity fixtures exported from `@form-eng/core/testing`: `PARITY_TEXT_FORM`, `PARITY_NUMBER_FORM`, `PARITY_BOOLEAN_FORM`, `PARITY_SELECT_FORM`, `PARITY_DATE_FORM`, `PARITY_CHOICE_FORM`, `PARITY_MIXED_FORM`, `PARITY_READONLY_FORM`.
- **Cross-adapter parity test suite** -- 7 adapters x 8 fixtures = ~1331 parity tests validating behavioral equivalence across fluent, mui, headless, antd, atlaskit, base-web, and heroui adapters. Chakra and mantine documented as requiring provider wrappers.
- **Edge-case canonical value tests** -- ~100+ edge-case assertions using the headless adapter covering `undefined`, `null`, `""`, `0`, `-1`, whitespace, unknown values, and readOnly sentinel behavior for all 13 Tier 1 field types.
- **Performance/render sanity tests** -- Baseline render count checks, option-heavy rendering (200 options), and rules overhead comparison using the headless adapter.
- **Adapter render benchmark** -- `benchmarks/suites/adapter-render.bench.ts` for timing render + hydrate of 10-field forms through the headless adapter.
- **Business form test fixtures** -- 3 realistic `IFormConfig` fixtures (`profileFormConfig`, `workflowFormConfig`, `optionHeavyFormConfig`) with cross-field rules, validation, and 100+ option lists.
- **Storybook example stories** -- 3 new stories: `ProfileForm`, `WorkflowForm`, `OptionHeavyForm` demonstrating realistic business form patterns with the Fluent UI adapter.
- **`docs/field-capability-matrix.md`** -- Per-field, per-adapter capability matrix documenting support level, implementation strategy, readOnly/disabled/required support, serialization conformance, and parity caveats for all 13 Tier 1 fields x 9 adapters.
- **`docs/api-stability.md`** -- Public API stability classification (Stable, Extension, Adapter, Internal) for all `@form-eng/core`, `@form-eng/core/adapter-utils`, and `@form-eng/core/testing` exports.
- **`docs/pre-expansion-summary.md`** -- Pre-Tier-2 expansion readiness assessment with adapter rankings, known divergences (accepted vs must-monitor), and infrastructure readiness checklist.
- **ReadOnly contract** in `docs/canonical-field-contracts.md` -- Formalized readOnly rendering requirements: no editable inputs, `"-"` sentinel for empty values, option labels (not values) for selects, `formatDateTime()` for dates, hidden input for DynamicFragment.
- **Adapter classification** in `docs/adapter-architecture.md` -- Classification table for all 9 adapters: Native (fluent, mui, antd, mantine), Reference (headless), Hybrid (chakra, base-web), Compatibility (atlaskit, heroui).

### Changed

- `@form-eng/core` package.json now includes all 9 adapter packages as devDependencies for parity test imports.
- `@form-eng/core/testing` exports expanded with `runParityTests`, `IParityAdapterConfig`, `IParityTestOptions`, and all 8 `PARITY_*_FORM` fixtures.
- 3219 tests passing across 50 files (up from 1814 tests in v1.3.0).
- 67+ Storybook stories (up from 64 in v1.3.0).
- 6 benchmark suites (up from 5 in v1.3.0).

### Documented Parity Findings

- **Number/Slider readOnly with null** -- Shows `"0"` not `"-"` due to `?? 0` coercion. Accepted behavior per canonical contract.
- **Mantine Number empty** -- Explicitly converts to `null`; other adapters leave as browser-level empty state. Accepted divergence.
- **Fluent/MUI Textarea required indicator** -- PopOutEditor shows `*` only inside the expanded modal dialog, not in inline rendering. Documented gap.
- **MUI CheckboxGroup required** -- `FormControl required` class not detectable in jsdom standalone rendering. Documented gap.
- **All 9 adapters conform** to canonical field contracts for value serialization -- no must-fix divergences found.

## [1.3.0] - 2026-03-09

### Added

- **Architecture hardening: core subpath exports**
  - `@form-eng/core/adapter-utils` -- Dedicated subpath export for shared adapter utilities (GetFieldDataTestId, FieldClassName, getFieldState, formatDateTime, formatDateRange, etc.)
  - `@form-eng/core/testing` -- Contract test infrastructure for adapter packages (runAdapterContractTests, TIER_1_FIELDS, ALL_FIELD_TYPES, VALUE_BY_TYPE)
- **Enhanced contract test suite** -- Added disabled state, required state, value rendering, and null safety tests to the adapter contract test runner. Added `wrapper` option for provider-requiring adapters.
- **Contract tests wired for all 9 adapters** -- Every adapter package now has `__tests__/contract.test.ts` validating registry coverage and field rendering across multiple states.
- **`@form-eng/atlaskit`** -- Atlassian Design System adapter package with 13 Tier 1 field types using semantic HTML elements with Atlaskit-compatible class names.
- **`@form-eng/base-web`** -- Uber Base Web adapter package with 13 Tier 1 field types using semantic HTML elements for Base Web integration.
- **`@form-eng/heroui`** -- HeroUI (formerly NextUI) adapter package with 13 Tier 1 field types using semantic HTML elements.
- **Canonical documentation** -- `docs/canonical-field-contracts.md`, `docs/date-policy.md`, `docs/parity-matrix.md`, `docs/adapter-architecture.md`

### Changed

- All adapter `helpers.ts` files now import from `@form-eng/core/adapter-utils` instead of `@form-eng/core`
- Adapter field files importing `convertBooleanToYesOrNoText` or `isNull` now import from `@form-eng/core/adapter-utils`
- CI/CD publish workflow updated to support 11 packages (added atlaskit, base-web, heroui)
- 1814 tests passing across 46 files (up from 776 tests in v1.2.1)

## [1.2.1] - 2026-03-09

### Added

- **CHANGELOG.md restored** -- Re-added CHANGELOG.md which was accidentally dropped from the repo.

### Fixed

- **`npm install` required after PR merge** -- `expr-eval` dependency from Phase 2B PR was declared in core's package.json but not installed. Build now passes cleanly after install.

## [1.2.0] - 2026-03-09

### Added

- **`@form-eng/antd` documentation** -- README.md, llms.txt, and AGENTS.md for the Ant Design v5 adapter package.
- **`@form-eng/chakra` documentation** -- README.md, llms.txt, and AGENTS.md for the Chakra UI v3 adapter package.
- **`@form-eng/mantine` documentation** -- README.md, llms.txt, and AGENTS.md for the Mantine v7 adapter package.
- **CSP-safe expression engine** -- `ExpressionEngine` now uses `expr-eval` instead of `new Function()` for Content Security Policy compliance. No `unsafe-eval` required.
- **Async options loading** -- Select, radio, and checkbox fields support `asyncOptions` on `IFieldConfig` for server-driven option loading.
- **Server-side field errors** -- `fieldErrors` prop on `FormEngine` allows injecting server-side validation errors that display inline alongside client-side errors.

### Fixed

- **Repository URLs** -- All 8 package.json `repository.url` fields updated from `https://` to `git+https://` to fix npm publish warnings.

### Changed

- All packages bumped from 1.1.1 to 1.2.0.
- 776 tests passing (up from 745 in v1.1.1).

## [1.1.1] - 2026-03-09

### Added

- **`@form-eng/antd`** -- New Ant Design v5 adapter package with 12 editable + 1 read-only field types. Uses antd `Input`, `InputNumber`, `Switch`, `Select`, `DatePicker` (dayjs), `Slider`, `Radio.Group`, `Checkbox.Group`, `Input.TextArea`.
- **`@form-eng/chakra`** -- New Chakra UI v3 adapter package with 12 editable + 1 read-only field types. Uses Chakra `Input`, `NativeSelect`, `Textarea` with semantic HTML fallbacks for compound components (Switch, NumberInput, Slider, RadioGroup, CheckboxGroup) due to Ark UI DTS issues.
- **`@form-eng/mantine`** -- New Mantine v7 adapter package with 12 editable + 1 read-only field types. Uses Mantine `TextInput`, `NumberInput`, `Switch`, `Select`, `MultiSelect`, `Slider`, `Radio.Group`, `Checkbox.Group`, `Textarea`.
- **Shared adapter utilities in core** -- `FieldUtils.ts` and `IFieldConfigs.ts` extracted to core so all adapters re-export from a single source (no code duplication).
- **Contract test infrastructure** -- `runAdapterContractTests()` in core for verifying adapter compliance.
- **Auto-publish CI** -- `publish.yml` supports all 8 publishable packages with tag triggers and manual dispatch.

### Changed

- Standalone examples migrated to v2 API.
- `author` field added to all package.json files.
- All packages bumped from 1.1.0 to 1.1.1.

## [1.1.0] - 2026-03-09

### Added

- **RadioGroup field type** -- Single-select radio button group; value: `string`. Available in Fluent, MUI, and Headless adapters.
- **CheckboxGroup field type** -- Multi-select checkbox group; value: `string[]`. Available in Fluent, MUI, and Headless adapters.
- **Rating field type** -- Star rating input; value: `number`. Configurable `max` stars and `allowHalf` via `config`. Available in Fluent, MUI, and Headless adapters.
- **ColorPicker field type** -- Native `<input type="color">` returning hex string. Available in Fluent, MUI, and Headless adapters.
- **Autocomplete field type** -- Searchable single-select with type-ahead filtering; value: `string`. Available in Fluent, MUI, and Headless adapters.
- **FileUpload field type** -- File picker supporting single or multiple files (`File | File[] | string`). Drag-and-drop support, size validation via `config.maxSizeMb`. Available in Fluent, MUI, and Headless adapters.
- **DateRange field type** -- Two date inputs (From / To); value: `{ start: string; end: string }` as ISO strings. Available in Fluent, MUI, and Headless adapters.
- **DateTime field type** -- Combined date + time input; value: ISO datetime-local string. Available in Fluent, MUI, and Headless adapters.
- **PhoneInput / MaskedInput field type** -- Phone number input with inline masking; supports `us`, `international`, and `raw` formats via `config`. Available in Fluent, MUI, and Headless adapters.
- **`setValue` rule effect** -- `IFieldEffect` now supports `setValue` to programmatically set a field's value when a rule fires.
- **Array condition operators** -- Three new condition operators for array-valued fields: `arrayContains`, `arrayNotContains`, `arrayLength`. Brings the total to 18 condition operators.
- **`registerValidatorMetadata()`** -- New `ValidationRegistry` API for registering human-readable metadata (label, description, paramSchema) alongside validators. Used by `@form-eng/designer` to populate the RuleBuilder UI with friendly validator names and parameter forms.

### Changed

- All packages bumped from 1.0.1 to 1.1.0

## [1.0.1] - 2026-03-06

### Fixed

- Fix CSS variable references in `FieldWrapper` and `InlineForm` — inline styles now correctly use `--fe-*` vars matching `styles.css` definitions
- Rename `hook-*` CSS classes to `fe-*` across fluent and mui adapter field components
- Rename `dynamic-form-*` CSS classes to `fe-*` in core components
- Rename internal `IHook*` interfaces to clean names in fluent and headless adapters
- Rename internal files: `BusinessRulesProvider` → `RulesEngineProvider`, `BusinessRulesReducer` → `RulesEngineReducer`, `InjectedHookFieldProvider` → `InjectedFieldProvider`
- Fix console log prefix: `[dynamic-forms]` → `[form-engine]`
- Fix old provider names in vite-mui and nextjs examples (`BusinessRulesProvider` → `RulesEngineProvider`)

## [1.0.0] - 2026-03-06

First release under the `@form-eng` npm scope. Complete rebrand from legacy naming throughout the codebase.

**Public API rebrand:**
- Main component: `FormEngine` (was `DynamicForm`)
- CSS custom properties: `--fe-*` prefix (was `--hook-form-*`)
- CSS classes: `fe-*` prefix (was `hook-form-*` and `dynamic-form-*`)
- Removed all deprecated `Hook*` aliases from adapter packages (`@form-eng/fluent`, `@form-eng/mui`, `@form-eng/headless`)

**Internal naming cleanup:**
- Core component files renamed: `InlineForm.tsx`, `FieldWrapper.tsx`, `RenderField.tsx`, `ConfirmInputsModal.tsx`, `WizardForm.tsx`, `FieldArray.tsx`, `FormErrorBoundary.tsx`, `FormDevTools.tsx`, `InlineFormFields.tsx` (all removed `Hook` prefix)
- Provider files renamed: `RulesEngineProvider.tsx` (was `BusinessRulesProvider.tsx`), `InjectedFieldProvider.tsx` (was `InjectedHookFieldProvider.tsx`)
- Reducer renamed: `RulesEngineReducer.ts` (was `BusinessRulesReducer.ts`)
- Helper renamed: `InlineFormHelper.ts` (was `HookInlineFormHelper.ts`)
- Type renamed: `IFormEngineSharedProps` (was `IHookInlineFormSharedProps`)
- Adapter CSS classes: `fe-textbox`, `fe-dropdown`, etc. (was `hook-textbox`, `hook-dropdown`)
- Console log prefix: `[form-engine]` (was `[dynamic-forms]`)

### Added

- **RJSF-compatible schema import** -- `fromRjsfSchema(schema, uiSchema?, formData?, options?)` converts react-jsonschema-form schemas into `IFormConfig` v2 with full rules engine support. Lets RJSF users migrate with zero rewrite.
  - **$ref resolution** -- Inlines `definitions` and `$defs` with circular reference detection
  - **19 component type mappings** -- JSON Schema types/formats to `Textbox`, `Dropdown`, `DateControl`, `Toggle`, `Slider`, `Number`, `Textarea`, `Multiselect`, `FieldArray`, `DocumentLinks`, etc.
  - **12 validation extractions** -- `minLength`, `maxLength`, `pattern`, `minimum`/`maximum`, `exclusiveMinimum`/`exclusiveMaximum`, `multipleOf`, `format` (email/uri), `uniqueItems`
  - **Dependency → rule conversion** -- JSON Schema `dependencies` (both property and schema variants) converted to `IRule[]` with `isNotEmpty` conditions
  - **if/then/else → rule conversion** -- Conditional schemas converted to visibility and required rules
  - **oneOf/anyOf → rule conversion** -- Discriminator detection creates dropdown + visibility rules; synthetic `_variant` dropdown for non-discriminated unions
  - **uiSchema application** -- All `ui:*` keys mapped (`ui:widget`, `ui:hidden`, `ui:readonly`, `ui:placeholder`, `ui:options`, `ui:enumDisabled`, `ui:order`, etc.)
  - **formData merging** -- Existing form data applied as `defaultValue` on fields
  - **Nested object handling** -- Flatten strategy (dot-notation keys) or fieldArray strategy
  - **`allOf` merging** -- Combines multiple schema fragments before conversion
- **Reverse converter** -- `toRjsfSchema(config)` exports `IFormConfig` back to JSON Schema + uiSchema (best-effort, structural fidelity only)
- **`exclusiveNumericRange` validator** -- Handles JSON Schema `exclusiveMinimum`/`exclusiveMaximum` with strict inequality
- **`multipleOf` validator** -- Handles JSON Schema `multipleOf` constraint with floating-point tolerance
- 101 new tests across 5 test files (refResolver, fieldMapper, ruleConverter, converter, reverseConverter)

### Changed

- **Package scope** -- All packages renamed from `@bghcore/dynamic-forms-*` to `@form-eng/*`:
  - `@form-eng/core` (was `@bghcore/dynamic-forms-core`)
  - `@form-eng/fluent` (was `@bghcore/dynamic-forms-fluent`)
  - `@form-eng/mui` (was `@bghcore/dynamic-forms-mui`)
  - `@form-eng/headless` (was `@bghcore/dynamic-forms-headless`)
  - `@form-eng/designer` (was `@bghcore/dynamic-forms-designer`)
  - `@form-eng/examples` (was `@bghcore/dynamic-forms-examples`)
- **Repository** -- Moved to [github.com/bghcore/form-engine](https://github.com/bghcore/form-engine)
- **Version reset** -- Reset to 1.0.0 for the new scope (see pre-rebrand history below)

### Removed

- **`jsonSchemaToFieldConfig()`** -- Replaced by `fromRjsfSchema()` which returns a full `IFormConfig` (not just `Record<string, IFieldConfig>`) and supports dependencies, conditionals, uiSchema, and formData

---

## Pre-Rebrand History

The following entries document the development history under the original `@bghcore/dynamic-forms-*` package names (versions 0.1.0 through 3.0.4).

## [3.0.4] (pre-rebrand) - 2026-03-06

Comprehensive bug-fix audit: 23 bugs fixed across 34 files spanning the rules engine, core components, validation, providers, and all three adapter packages.

### Fixed

#### Rules Engine
- **Dynamic labels now work** -- Added `label` to `IRuntimeFieldState`, `mergeEffect`, `applyEffectToState`, and `evaluateAffectedFields` reset. `FormFields` now reads label from runtime state with fallback to config. (RuleEngine.ts, IRuntimeFieldState.ts, InlineFormFields.tsx)
- **`activeRuleIds` now populated** -- `evaluateFieldRules` tracks matched rule IDs for DevTools tracing. (RuleEngine.ts)
- **`IFieldEffect.type` preferred over `component`** -- Added `type` as the preferred property with backward-compatible `component` deprecated. `mergeEffect` and `applyEffectToState` handle both. (IFieldEffect.ts, RuleEngine.ts)
- **`NOT` with empty conditions returns `false`** instead of `true`. (ConditionEvaluator.ts)
- **`notIn` with non-array value returns `false`** instead of `true`, matching `in` behavior. (ConditionEvaluator.ts)
- **Nested field dependency extraction** -- Dotted paths like `"address.city"` now correctly extract root field name for dependency graph. (ConditionEvaluator.ts)
- **Reset block completeness** -- `evaluateAffectedFields` now resets `defaultValue`, `computeOnCreateOnly`, `label`, `activeRuleIds`. (RuleEngine.ts)

#### Core Components
- **Fixed stale closures in `FormEngine`** -- `attemptSave` and `manualSave` now use `validateAndSaveRef` pattern for always-current function reference. (InlineForm.tsx)
- **Fixed filter input memory leak** -- `onFilterChange` now uses `filterTimeoutRef` with proper cleanup instead of leaking timeouts. (InlineForm.tsx)
- **Fixed `RenderField` `useMemo`** -- Added 21 missing dependencies to prevent stale `Controller` closures. (RenderField.tsx)
- **Fixed `trackRender` side effect** -- Moved from render phase to `useEffect`. (RenderField.tsx)
- **Fixed `FieldWrapper` ARIA on sibling children** -- All children now receive `aria-labelledby`, `aria-required`, `aria-invalid`, `aria-describedby`. (FieldWrapper.tsx)

#### Validation & Provider
- **`minLength` validates empty strings** -- Empty string `""` now correctly fails `minLength` when `min > 0`. (ValidationRegistry.ts)
- **Circular reference protection** -- `markDates()` uses `WeakSet` to prevent stack overflow with circular entity data. (formStateSerialization.ts)
- **`processFieldChange` stability** -- Uses `rulesStateRef` pattern to avoid callback recreation on every dispatch. (BusinessRulesProvider.tsx)

#### Cross-Adapter Consistency (Fluent, MUI, Headless)
- **Added `aria-invalid` and `aria-required`** to all 9 Fluent and 9 MUI field components (Textbox, Number, Dropdown, SimpleDropdown, MultiSelect, MultiSelectSearch, DateControl, Slider, Toggle).
- **Added placeholder support** to Fluent and MUI Textbox, Dropdown, SimpleDropdown.
- **Fixed Slider null safety** -- Added `?? 0` fallback in Fluent and Headless adapters.
- **Fixed Fluent DateControl error display** -- Now shows error message with `role="alert"`.
- **Fixed DocumentLinks type mismatch** -- Headless adapter aligned to use `title` (matching Fluent).
- **Fixed MUI Dropdown/SimpleDropdown placeholders** -- Added disabled placeholder `MenuItem`.

#### Test Fixtures
- **`componentSwapConfigs` uses `type` instead of `component`** to match v2 naming conventions.

## [3.0.3] - 2026-03-05

### Fixed

- **CI build order** -- Build script now runs core first, then adapters in parallel, then examples last. Fixes workspace build order issue where examples failed because MUI dist/ didn't exist yet.
- **Examples build** -- Removed `tsc` step from examples build script. Vite handles TypeScript via esbuild; `tsc` was failing because MUI types weren't available at build time.
- **CI Node versions** -- Updated matrix from Node 18.x/20.x to 20.x/22.x (18.x is EOL).

## [3.0.1] - 2026-03-05

### Changed

- **Removed `Hook` prefix from all adapter field file names** -- 60 files renamed across fluent, mui, and headless packages (e.g., `HookTextbox.tsx` -> `Textbox.tsx`, `HookReadOnly.tsx` -> `ReadOnly.tsx`, `HookFormLoading.tsx` -> `FormLoading.tsx`). Internal export names preserved for backwards compatibility.

## [3.0.0] - 2026-03-05

Major release: new packages, tooling, and ecosystem expansion.

### Added

- **`@form-eng/headless`** -- New unstyled adapter with all 19 field types using semantic HTML only. No UI framework dependency. `data-field-type` and `data-field-state` attributes for CSS targeting. Includes optional CSS custom properties and Tailwind CSS integration guide. (~36KB ESM)
- **`@form-eng/designer`** -- Visual drag-and-drop form builder that outputs `IFormConfig` v2 JSON. Components: FieldPalette, FormCanvas, FieldConfigPanel, RuleBuilder (all 15 operators + AND/OR/NOT), WizardConfigurator, ConfigPreview, ImportExport. Undo/redo with 50-snapshot stack. HTML5 native drag-and-drop. (~65KB ESM)
- **`@form-eng/examples`** -- Three complete example apps: Login+MFA (conditional visibility, dynamic labels), E-Commerce Checkout (wizard, dropdown dependencies, payment branching), Data Entry (field arrays, computed values, cross-field validation). Vite + React 19 + MUI.
- **Form analytics/telemetry** -- `IAnalyticsCallbacks` interface with 8 optional lifecycle callbacks (onFieldFocus, onFieldBlur, onFieldChange, onValidationError, onFormSubmit, onFormAbandonment, onWizardStepChange, onRuleTriggered). `useFormAnalytics` hook with memoized wrappers, focus time tracking, and form duration calculation. Zero overhead when not configured.
- **FormDevTools: Performance tab** -- Per-field render count tracking via `RenderTracker` helper. Highlights "hot" fields rendering >1.5x average. Reset and refresh controls.
- **FormDevTools: Dependency Graph tab** -- Visual adjacency table showing field dependencies. Color-coded by effect type (hidden/required/readOnly/options). Sortable by name or dependency count. Cycle detection.
- **FormDevTools: Timeline tab** -- Chronological event log via `EventTimeline` helper. Events: field_change, rule_evaluated, validation_run, form_submit. Filterable, clearable, capped at 500 events.
- **`IFieldEffect.label`** -- Rules can now dynamically change field labels via the `label` property in rule effects.
- **`InjectedFieldProvider` `injectedFields` prop** -- Field registry can now be passed directly as a prop instead of requiring `setInjectedFields()` in a child component.
- **Storybook 10** -- 64 stories covering all 19 field types (editable + read-only states), composite components (FormEngine, WizardForm, FieldArray, FormDevTools), and a Getting Started MDX docs page.
- **Playwright E2E tests** -- 54 tests across 7 spec files: basic form, rules engine, validation, wizard navigation, field arrays, draft recovery, keyboard navigation. Includes Vite test app and page object pattern.
- **Performance benchmarks** -- vitest bench suite with 5 benchmark files: rule engine (10-500 fields), condition evaluator (15 operators, nested trees), validation throughput, expression engine, and bundle size tracking. Config generators for N-field forms.
- **CI/CD pipeline** -- GitHub Actions with matrix CI (Node 18+20), test + coverage artifacts, publish workflow with workflow_dispatch, dry-run mode, OIDC provenance, and GitHub Release creation.
- **WCAG 2.1 AA accessibility audit** -- 8 core component files fixed (label association, ARIA roles, focus management, screen reader text). 15 new accessibility tests. `docs/ACCESSIBILITY.md` compliance document.
- **SSR compatibility** -- 3 core files fixed with typeof window/document guards. `docs/ssr-guide.md` covering Next.js App Router and Pages Router setup.
- 22 new analytics tests (515 total core tests passing)

## [2.0.0] - 2026-03-04

Complete schema redesign with unified rules engine. All v1 names kept as deprecated aliases.

### Added

- **`IFormConfig` v2 schema** -- Versioned wrapper: `{ version: 2, fields, fieldOrder, wizard, settings }`
- **Unified rules engine** -- `IFieldConfig.rules: IRule[]` replaces dependencies, dependencyRules, dropdownDependencies, orderDependencies
- **Rich conditions** -- `ICondition = IFieldCondition | ILogicalCondition` with 15 operators (equals, notEquals, greaterThan, lessThan, contains, notContains, startsWith, endsWith, in, notIn, isEmpty, isNotEmpty, matches, greaterThanOrEqual, lessThanOrEqual) + AND/OR/NOT logical composition
- **Rule effects** -- `IFieldEffect` with required, hidden, readOnly, component, options, validate, computedValue, fieldOrder, fields (cross-field)
- **Priority-based conflict resolution** -- Higher priority rule wins when multiple rules affect the same field
- **Incremental evaluation** -- `evaluateAffectedFields()` only re-evaluates transitively affected fields on change
- **Dependency graph** -- `buildDependencyGraph()` with topological sort for evaluation ordering
- **Computed values** -- `computedValue: "$fn.name()"` or `"$values.qty * $values.price"` replaces `isValueFunction` + `value`
- **Unified validation** -- `validate: IValidationRule[]` with `{ name, params, message, async, debounceMs, when }` replaces separate sync/async systems
- **`ConditionEvaluator`** -- `evaluateCondition()` with all 15 operators + nested AND/OR/NOT

### Changed

- **Component renames** (old names kept as deprecated aliases):
  - `FormEngine` (was `HookInlineForm`)
  - `FormFields` (was `HookInlineFormFields`)
  - `RenderField` (was `HookRenderField`)
  - `FieldWrapper` (was `HookFieldWrapper`)
  - `WizardForm` (was `HookWizardForm`)
  - `FieldArray` (was `HookFieldArray`)
  - `RulesEngineProvider` (was `BusinessRulesProvider`)
  - `InjectedFieldProvider` (was `InjectedHookFieldProvider`)
- **Field config keys**: `type` (was `component`), `options` (was `dropdownOptions`), `validate` (was `validations`), `config` (was `meta`)
- **Option format**: `{ value, label }` (was `{ key, text }`)
- **Type renames**: `IFieldProps` (was `IHookFieldSharedProps`), `IRuntimeFieldState` (was `IBusinessRule`), `IRulesEngineAction` (was `IBusinessRuleAction`)

### Removed

- `helpers/BusinessRulesHelper.ts` (replaced by RuleEngine + ConditionEvaluator)
- `types/IBusinessRule.ts`, `IBusinessRuleAction.ts`, `IBusinessRuleActionKeys.ts`, `IBusinessRulesState.ts`
- `types/IConfigBusinessRules.ts`, `IDropdownOption.ts`, `IOrderDependencies.ts`, `IFieldArrayConfig.ts`
- `types/IExecuteValueFunction.ts`, `IHookFieldSharedProps.ts`, `IHookPerson.ts`

## [1.5.1] - 2026-03-03

### Fixed

- **Package entry points** — `package.json` referenced `dist/index.cjs` but tsup outputs `dist/index.js`. Fixed `main`, `module`, and `exports` in all 3 packages. Resolves "Module not found" errors in Next.js and other bundlers.

### Added

- **Manual save mode** — `isManualSave={true}` prop on `HookInlineForm` disables auto-save on field change. Shows Save/Cancel buttons by default, or use `renderSaveButton` for custom UI.

## [1.5.0] - 2026-03-03

Discovery and developer experience improvements.

### Added

- **Zod schema adapter** — `zodSchemaToFieldConfig()` converts Zod object schemas to `Dictionary<IFieldConfig>` without adding zod as a dependency. Maps ZodString→Textbox, ZodNumber→Number, ZodBoolean→Toggle, ZodEnum→Dropdown, ZodDate→DateControl, ZodArray→Multiselect. Detects `.email()` and `.url()` checks for automatic validation.
- **Type-safe field configs** — `defineFieldConfigs()` is a zero-cost TypeScript utility that verifies dependency field name references at compile time, catching typos in `dependencies` and `dropdownDependencies` targets.
- **JSON Schema files** — `schemas/field-config.schema.json` and `schemas/wizard-config.schema.json` published in the npm package for IDE autocompletion when writing form configs in JSON.
- "When to Use This Library" section in README with clear positioning vs competitors.
- 24 new tests (Zod adapter, TypedFieldConfig).

### Changed

- npm keywords expanded for all 3 packages to improve discoverability (added `json-forms`, `schema-forms`, `wizard-form`, `zod`, `conditional-logic`, `field-dependencies`, etc.).

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

- **Async validation wired into rendering** — `RenderField` now runs async validators after sync pass. `AbortController` cancels in-flight checks on re-type.
- **`FormErrorBoundary`** — per-field error boundary wrapping each `RenderField`. One crashing field no longer kills the entire form. Props: `fallback`, `onError`.
- **Save reliability** — `AbortController` cancels previous in-flight saves, configurable timeout via `saveTimeoutMs` (default 30s), retry with exponential backoff via `maxSaveRetries` (default 3).
- **Accessibility (WCAG AA)** — focus trap in `ConfirmInputsModal`, focus-to-first-error on validation failure, ARIA live regions for form status, `aria-label` on filter input, `aria-busy` during save, wizard step announcements for screen readers.
- **`useDraftPersistence`** hook — auto-save form state to localStorage on configurable interval, recover draft on mount, clear after server save.
- **`useBeforeUnload`** hook — browser warning on page leave with unsaved changes.
- **`serializeFormState` / `deserializeFormState`** — Date-safe JSON round-trip utilities.
- **Theming render props** — `renderLabel`, `renderError`, `renderStatus` on `FieldWrapper` for custom field chrome without replacing components.
- **CSS custom properties** — `--fe-error-color`, `--fe-warning-color`, `--fe-saving-color`, etc. in optional `styles.css`.
- **`formErrors`** prop on `HookInlineForm` — form-level error banner for cross-field validation.
- **`FormDevTools`** — collapsible dev-only panel showing business rules state, form values, errors, and dependency graph.
- **`jsonSchemaToFieldConfig()`** — convert JSON Schema to `Dictionary<IFieldConfig>`. Maps types, enums, formats, required.
- **`createLazyFieldRegistry()`** — React.lazy field registry for on-demand component loading.
- 79 new tests across 8 new test files.

### Changed

- **`RenderField`** refactored from `useState` + `useEffect` to `useMemo` — eliminates one render cycle per field update.

## [1.2.0] - 2026-03-02

TypeScript strict mode and MUI adapter.

### Added

- **`@form-eng/mui`** — new package with 19 MUI field components (13 editable + 6 read-only), `createMuiFieldRegistry()`, supporting components, shared helpers.
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
- **`WizardForm`** — multi-step wizard composing around existing form. Steps partition field order, not business rules. Render props for navigation/headers. Conditional step visibility.
- **`FieldArray`** — repeating sections via react-hook-form `useFieldArray`. Min/max items, defaultItem, reorderable, qualified names (`addresses.0.city`).
- **`IWizardConfig`**, **`IFieldArrayConfig`**, **`ICoreLocaleStrings`** types.
- **`ComponentTypes.FieldArray`** constant.
- `docs/FINDINGS.md` — codebase analysis and strategic expansion plan.

### Changed

- **Provider memoization** — `useCallback`/`useMemo` on `BusinessRulesProvider` and `InjectedHookFieldProvider`.
- **`React.memo`** on `RenderField` and `FieldWrapper`.

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
- **`@form-eng/core`** -- UI-library agnostic business rules engine (React only, no UI library deps)
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
- **`@form-eng/fluent`** -- Fluent UI v8 field components
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
- `InjectComponents.tsx` (replaced by `@form-eng/fluent` `createFluentFieldRegistry()`)
- `HookInlineForm.scss` (broken -- used undefined SCSS variables)
- `rollup.config.js` (replaced by tsup)
- Domain-specific strings and constants
