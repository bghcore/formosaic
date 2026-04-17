# Formosaic System Audit

**Date:** 2026-04-16
**Branch:** `main`
**Version audited:** 1.4.2 (verified across all 14 `package.json` files)
**Pipeline ground truth (at time of audit):**
- `npm run test` — exit 0, **6,145 tests passing across 65 files** (165s)
- `npx tsc -p tsconfig.base.json --noEmit` — exit 0
- `npm run test:e2e` — not executed locally, but the 7 specs contain **66** tests (flex-counted), not the "54" claimed in docs

---

## CLOSURE UPDATE — 2026-04-17

Remediation and closure pass complete. See `formosaic-audit-closure.md` for the
full closure report and final risk rating. Summary:

- **Test count:** 6,145 → **6,766** (+44 adversarial P0 proof tests, +571 from prior remediation, +6 SSR smoke)
- **P0-7 (pollution guards):** proven at every boundary; adversarial test surfaced one
  unguarded path (`$lookup.<tableName>`) which was fixed in `ExpressionInterpolator.ts`.
- **P0-10 (ReDoS caps):** length-cap effectiveness proven; short-regex weakness
  documented with bounded-time regression tests.
- **P0-6 (topological init):** 5 regression tests with adversarially-reordered fields.
- **SSR:** 10 module-level registries inventoried and classified SAFE-BY-CONTRACT;
  6 SSR smoke tests added.
- **Package integrity:** all 12 public packages `npm pack`ed and installed as a real
  consumer; CJS/ESM/types smoke passes. One upstream ESM bug in `@fluentui/react-icons`
  noted.
- **Adapter a11y skips:** verified adapter-owned (react-aria `isRequired`/`isInvalid`,
  baseui `overrides`, Mantine sibling-node error) — not Formosaic bugs.
- **Intentionally still open:** P1-23 (internal helpers exposed at public barrel),
  P1-26/P1-27 (perf refactors), P1-21b (SSR first paint renders no fields),
  short-regex ReDoS weakness, adapter-owned a11y gaps.

**Final risk rating:** Safe to release with documented caveats (see closure report §6).

---

## 1. Executive Summary

Formosaic is a well-organized, broadly-tested, feature-rich library. Unit tests, parity harness, and RJSF/Zod converters are genuinely strong. But a full audit uncovered substantial hidden risk under the green CI:

- **A11y is structurally broken across all 11 adapters.** `FieldWrapper` injects `id` / `aria-labelledby` / `aria-describedby` on the adapter element via `cloneElement`, but no adapter field forwards those props to the rendered control. The one test that claims to prove this works uses a bare `<input>` child, not a real adapter. Users see labels that don't associate with inputs across every UI framework.
- **Autosave is a data-loss hazard.** `saveData` is called without the `AbortSignal`, retry sleeps aren't interruptible, retries fire on every error (including 4xx), and when `saveData` returns `undefined`, RHF `reset(undefined)` wipes in-progress edits.
- **Rendering performance is well below expectations.** `setFieldValue` is a new closure every render, and `<FormProvider>` receives a freshly-spread `formState` object every render. Together these defeat every memoization in the library — every field re-renders on every keystroke, regardless of whether it subscribes.
- **Cross-XSS in every adapter's `ReadOnlyRichText`.** Raw `dangerouslySetInnerHTML={{ __html: value }}` with zero sanitization or documentation. This is stored-XSS territory if any upstream system accepts user HTML.
- **Two critical README examples are broken.** The headlined cross-field rule example uses the wrong `IFieldEffect` shape (missing `fields:` wrapper) and the FieldArray example references a `defaultItem` property that does not exist. Both compile/accept, both silently do nothing.
- **Documentation is widely drifted:** test counts (6,296 claimed / 6,145 actual), E2E counts (54 claimed / 66 actual), "3 example apps" (actually 6), a `website/` folder that does not exist, `fromZodSchema`/`ITemplateParam`/`createMinLengthValidation` names that do not exist, docs still referencing `ChoiceSet` (removed), and `docs/api/field-config.mdx` missing 9 shipping Tier-2 field types.
- **Expression/condition engine has no input-trust boundary.** `new RegExp(userValue)` for `matches`/`pattern` is a ReDoS vector; `getNestedValue(params, path)` has no `__proto__`/`constructor` guards; `refResolver` lacks a depth limit. SECURITY.md does not disclose the trust model. If any consumer sources config from untrusted input (a config admin UI, query params, a JSON-schema API), these become exploitable.
- **Fragility under React concurrency/SSR is untested.** No `renderToString` smoke. No `<StrictMode>` smoke. Module-level registries (`TemplateRegistry`, `LookupRegistry`, `ValidationRegistry`, `ValueFunctionRegistry`, `LocaleRegistry`, `RenderTracker`, `EventTimeline`) are process-global — a hazard under Next.js fluid compute or any long-running multi-tenant server.

**Confidence:** high. Findings below are backed by file:line evidence; the most severe claims have been independently re-verified beyond the specialist agents.

**Is it safe to scale as-is?** **No.** Most findings are silent failures — the codebase feels healthy because CI is green and the test suite is large, but the suite under-asserts (see §5) so it will not catch these regressions. Target the P0/P1 set before scaling consumer adoption.

---

## 2. Architecture Summary

**Runtime data flow (per-change):**
`user input` → adapter field calls `setFieldValue` → `setValue` (react-hook-form) → `trigger(fieldName)` → `processFieldChange(values, configName, fieldName, fields)` → `evaluateAffectedFields` (traverses static dependency graph built at init) → reducer dispatch (`UPDATE`) → **in the `rulesState` effect**, `Formosaic.tsx` applies pending `setValue` effects, runs `CheckValidDropdownOptions` / `CheckDefaultValues` / `handleComputedValues` → `attemptSave()` schedules a debounced save.

**Config lifecycle:** If `formConfig.templates` / `templateRef` / `fragments` are present, `resolveTemplates`/`composeForm` flattens the config to a plain `IResolvedFormConfig` via an 11-step pipeline: template expansion → expression interpolation (`{{params.*}}`, `{{$lookup.*}}`) → path-prefixing → rule rewriting → expression scoping → port merging → wizard expansion. Connections compile to `IRule[]` attached to a single "owner" field. Resolution is invoked during render — not memoized.

**Rules engine:** Graph built once at init by `buildDependencyGraph(fields)`; topologically sorted via Kahn's algorithm (`DependencyGraphValidator` also detects cycles, but is not invoked automatically). Rules are declarative `{ when: ICondition, then: IFieldEffect, else?, priority? }`. `ConditionEvaluator` supports 20 operators + and/or/not. `ExpressionEngine` uses `expr-eval` (CSP-safe) for `$values.*`, `$fn.*`, `$parent.*`, `$root.*`. `evaluateAffectedFields` is incremental but walks affected × rules every change.

**Validation:** Unified `ValidatorFn` in `ValidationRegistry` covers sync, async, and cross-field. `when` gates conditional application. Async path has no debounce-timer test. Validation is wired through RHF `Controller.rules.validate` inside `RenderField`.

**Adapters:** Each adapter exports 27 field components (21 editable + 6 read-only) and a `create{Name}FieldRegistry()` factory returning `Record<string, React.JSX.Element>`. `InjectedFieldProvider` wraps the tree. `RenderField` `cloneElement`s the registered component to inject `IFieldProps`. `FieldWrapper` then `cloneElement`s the first child *again* to inject `id`/aria. Adapters never forward those aria attributes.

**State stores:** (1) RHF form store — source of truth for values + dirty + errors. (2) `useReducer`-backed `IRulesEngineState` keyed by `configName`, containing per-field runtime state computed from rules. (3) Module-level mutable singletons — registries for templates, lookups, validators, value functions, locale, event timeline, render tracker.

**Async surfaces:** autosave (`saveWithTimeoutAndRetry` in `Formosaic.tsx`), async validators (`runValidations`), `loadOptions` in `FormosaicFields` effect, draft persistence (`useDraftPersistence`).

**Parity drift vectors:** (a) adapter field components define their own aria by hand → inconsistent; (b) adapters use different `FieldClassName`/`getFieldState` helpers; (c) contract tests use two different include/exclude patterns, so new field types apply to only some adapters; (d) Fluent/MUI `PopOutEditor` replaces Textarea in the registry, everyone else ships a distinct Textarea.

---

## 3. Findings by Severity

### P0 — Critical (silent correctness or security failures)

#### P0-1. A11y: adapter fields drop FieldWrapper-injected `id` / `aria-labelledby` / `aria-describedby`
**Severity:** P0 (production-visible bug across 11 adapters × ~20 field types)
**Files:**
- `packages/core/src/components/FieldWrapper.tsx:107-122` (injection site)
- `packages/fluent/src/fields/Textbox.tsx:13-37` (example; same pattern in every adapter)
- `packages/core/src/__tests__/components/Accessibility.test.tsx:168-194` (false-positive test using bare `<input>` child)

**Why it matters:** screen readers cannot associate labels with inputs; `htmlFor={id}` on the outer `<label>` points nowhere; error messages rendered by FieldWrapper are referenced via `aria-describedby` that never lands on the control. This affects every adapter, every editable field type.

**Evidence:** `FieldWrapper` uses `React.cloneElement(children[0], { id, 'aria-labelledby', 'aria-invalid', 'aria-required', 'aria-describedby' })`. Fluent `Textbox` destructures only `{ fieldName, testId, value, readOnly, config, error, required, placeholder, setFieldValue }` — no rest-spread — so the injected attributes vanish. Sample confirmed in Fluent; grep'd the same pattern across all 11 adapters.

**Repro:** mount any `<Formosaic>` + `<Textbox>`, inspect DOM — the `<input>` has no `id`, and the `<label>`'s `htmlFor` points to a missing id.

**Fix:** Canonical: make each adapter destructure and pass `rest` onto the primitive (`<Input {...rest} aria-invalid={!!error}>`). Alternate: have FieldWrapper wrap the child in a semantic `<div role="group" aria-labelledby>` and let the adapter handle only its own describedby target. First option is less invasive.

**Tests to add:** to the shared contract suite, add `getByLabelText(label)` assertions for every editable field type, and an `aria-describedby` → error-message target assertion.

---

#### P0-2. Re-render explosion: `setFieldValue` and `FormProvider.formState` are new objects every render
**Severity:** P0 (defeats every memoization boundary in the library)
**Files:**
- `packages/core/src/components/Formosaic.tsx:180-186` (`setFieldValue` plain arrow)
- `packages/core/src/components/Formosaic.tsx:350` (`<FormProvider {...formMethods} formState={{ ...formMethods.formState, ... }}>`)
- `packages/core/src/components/RenderField.tsx:297` (`React.memo(RenderField)` rendered useless)

**Why it matters:** every field re-renders on every parent render (and also on every `formState` change — submitting flag toggles, any dirty change, any error change). The entire "memoized per-field" story is dead. 50-field form with async-option dropdown = measurable lag.

**Evidence:** lines verified directly — `const setFieldValue = (fieldName, ...) => { ... }` declared in component body. `<FormProvider formState={{ ... }}>` spreads a new literal. Both are prop inputs to `<RenderField>`, which is memo-wrapped.

**Fix:** `setFieldValue = useCallback(...)`; drop the inline `formState={{}}` spread (pass `{...formMethods}` only — RHF already memoizes `formState` internally).

**Tests to add:** unit test using `React.Profiler` (or the existing `RenderTracker`) that mounts a 10-field form, types one character, and asserts only the typed field re-rendered.

---

#### P0-3. XSS: every `ReadOnlyRichText` renders user HTML with no sanitization
**Severity:** P0 (default-unsafe; default-accepted)
**Files:** all 11 adapters — `packages/*/src/fields/readonly/ReadOnlyRichText.tsx`; grep-verified identical pattern.

**Evidence:** e.g. `packages/fluent/src/fields/readonly/ReadOnlyRichText.tsx:9` — `dangerouslySetInnerHTML={{ __html: value as string || "" }}`. No sanitize prop, no DOMPurify, no docs warning in the field-types table.

**Repro:** entity with `bio: "<img src=x onerror=alert(1)>"`, rendered via `<Formosaic>` with `{ type: "ReadOnlyRichText" }` → stored XSS fires on view.

**Fix:** integrate DOMPurify by default with an opt-out `sanitize={false | fn}` prop; document the trust boundary in every README, stability.mdx, and SECURITY.md. Keep the same prop contract across all 11 adapters.

**Tests to add:** contract-level test that asserts `<script>`, `onerror=`, and `javascript:` hrefs are stripped from rendered DOM.

---

#### P0-4. Autosave data-loss hazards
**Severity:** P0 (silent data loss)
**Files:** `packages/core/src/components/Formosaic.tsx:256-287`, `packages/core/src/components/Formosaic.tsx:108-110`, `packages/core/src/components/Formosaic.tsx:272`, `packages/core/src/components/Formosaic.tsx:268`

**Four distinct bugs in the save pipeline:**
1. `saveData(data, dirtyFieldNames)` is called without any `AbortSignal` — the internal abort only stops the UI from reacting; the network request finishes and can overwrite newer edits (F8).
2. Retry `setTimeout` sleep between attempts is not abortable — a user edit during retry waits for the sleep (F9).
3. Consumer `saveData` that returns `undefined` → `reset(undefined)` wipes user's in-progress edits (F10).
4. Default `saveData = async () => ({} as IEntityData)` → `handleDirtyFields` resets the form to `{}` if `manualSave` is hit and no `saveData` was supplied (F48).

**Evidence:** Direct reads of those lines confirm all four.

**Fix:** (1) accept and forward an `AbortSignal`; (2) make the sleep abortable via `AbortSignal`; (3) default `updatedEntity ?? data`; (4) when `saveData` prop is not supplied, skip the save flow entirely rather than default to `() => ({})`.

**Tests to add:** `Formosaic.tsx:256-287` has **zero unit test coverage**. Add unit tests for: retries until success, retries exhausted throws, timeout cancels, unmount aborts, failing consumer does not wipe local state.

---

#### P0-5. Cross-field rule builds false dependency graph for nested (dotted) field paths
**Severity:** P0 (computed values / rules silently stale)
**Files:** `packages/core/src/helpers/RuleEngine.ts:30` (dep graph build), `packages/core/src/helpers/ExpressionEngine.ts:149` (dep extraction)

**Why it matters:** templated/nested forms and any form whose fields are keyed `address.city`, `items[0].qty`, etc. lose rule cascades for changes to ancestor keys.

**Evidence:** `buildDependencyGraph` adds `graph[dep].add(fieldName)` only when `dep in graph`. A condition `{ field: "address.city" }` where only `address` is a key never gets an edge; the rule still evaluates correctly at runtime (via `getNestedValue`), but `evaluateAffectedFields` skips the rule on changes to `address`.

**Repro:** `fields: { address: {type:"Textbox"}, summary: {type:"Textbox", computedValue:"$values.address.city"} }` → change `address`, `summary` is not recomputed.

**Fix:** when adding dependency edges, walk `"a.b.c"` to the longest prefix that exists in `fields` and add an edge for it too.

**Tests to add:** dep-graph unit test with dotted refs; integration test asserting `summary` updates when `address.city` is set via `setFieldValue`.

---

#### P0-6. Create-time computed values are evaluated in insertion order, not topological order
**Severity:** P0 (silent stale reads on first render)
**Files:** `packages/core/src/helpers/FormosaicHelper.ts:206-224`

**Evidence:** `InitOnCreateFormState` loops `Object.entries(fields)` in insertion order. If `B.computedValue = "$values.A.id"` and `A` comes after `B`, `B` reads undefined. The flat-key write `initEntityData[fieldName] = result` on line 217 *further* corrupts subsequent reads when `fieldName` is dotted (e.g. `"shipping.name"`) — the flat key is hidden from `getNestedValue`, so a later computed that reads `$values.shipping.name` sees undefined.

**Fix:** (a) topologically sort before iterating; (b) use RHF `setValue` + `getValues()` as the source of truth instead of maintaining a parallel `initEntityData`.

**Tests to add:** both bugs have zero coverage today.

---

#### P0-7. Broken README/docs code examples
**Severity:** P0 (user copy-paste fails silently)
**Files:**
- `README.md:222-223` — cross-field rule example:
  ```
  then: { severity: { required: true, hidden: false } }
  ```
  but `IFieldEffect` requires `then: { fields: { severity: { ... } } }` (confirmed at `packages/core/src/types/IFieldEffect.ts:32`). Current example compiles because `IFieldConfig.rules` has no runtime check; it silently applies to the wrong (or no) field.
- `README.md:338` — FieldArray example uses `defaultItem: { name: "", email: "" }`, no such property exists on `IFieldConfig` or is read by `FieldArray.tsx`. Confirmed via grep.
- `README.md:383-425` — validator factories `createMinLengthValidation`, `createMaxLengthValidation`, `createPatternValidation`, `createNumericRangeValidation`, `createRequiredIfValidation` — none exist. Actual names are `createMinLengthRule` (etc.) in `packages/core/src/helpers/ValidationRegistry.ts:312-334`. Further, README's `registerValidators({ MinLength5: createMinLengthValidation(5) })` passes an `IValidationRule` where `ValidatorFn` is expected — non-compilable.

**Fix:** rewrite all three examples with the correct types. Add a CI step that actually `tsc`-compiles every code fence in README/docs (there are tools for this).

---

#### P0-8. Validator short-circuit silently skips validation for `0`, `false`, `""`
**Severity:** P0 (silent validation bypass)
**File:** `packages/core/src/components/RenderField.tsx:192`
`if (!validate || validate.length === 0 || isReadOnly || !value) return undefined;`

**Evidence:** `!value` is truthy for 0, false, "", null, undefined. A Number field with `numericRange: { min: 5 }` accepts `0` silently. A custom `mustBeZero` validator never fires when the user actually enters zero. Confirmed directly.

**Fix:** remove the `!value` gate — each validator already guards its own empty cases. If a gate is needed at all, use `value === undefined || value === null`.

**Tests to add:** each validator × (`0`, `false`, `""`, `[]`, `null`, `undefined`) with expected pass/fail.

---

#### P0-9. Required flag silently ignored for Toggle components
**Severity:** P0 (required checkboxes aren't required)
**File:** `packages/core/src/components/RenderField.tsx:188`
`required: required && type !== ComponentTypes.Toggle && !isReadOnly`

**Evidence:** confirmed directly. A Toggle with `required: true` and default false passes validation. This breaks ToS/consent UX.

**Fix:** remove the `type !== ComponentTypes.Toggle` carve-out OR document explicitly. If intent was "a false toggle counts as answered", make it an opt-in `config.requireTrue` flag.

---

#### P0-10. Prototype-pollution / ReDoS vectors in expression + condition engines
**Severity:** P0 if config can ever come from untrusted input; P1 otherwise
**Files:**
- `packages/core/src/helpers/ConditionEvaluator.ts:70` — `new RegExp(toString(condition.value))` (ReDoS)
- `packages/core/src/helpers/ValidationRegistry.ts:109` — `new RegExp(params.pattern)` (ReDoS)
- `packages/core/src/templates/ExpressionInterpolator.ts:122-156` — `getNestedValue(params, path)` with no `__proto__` / `constructor` / `prototype` guard
- `packages/core/src/utils/rjsf/refResolver.ts:11-50` — no depth limit; deeply-nested `properties.a.properties.b...` recurses unbounded
- `packages/core/src/templates/TemplateResolver.ts:61-73` — `Object.assign(mergedTemplates, config.templates)` exposed to arbitrary keys

**Why it matters:** form configs are often authored by end-users (admin builders, imported JSON Schema). `SECURITY.md` does not declare the trust model. A malicious regex like `(a+)+$` + long input freezes the main thread; a `__proto__` key in params traverses the prototype chain via `getNestedValue`; a deeply nested JSON Schema stack-overflows `refResolver`.

**Fix:** (a) cap regex source length, reject nested quantifiers heuristically, bound input length before `.test()`; (b) add `if (key === "__proto__" || key === "constructor" || key === "prototype") continue;` guards in every nested-get/deep-merge; prefer `Object.create(null)` for params/lookup result objects; (c) add `maxDepth` to `refResolver` and `interpolateDeep`; (d) document the trust model in SECURITY.md.

**Tests to add:** feed each vector above and assert safe failure.

---

### P1 — High (significant correctness / release risk)

| # | Title | File | Why |
|---|---|---|---|
| P1-1 | `initForm` effect deps `[areAllFieldsReadonly]` — misses `defaultValues`/`fields` changes | `Formosaic.tsx:135` | Forms initialized with `{}` before async data loads never re-hydrate with real data |
| P1-2 | `CheckDefaultValues` runs with `shouldDirty: true` on first `rulesState` change | `FormosaicHelper.ts:184` + `Formosaic.tsx:154-168` | Untouched form becomes dirty; `useBeforeUnload` warns; autosave may fire |
| P1-3 | `CheckValidDropdownOptions` and `CheckDefaultValues` fight each other on rule-driven option swaps | `Formosaic.tsx:154-168` | Value bounces back to default each rule change; oscillates if default isn't in new options |
| P1-4 | `pendingSetValue` consumption mutates reducer state directly | `Formosaic.tsx:165` | Breaks referential-equality contract; cascaded rules don't fire |
| P1-5 | `handleComputedValues` doesn't call `trigger()` or `processFieldChange` after set | `Formosaic.tsx:196-244` | Downstream rules/validation don't re-evaluate after a computed value updates |
| P1-6 | `FormosaicFields` options-loader effect has **no dep array** + no AbortController | `FormosaicFields.tsx:50` | Runs every render; stale fetch can overwrite fresh options |
| P1-7 | Wizard doesn't clamp `currentStepIndex` when steps disappear | `WizardForm.tsx:43-84` | Silent step-jump or blank wizard |
| P1-8 | `composeForm` attaches all connection rules to one owner — non-deterministic when fields is empty | `ComposedFormBuilder.ts:56` | Connection rules silently dropped when no owner exists |
| P1-9 | `extractConditionDependencies` + `evaluateLogicalCondition` crash on missing `conditions` field | `ConditionEvaluator.ts:19-26, 110` | User authoring error → runtime TypeError instead of warning |
| P1-10 | Mantine renders double asterisks (`*`) for required | `packages/mantine/src/fields/{Textbox,Number,Textarea,Dropdown}.tsx` | Both FieldWrapper and Mantine emit `*` |
| P1-11 | MUI Textbox renders duplicate error text | `packages/mui/src/fields/Textbox.tsx:37` + `FieldWrapper.tsx:77-79` | Both FieldWrapper and MUI `helperText` show message |
| P1-12 | Fluent Textbox/Dropdown/Autocomplete ignore `config?.placeHolder` shorthand | `packages/fluent/src/fields/{Textbox,Dropdown,Autocomplete}.tsx` | Inconsistent with other adapters; silent UX regression |
| P1-13 | Textarea adapters drop `placeholder` prop entirely | all 11 Textarea implementations | User-configured placeholder never renders |
| P1-14 | Headless Toggle double-renders label (FieldWrapper + component) | `packages/headless/src/fields/Toggle.tsx:34` | Duplicate label for sighted and screen-reader users |
| P1-15 | Adapter `peerDependencies: "@formosaic/core": "^1.0.0"` | all 11 adapters | 1.x "minor" releases are breaking; `@formosaic/fluent@1.4.2` + `@formosaic/core@1.0.0` will install and break at runtime |
| P1-16 | `@formosaic/core/testing` subpath imports vitest + testing-library as runtime deps | `packages/core/src/testing/fieldContractTests.tsx:8-9` | Consumers get `Cannot find module 'vitest'` with no signal from peerDeps |
| P1-17 | Publish workflow has no version-bump automation | `.github/workflows/publish.yml` | Hand-editing 14 `package.json` files is the only guard against drift |
| P1-18 | `@formosaic/headless` `sideEffects: false` ships a CSS file at `./styles.css` | `packages/headless/package.json:80` | Aggressive tree-shaking may drop the CSS import |
| P1-19 | CI `playwright` step runs with `continue-on-error: true` | `.github/workflows/ci.yml:50` | E2E failures never block PRs |
| P1-20 | `_parser` shared singleton mutated at import time (`binaryOps["+"]`, `consts["NaN"]`) | `ExpressionEngine.ts` | Any other code importing expr-eval observes patched parser; also SSR across requests |
| P1-21 | Module-level registries shared across SSR requests | `TemplateRegistry`, `LookupRegistry`, `ValidationRegistry`, `ValueFunctionRegistry`, `LocaleRegistry`, `RenderTracker`, `EventTimeline` | Multi-tenant leakage under Node server reuse |
| P1-22 | `trackRender` fires on every render in prod with no dev gate | `RenderField.tsx:172-174` + `RenderTracker.ts:7` | Unbounded module-level `Map` = slow memory leak; per-render Map ops in hot path |
| P1-23 | Public API over-exports internals (~30+ helpers) | `packages/core/src/index.ts` | Any refactor of `CheckFieldValidationRules`, `evaluateAllRules`, reducer action enums breaks consumers silently |
| P1-24 | `IFormosaicProps` (documented surface) ≠ `IFormosaicComponentProps` (real surface) | `types/IFormosaicProps.ts` vs `components/Formosaic.tsx:29-55` | 13 extra real props, including required `defaultValues` |
| P1-25 | `IFieldProps.setFieldValue?: ...` typed optional — called unconditionally in 296 adapter call sites | `types/IFieldProps.ts:44` | Stricter TS configs will break consumer adapters silently |
| P1-26 | `RenderField.tsx` huge `useMemo` with ~22 deps — memo effectively useless | `RenderField.tsx:178-271` | Any of the deps changes per render → full recompute |
| P1-27 | `FieldArray` has no per-row memoization and passes unstable callbacks | `FieldArray.tsx:36-44` | 1000-row array re-renders all 1000 rows on one keystroke |

---

### P2 — Medium

- **P2-1.** Expression engine has no cache → same expression re-parsed on every keystroke (`ExpressionEngine.ts:72-131`).
- **P2-2.** Regex compiled inside condition eval (`ConditionEvaluator.ts:70`) — no hoist (js-hoist-regexp).
- **P2-3.** `evaluateAllRules` rebuilds dep graph twice (`RuleEngine.ts:171,175`).
- **P2-4.** Rules engine reducer copies full `fieldStates` map on every UPDATE — O(F) copy per keystroke for large forms.
- **P2-5.** `resolveTemplates` deep-clones via `JSON.parse(JSON.stringify(...))` (`TemplateResolver.ts:263,349,701`) — loses Date/regex values and is expensive under templated forms rendered without `useMemo`.
- **P2-6.** Templates rewrite rules with `deepClone = JSON.parse(JSON.stringify(rules))` — rule conditions containing `Date` or `RegExp` silently convert to strings/`{}`.
- **P2-7.** `CheckDefaultValues` guard `isEmpty(formValues)` is inverted — when form is empty, defaults are skipped (`FormosaicHelper.ts:179`).
- **P2-8.** `ComponentTypes.MultiSelect = "Multiselect"` (capitalization drift) → silent "component not found" at runtime because `IFieldConfig.type: string`.
- **P2-9.** RJSF `convertDependencies` writes `else: { required: false }` — overrides a field's own baseline `required:true` (`ruleConverter.ts:25-33`).
- **P2-10.** Rule `not` operator with empty/multi `conditions` silently returns wrong value.
- **P2-11.** `in`/`notIn` operators with non-array `value` silently return false/true with no warn — common user error.
- **P2-12.** `pattern` validator has no flags support.
- **P2-13.** `matches` operator silently swallows regex errors → auth/gating bypass possible.
- **P2-14.** Wizard `saveOnStepChange` declared but never read (`IWizardConfig.ts:30`).
- **P2-15.** Autosave retry has no jitter, no `Retry-After` honoring, retries on 4xx.
- **P2-16.** `useDraftPersistence` stores full entity (including password/PII) to localStorage with no field allowlist.
- **P2-17.** `@formosaic/heroui` forces `@heroui/react` as real peerDep despite being a semantic-HTML compat adapter — bloats consumer bundles with no benefit.
- **P2-18.** `@formosaic/atlaskit` claims `atlaskit` keywords but has zero `@atlaskit/*` dep — misleading.
- **P2-19.** CheckboxGroup containers miss `role="group"` in 8/11 adapters.
- **P2-20.** Radix/Chakra Dropdown: FieldWrapper injects aria-* onto wrapper `<div>`, never reaches trigger.
- **P2-21.** `onFocus`/`onBlur` analytics callbacks never reach adapter fields (dropped at cloneElement destructure).
- **P2-22.** `description`/`helpText` in `IFieldProps` passed by core but rendered by zero adapters.
- **P2-23.** `handleSave` internal `setTimeout` for timeout is never cleared on resolve → leak of one timer per save.
- **P2-24.** `validateDependencyGraph` prod-warn guard inverted: `globalThis.__DEV__ !== false` → true in prod.
- **P2-25.** `disabled` in `IFieldProps` is undocumented: core internally converts `disabled → readOnly` (`RenderField.tsx:59,179`) but `fieldContractTests.tsx:167` passes `disabled: true` — silently dropped.
- **P2-26.** `RenderField` writes `previousValueRef.current = value` during render (anti-pattern under concurrent features).
- **P2-27.** `SubEntityType = string | number | boolean | Date | object | null | undefined` — `object` absorbs everything; value functions can silently return functions.

---

### P3 — Low / hygiene

- **P3-1.** Version-drift: CLAUDE.md says 1.2.0; MEMORY.md says 1.2.0; actual is 1.4.2. Also README badges "6,296 tests"; actual 6,145. E2E "54"; actual 66. Example apps "3"; actual 6. (Full table in §6.)
- **P3-2.** `ITemplateParam` (docs) vs `ITemplateParamSchema` (code); `fromZodSchema` (docs) vs `zodSchemaToFieldConfig` (code).
- **P3-3.** `docs/api/field-config.mdx` lists 19 of 28 `ComponentTypes` and still includes removed `ChoiceSet`.
- **P3-4.** `docs/guide/field-types.mdx` omits RadioGroup, CheckboxGroup, Rating, ColorPicker, Autocomplete, FileUpload, DateRange, DateTime, PhoneInput.
- **P3-5.** `docs/adapters/parity-matrix.mdx:52` math `13+10+5 = 27` (sums to 28). Real split is 21 editable + 6 read-only.
- **P3-6.** `website/` folder referenced in AGENTS.md and CONTRIBUTING.md but doesn't exist (docs moved to `docs/**/*.mdx`); `npm run docs:dev`/`docs:build` not defined.
- **P3-7.** URLs mixed across docs — some use `formosaic.com/*`, others `bghcore.github.io/formosaic/*`.
- **P3-8.** SECURITY.md does not declare the expression-engine trust model or any of the P0-10 concerns.
- **P3-9.** `ChakraUI` DTS issue references claim 6 native components — code shows Ark UI dropdown wrappers. MEMORY.md native counts drift from reality for antd (21 native, not 18) and base-web (11, not 9).
- **P3-10.** `lazyFieldRegistry.test.ts` claims to test lazy loading but never resolves the lazy promise.
- **P3-11.** `CspSafeExpression.test.ts` asserts `functionCallCount === 0` against a variable it never increments — false security test.
- **P3-12.** `renderSanity.test.ts` titled "renders 10-field form without excessive rerenders" asserts `expect(true).toBe(true)`.
- **P3-13.** `coverage/lcov.info` is stale — references pre-v1.0.0 filenames (`HookFieldWrapper.tsx` etc.). No coverage threshold in `vitest.config.ts`.
- **P3-14.** Atlaskit and HeroUI adapter code is byte-identical except class-prefix — arguably not separate adapters.
- **P3-15.** `FIELD_PARENT_PREFIX = "Parent."` — dead code, not exported, unused.

---

## 4. Adapter Parity Matrix

Native (N) / semantic HTML (H) / PopOutEditor (P) for each (adapter × field type).

| Type | fluent | mui | headless | antd | chakra | mantine | atlaskit | base-web | heroui | radix | react-aria |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Textbox | N | N | H | N | N | N | H | N | H | H | N |
| Number | N | N | H | N | H | N | H | N | H | H | H |
| Toggle | N | N | H | N | H | N | H | N | H | H | N |
| Dropdown | N | N | H | N | N | N | H | N | H | N | N |
| Multiselect | N | N | H | N | H | N | H | N | H | H | H |
| DateControl | N | N | H | N | H | N | H | H | H | H | H |
| Slider | N | N | H | N | H | N | H | N | H | N | N |
| DynamicFragment | N | N | H | N | N | N | H | N | H | H | N |
| MultiSelectSearch | N | N | H | N | H | N | H | N | H | H | H |
| Textarea | P | P | H | N | N | N | H | N | H | H | N |
| DocumentLinks | N | N | H | N | N | N | H | N | H | H | H |
| StatusDropdown | N | N | H | N | N | N | H | N | H | H | H |
| RadioGroup | N | N | H | N | H | N | H | N | H | N | N |
| CheckboxGroup | N | N | H | N | H | N | H | N | H | N | N |
| Rating | H | H | H | N | H | N | H | H | H | H | H |
| ColorPicker | H | H | H | N | H | H | H | H | H | H | H |
| Autocomplete | N | N | H | N | H | N | H | H | H | H | N |
| FileUpload | H | H | H | N | H | N | H | H | H | H | H |
| DateRange | H | H | H | N | H | H | H | H | H | H | H |
| DateTime | H | H | H | N | H | N | H | H | H | H | H |
| PhoneInput | H | H | H | H | H | H | H | H | H | H | H |
| Read-only × 6 | H | H | H | H | H | H | H | H | H | H | H |

### Behavioral / A11y parity issues
- **All 11 adapters drop FieldWrapper `id`/`aria-labelledby`/`aria-describedby`** (P0-1).
- **All 11 Dropdown components label-lookup readOnly values** via `options.find(... String equality)` — the one parity improvement that actually landed.
- **Headless Toggle** double-renders its label (P1-14).
- **Mantine** double-asterisks required fields on 4 field types (P1-10).
- **MUI Textbox** double-renders error text (P1-11).
- **Fluent Textbox/Dropdown/Autocomplete** ignore `config?.placeHolder` (P1-12).
- **9 Textarea implementations** don't pass `placeholder` through (P1-13).
- **Atlaskit/HeroUI** are semantic-HTML compat adapters; despite advertising their respective design systems.
- **CheckboxGroup** missing `role="group"` in 8 of 11 adapters.
- **Textarea adapters** returning fragments (`<>…</>`) mis-target `cloneElement` aria injection to the first `<div>`, not the `<textarea>`.
- **Contract tests** use inconsistent include/exclude lists so new field types apply only to some adapters (Fluent/MUI/Headless use exclude list; 8 others use include list).

### Parity drift from CLAUDE.md/MEMORY.md
- Fluent "all native Fluent UI v9" — false; 7+ fields are semantic HTML.
- MUI "all native MUI v5/v6" — false; same.
- antd "18 native + 9 HTML" — actual ≈ 21 native + 6 HTML.
- base-web "9 native" — actual ≈ 11 native.

---

## 5. Test Coverage Gaps (highest-value missing tests)

1. **`Formosaic.tsx:256-287` save retry/backoff/timeout/abort** — zero coverage; data-loss territory.
2. **Unmount during pending async validator** — no lifecycle cancellation test.
3. **StrictMode double-invocation safety** — no test wraps `<StrictMode>`.
4. **SSR smoke** — no `renderToString` test anywhere (jsdom everywhere in vitest).
5. **Expression injection hardening** — feed `__proto__`, `Function.constructor`, nested-quantifier regex.
6. **`FieldArray` unit tests** — add / remove / reorder / min/max / items-config rule evaluation inside an array item. Currently zero coverage.
7. **`WizardForm` unit tests** — step advance with invalid state, step removal mid-flow, cross-step dependencies.
8. **Upgrade contract tests** from `expect(container).toBeTruthy()` to real assertions (`getByLabelText`, `aria-invalid`, `aria-describedby` target exists, setFieldValue is called on input).
9. **axe-core a11y pass** over each rendered field in the contract suite.
10. **E2E autosave failure & retry** flows.
11. **Wizard referencing a nonexistent field** — undefined behavior.
12. **Benchmark full `<Formosaic>` mount** with 100/500 fields (current adapter-render bench mounts fields in isolation).
13. **Public API export snapshot** to catch accidental removals/renames.
14. **Draft persistence under localStorage quota exceeded**.
15. **Computed-value cycle** (rule → setValue → rule).

### Tests that assert too little
- `packages/core/src/testing/fieldContractTests.tsx:87-201` — every contract test only asserts `expect(container).toBeTruthy()`. These ~1000 "tests" do not verify DOM, a11y, or any behavior.
- `Accessibility.test.tsx:168-194` — asserts `aria-labelledby` with a bare `<input>` child rather than a real adapter, giving false confidence.
- `CspSafeExpression.test.ts:17-29`, `renderSanity.test.ts:53-72,121-129`, `lazyFieldRegistry.test.ts:6-32`, `consumerSmoke.test.ts:104-111` — vacuous assertions.
- `vitest.config.ts` has no coverage thresholds; `coverage/lcov.info` is stale (pre-rename).

### Flaky-test patterns
- 13 occurrences of `if (await button.isVisible()) { ...assertions... }` across `field-array.spec.ts` and `wizard.spec.ts` — silent skip if button missing.
- `keyboard-nav.spec.ts:50-63` — "blurs the current field" asserts `typeof stillFocused === 'boolean'` (always true).
- Async validator tests don't mock timers.
- Module-level registries not reset between test files.

---

## 6. Docs & Metadata Drift

| Public claim | Location | Reality |
|---|---|---|
| "6,296 tests" | README:23, AGENTS.md, CONTRIBUTING.md, llms*.txt, docs | **6,145** (vitest verified) |
| "6,050 tests" | MEMORY.md | same — 6,145 |
| "54 Playwright E2E tests" | AGENTS.md, CONTRIBUTING.md, CLAUDE.md, docs/tier*.md | **66** (7 specs) |
| "64–67 Storybook stories" | AGENTS.md, CLAUDE.md | **151** story exports, 49 files — but **all import `@formosaic/fluent` only**; README's claim of multi-adapter stories is false |
| "3 example apps (login+MFA, checkout, data-entry)" | README, CLAUDE.md, AGENTS.md, CONTRIBUTING.md, llms*.txt | **6** apps — also patient-intake, job-application, expense-report |
| Current version 1.2.0 | CLAUDE.md, MEMORY.md | 1.4.2 (confirmed across all 14 package.jsons) |
| Cross-field rule shape `then: { severity: {...} }` | README:222-223 | Requires `then: { fields: { severity: {...} } }` — **copy-paste silently no-ops** |
| `FieldArray defaultItem: { ... }` | README:338 | **No such property exists** |
| `createMinLengthValidation`, etc. | README:384-427 | Real names end in `…Rule` not `…Validation`; usage pattern also wrong type |
| `fromZodSchema` | docs/api/stability.mdx:127 | Real export `zodSchemaToFieldConfig` |
| `ITemplateParam` | docs/api/stability.mdx:119 | Real type `ITemplateParamSchema` |
| Field-config.mdx lists 19 keys; includes `ChoiceSet` | docs/api/field-config.mdx:94-117 | 28 `ComponentTypes`; `ChoiceSet` removed; missing 9 Tier-2 types |
| "21 total component keys" | docs/guide/field-types.mdx:9 | 28; docs lack RadioGroup, CheckboxGroup, Rating, ColorPicker, Autocomplete, FileUpload, DateRange, DateTime, PhoneInput |
| DIV-006 "fixed in v1.5.2" | docs/adapters/divergence-register.mdx:102 | v1.5.2 is pre-rebrand; current 1.4.2 |
| `website/` folder + `npm run docs:dev`/`docs:build` | AGENTS.md, CONTRIBUTING.md | Folder does not exist; scripts not defined |
| Storybook covers all 27 fields × 11 adapters | README:172 | Only Fluent stories exist |
| URLs `bghcore.github.io/formosaic/*` vs `formosaic.com/*` | CONTRIBUTING.md, llms*.txt vs README | Mixed — pick one |
| CLAUDE.md field counts per adapter | CLAUDE.md | Mostly accurate; Fluent/MUI "all native" claim is false |
| MEMORY.md native counts | memory/MEMORY.md | antd "18 native" → 21; base-web "9" → 11 |

---

## 7. Packaging / Release Risks

### Publish-time
1. **No version-bump automation.** `publish.yml` detects drift between local and npm; if one package.json isn't bumped, release is partial. 14 files, hand-edited.
2. **Provenance flag + NPM_TOKEN combo.** `--provenance` requires trusted-publisher OIDC; if not set up on npm, releases may fail mid-matrix.
3. **E2E failures don't block CI.** `ci.yml:50 continue-on-error: true`.
4. **No `tsc --noEmit`, no eslint step in CI.** Build-time catches are stricter than what CI enforces.

### Consumer-time
1. **Adapter peer on core is `^1.0.0`.** npm installs `@formosaic/fluent@1.4.2` happily with `@formosaic/core@1.0.0`; mismatched APIs break at runtime.
2. **`@formosaic/core/testing` imports vitest + testing-library at module scope** with no `peerDependenciesMeta` signal — consumer sees `Cannot find module 'vitest'`.
3. **`@formosaic/headless` `sideEffects: false` + ships CSS** — some bundlers tree-shake the `import "@formosaic/headless/styles.css"`.
4. **`@formosaic/heroui` pulls `@heroui/react` (~MB) for a semantic-HTML adapter.** Bloat.
5. **Headless CSS build uses a `copyFileSync` hack** (`packages/headless/package.json:86`) outside the tsup graph — rename of `src/styles.css` silently ships stale.
6. **`@formosaic/core/testing` subpath ships `/// <reference types="vitest" />`** — leaks vitest globals into consumer `.d.ts`.

### Fix set (minimal diff)
```json
// packages/core/package.json
"peerDependencies": {
  "react": "^18.0.0 || ^19.0.0",
  "react-hook-form": "^7.0.0",
  "vitest": "^1 || ^2 || ^3 || ^4",
  "@testing-library/react": "^14 || ^15 || ^16"
},
"peerDependenciesMeta": {
  "vitest": { "optional": true },
  "@testing-library/react": { "optional": true }
}
```
- Every adapter: `"@formosaic/core": "^1.4.0"` (or narrower).
- `packages/headless/package.json`: `"sideEffects": ["*.css", "./dist/styles.css"]`.
- `packages/headless/tsup.config.ts`: `import "./styles.css"` from `src/index.ts`; drop inline `copyFileSync`.
- `ci.yml`: remove `continue-on-error`; add `npx tsc --noEmit -p packages/core/tsconfig.json`.
- Add changesets or `scripts/bump-version.mjs`.
- Add `publishConfig` + `engines` to every public package.

---

## 8. Top 10 Highest-Leverage Fixes

Ranked by (severity × blast radius) / effort.

| # | Fix | Severity | Effort |
|---|---|---|---|
| 1 | **Stabilize `setFieldValue` (useCallback) + stop spreading `formState` in `<FormProvider>`** (P0-2) | P0 | S |
| 2 | **Fix three broken README examples** (cross-field rule shape, `defaultItem`, validator factory names) — these block every new consumer (P0-7) | P0 | S |
| 3 | **Sanitize `ReadOnlyRichText` across all 11 adapters** (DOMPurify default, opt-out prop) — default-unsafe XSS (P0-3) | P0 | M |
| 4 | **Fix the adapter a11y forward** — every field must spread cloneElement-injected `id`/`aria-*` onto its rendered control (P0-1) | P0 | M |
| 5 | **Fix the autosave pipeline**: `AbortSignal` propagation, interruptible retry sleep, `updatedEntity ?? data` fallback, no default `() => ({})` (P0-4) | P0 | M |
| 6 | **Fix `InitOnCreateFormState`**: topological sort + use RHF store as source of truth (no parallel `initEntityData` flat-key writes) (P0-5, P0-6) | P0 | M |
| 7 | **Fix dep-graph prefix edges** for dotted paths (`address.city` → add edge on `address`) (P0-5) | P0 | S |
| 8 | **Remove validator `!value` short-circuit and Toggle required carve-out** (P0-8, P0-9) — revealed only by missing negative tests | P0 | S |
| 9 | **Trust-model hardening**: `__proto__`/`constructor` guards in `getNestedValue`/deep-merge, regex source/input caps, `refResolver` depth limit, SECURITY.md disclosure (P0-10) | P0 | M |
| 10 | **Upgrade contract tests + add axe-core pass + add a Formosaic-level mount bench** — this is the leverage that prevents the above fixes from regressing silently (§5) | P0 | M |

All top-10 are either P0 or prevent P0 regressions. After these land, sequence P1 in order: release hygiene (P1-15/P1-17/P1-19) → perf foundation (P1-22/P1-26/P1-27) → docs accuracy (§6) → rule-engine correctness (P1-1/P1-2/P1-3/P1-4/P1-5/P1-6).

---

## Methodology / What I Verified vs Inferred

Verified directly:
- Test/typecheck pipeline run (6,145 tests pass, `tsc --noEmit` clean).
- E2E count (66 tests via grep of `test(` in spec files).
- Version alignment (node script across 13 package.json files).
- Field counts per adapter (21 editable + 6 read-only × 11 = confirmed).
- Broken README examples (cross-field rule shape, `defaultItem`, validator factory names) — checked against actual types and helper exports.
- Core correctness bugs F1/F3/F4/F5 (init flat-key write, pendingSetValue mutation, `!value` short-circuit, Toggle required skip).
- `<FormProvider>` spreading fresh `formState` every render.
- `setFieldValue` declared as plain arrow every render.
- `dangerouslySetInnerHTML` in every ReadOnlyRichText.
- Fluent Textbox doesn't forward rest props (confirms adapter a11y drop).
- `evaluateLogicalCondition` crashes on missing `conditions` array.

Inferred (high-confidence from agents + file:line citations, not re-walked end-to-end):
- Rule-engine dependency-graph prefix issue (P0-5) — walk was agent-led; the file path and behavior match.
- Prototype-pollution vectors (P0-10) — agent traced them; I verified only the general shape.
- Render-count claims (P1-22, P1-26, P1-27) — backed by direct file inspection; actual render count not measured with React Profiler.

Not run locally:
- E2E Playwright suite.
- Benchmarks.
- Coverage report (stale file would likely mislead anyway).

**Where further verification is needed before acting:** rule-engine dep-graph prefix behavior under real templated forms; SSR rendering (jsdom-based vitest can't prove it); StrictMode double-invocation safety; actual render counts under React Profiler to confirm P0-2 blast radius.
