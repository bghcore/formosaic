# Formosaic Technical Audit — June 2026 (v1.4.2)

> Senior staff engineer review. Findings verified against source, not assumed from
> docs. Date: 2026-06-10. Reviewed at commit `762e31c` on `main`.

A note on scope: this is **not** a Next.js/Azure Functions project. It is a pure
React component-library monorepo (13 npm workspace packages, no server-side code,
no API handlers). The "Backend" section therefore covers the closest equivalents:
the save pipeline, CI/publish infrastructure, and the library's trust boundaries
as a published package.

The repo contains a **prior in-repo audit** (`formosaic-system-audit.md`, closed
via `formosaic-audit-closure.md` at v1.4.2, with `FOLLOWUPS.md` tracking 5
deliberately-open items FU-1…FU-5). Those were verified rather than trusted;
findings are marked **new** or **known-open** accordingly.

One agent-reported claim was investigated and **rejected as false**: an alleged
inverted topological sort (the Kahn's implementation at `RuleEngine.ts:97-137` is
correct). It is excluded from the findings below.

> Scope note: this revision covers correctness, architecture, frontend, testing,
> documentation, tooling, and performance only.

---

## A. Executive summary

- **The core engine is in genuinely good shape.** The rules engine, dependency
  graph, expression engine, and template resolver are well-structured, defensively
  coded and heavily tested (61 core test files). The prior audit was real and most
  P0s are verifiably fixed. Severity below is concentrated in the **adapter layer**,
  not core.
- **Confirmed High bug (new, FIXED 2026-06-10): clearing a Number field writes `0`.**
  `Number("") === 0` passes the `!isNaN` check in
  `packages/fluent/src/fields/Number.tsx:15-19`. Re-verification corrected the counts:
  the repo has **11** adapters (not 12); **8** had the copy-pasted coercion bug
  (fluent, mui, headless, atlaskit, base-web, chakra, heroui, radix), **react-aria**
  had a distinct manifestation (RAC emits `NaN` on clear, which the `!isNaN` guard
  dropped — clearing silently kept the stale value), and antd + mantine were already
  correct. Fixed via a shared `parseNumberInputValue` helper in
  `@formosaic/core/adapter-utils` plus a behavioral contract test (clear → `null`,
  never `0`) that runs against all 11 adapters. See finding 1.
- **Confirmed High bug (new): side effects during render in `RenderField`.**
  `analytics.trackValidationError` fires on *every render* while an error exists, and
  `previousValueRef` is mutated inside the Controller render prop
  (`RenderField.tsx:219-225`). This spams analytics, double-fires under StrictMode,
  and violates React's render-purity rules. High confidence — verified directly.
- **The single biggest structural risk is 12-way copy-paste duplication.** Each
  adapter re-implements ~27 nearly identical field files (~300 files total, ~90 %
  duplicated logic). The Number bug is the proof: one bug, ten copies. Until the
  behavioral logic is factored into shared core helpers, every fix costs 11× and
  drift is guaranteed.
- **Testing is inverted relative to risk.** Core (low-risk) has 61 test files; each
  adapter (where the real bugs are) has exactly 1 contract test; E2E covers Fluent
  only; `examples` has zero tests; benchmarks never run in CI. A bug shipped in
  MUI/Chakra/etc. would publish undetected.
- **Tooling gaps are basic and cheap to fix:** no ESLint/Prettier anywhere, no
  coverage thresholds, manual CHANGELOG + version bump script with no validation, CI
  typechecks only the root tsconfig. GitHub Actions are commit-pinned and publish is
  test-gated (good).
- **Docs are unusually accurate** post-1.4.2 remediation (test counts, API names,
  examples verified against the barrel). Remaining drift is minor: one suspect README
  example shape, a stale `website/` reference, and no examples for 9 of 11 adapters.
- **Known-open items in FOLLOWUPS.md are correctly triaged.** This audit
  independently re-confirmed FU-2 (RenderField/FieldArray memoization), FU-4 (SSR
  renders zero fields), and FU-5 (adapter aria gaps). These are real but were honestly
  deferred with rationale.

---

## B. Repository map

```
packages/core          The product. Rules engine (RuleEngine, ConditionEvaluator,
                       DependencyGraphValidator — Kahn's, verified correct),
                       expression engine (expr-eval based, $values/$fn/$parent),
                       template system (TemplateResolver 11-step pipeline,
                       ExpressionInterpolator, ConnectionCompiler), React layer
                       (Formosaic → FormFields → RenderField → FieldWrapper →
                       cloneElement(injected field)), registries (validators,
                       value functions, locale, templates, lookups — all
                       module-level singletons), utils (rjsf import/export,
                       zod import, draft serialization, shared adapter utils).
                       Subpath exports: /adapter-utils, /testing, /devtools, /rjsf, /zod.
packages/{fluent,mui,headless,antd,chakra,mantine,atlaskit,base-web,heroui,radix,react-aria}
                       11 UI adapters; each = registry.ts mapping ComponentTypes →
                       JSX elements + ~27 field files. ~90% identical logic per field.
packages/examples      6 demo apps, MUI-only, untested.
e2e/                   Playwright, 7 specs, 66 tests — Fluent adapter only.
benchmarks/            6 vitest-bench suites — not wired into CI.
stories/               Storybook (151 exports) — Fluent only.
docs/                  MDX published to formosaic.com via pages.yml redirect.
.github/workflows/     ci.yml (Node 20/22: build → typecheck → vitest → e2e),
                       publish.yml (tag-triggered, test-gated, npm provenance),
                       codeql.yml, scorecard.yml. Actions commit-pinned.
```

Data flow: `IFormConfig` (optionally produced by `composeForm()`/`resolveTemplates()`)
→ `Formosaic` (react-hook-form state, save with AbortController/retry) →
`evaluateAllRules()` → reducer state → `FormFields` → per-field `RenderField` →
`cloneElement` of the adapter's registered component. There is no server runtime;
configs may be authored by hand or generated by a server, and entity data comes
from end users.

---

## C. Top risks

| Priority | Area | Issue | Why it matters | Evidence | Recommended fix | Confidence |
|---|---|---|---|---|---|---|
| 1 | Correctness | ~~Clearing a Number field writes `0` instead of clearing~~ **FIXED 2026-06-10** | Data corruption: users cannot empty numeric fields; `0` is semantically different from "no answer" | `packages/fluent/src/fields/Number.tsx:15-19` (`Number("")===0`); 8 of 11 adapters + react-aria NaN-drop variant | Done: shared `parseNumberInputValue` in `@formosaic/core/adapter-utils`, all affected adapters migrated, behavioral contract test (clear → `null`, never `0`) added to the shared harness | High (verified) |
| 2 | Frontend | ~~Analytics side effects inside render prop~~ **FIXED 2026-06-10** | `trackValidationError` fires every render while an error exists (analytics flooding); ref mutation in render breaks under StrictMode | `packages/core/src/components/RenderField.tsx:219-225` | Done: tracking moved into `FieldAnalyticsTracker` (effects keyed on value / error-message transitions); StrictMode test added (`RenderFieldAnalytics.test.tsx`) | High (verified) |
| 3 | Architecture | ~27 field files × 11 adapters, ~90 % duplicated | Every behavioral fix costs 11×; drift already observable (antd Number is correct, others aren't; PopOutEditor only in fluent/mui) | Compare `fluent/src/fields/Number.tsx` vs `mui/.../Number.tsx` (identical logic) | Extract behavioral hooks (`useNumberField`, `useDropdownField`…) into `@formosaic/core/adapter-utils`; adapters keep only the JSX binding | High |
| 4 | Testing | Adapters ≈1 test file each; E2E Fluent-only; examples 0 tests | The riskiest layer has the least coverage; an adapter regression ships silently | `packages/*/src/__tests__/contract.test.ts` (one per adapter); `e2e/app` imports `@formosaic/fluent` only | Behavioral contract suite per field type (clear/typo/select interactions, not just render); 1 E2E smoke per adapter | High |
| 5 | Frontend | Async option refetch keyed to `fields` reference identity | If a dependency value changes without a rules-state re-render producing a new `fields` object, dependent dropdown options go stale; load failures are silently swallowed | `FormosaicFields.tsx:54-89` (deps `[fields]`; `.catch(() => {})`) | Watch the `optionsDependsOn` values explicitly; surface a load-error state | Medium |
| 6 | Architecture | Template `templateOverrides` shallow-merge; `deepClone` via `JSON.parse(JSON.stringify())` | Overriding `validate` replaces all template rules; functions like `loadOptions` in templates are silently stripped during resolution | `TemplateResolver.ts:295-298, ~700` | Deep-merge arrays/objects for overrides; `structuredClone` or function-aware clone (or validate/throw when functions present) | Medium |
| 7 | Tooling | No lint/format/coverage gates; manual release bookkeeping | Style drift, silent coverage regression, version/CHANGELOG desync risk | No `.eslintrc`/`.prettierrc` in repo; `scripts/bump-version.mjs` does no validation | ESLint flat config + Prettier + coverage thresholds in CI; consider changesets | High |
| 8 | Architecture | Global mutable registries (validators, locales, templates, lookups) | Cross-request contamination in SSR/multi-tenant Node | `ValidationRegistry.ts`, `TemplateRegistry.ts:16`, etc. | Longer-term: optional instance-scoped registries via provider | High |

---

## D. Detailed findings

### Correctness

1. **Number field: empty string coerces to 0** — **High / High — RESOLVED 2026-06-10** —
   `packages/fluent/src/fields/Number.tsx:15-19` and equivalents. Re-verified scope
   (correcting this report's earlier counts): the `Number("")===0` coercion existed in
   **8 of 11** adapters — fluent, mui, headless, atlaskit, base-web, chakra, heroui,
   radix. **Mantine was NOT affected** (it already mapped `""` → `null`,
   `mantine/src/fields/Number.tsx:15-21`), and antd was correct (`InputNumber` emits
   `null`). **React-aria had a different bug in the same handler**: RAC's
   `NumberField` emits `NaN` when cleared and the `!isNaN` guard dropped it, so
   clearing silently kept the stale value instead of writing 0
   (`react-aria/src/fields/Number.tsx:26-30`).
   **Fix applied:** new `parseNumberInputValue(raw)` helper in
   `packages/core/src/helpers/FieldUtils.ts` (empty/whitespace → `null`, unparseable
   → `undefined`/no-op, else number), exported from `@formosaic/core/adapter-utils`
   and re-exported by each adapter's `helpers.ts`; the 8 affected adapters now call
   it; react-aria maps `NaN` → `null`. **Tests:** unit tests in
   `core/src/__tests__/helpers/FieldUtils.test.ts`; behavioral contract tests in
   `core/src/testing/fieldContractTests.tsx` ("commits the typed number", "commits
   null when cleared — never 0") run automatically against all 11 adapters via their
   existing `contract.test.ts`. This is also the first concrete step toward the
   shared field-behavior layer (section F).
2. **`arrayNotContains` is vacuously true for non-arrays** — **Low–Medium / High
   (verified behavior; likely intentional)** — `ConditionEvaluator.ts:101-104`. A
   null/undefined/string field satisfies `arrayNotContains`, so rules fire on
   untouched fields. It is the symmetric negation of `arrayContains`, so it looks
   deliberate — but it's an undocumented footgun. Fix: document the vacuous-truth
   semantics in `docs/api`; optionally add an `isArray` precondition example. Test:
   condition against an undefined field, assert and document the result either way.
3. **Cross-field `fieldOrder` effects: last-writer-wins, non-deterministic** —
   **Medium / Medium** — `RuleEngine.ts` incremental path: when multiple affected
   fields emit `fieldOrder`, iteration order of the affected Set decides the winner.
   Fix: priority-based resolution like other effects. Test: two rules with
   conflicting `fieldOrder`, assert deterministic outcome.
4. **Unregistered validator names silently skipped** — **Medium / High — RESOLVED
   2026-06-10** — `ValidationRegistry.ts` `if (!validator) continue;` in both
   `runValidations` and `runSyncValidations`. Fixed: dev-mode `console.warn`, once
   per unknown name (cleared by `resetValidatorRegistry`). Test added in
   `ValidationRegistry.test.ts`.
5. **Connection suffix map: silent last-write-wins on collisions** — **Medium /
   High (verified) — RESOLVED 2026-06-10** — `ConnectionCompiler.ts:buildSuffixMap`.
   Fixed: `console.warn` when two port fields reduce to the same suffix, naming both
   fields and the winner. Test added in `ConnectionCompiler.test.ts` with exactly the
   suggested `a.address.street` / `address.street` collision.
6. **Sub-wizard fragment expansion silently skips unresolved nested fragments** —
   **Medium / Medium** — `TemplateResolver.ts:637-645`: `if (fragFields)` silently
   drops missing entries. Fix: dev warn or strict-mode throw.
7. **Rejected claim (for the record):** the topological sort is correct
   (`RuleEngine.ts:97-137`, verified — standard Kahn's, in-degree of edge targets).

### Architecture

8. **12-way adapter duplication** — **High / High** — see Top risks #3. Quantified:
   ~27 field files × 11 packages ≈ 300+ files, behavioral logic ~90 % identical
   (onChange parsing, default-option effects, readOnly branching). The shared piece
   that already exists (`@formosaic/core/adapter-utils`) carries only helpers, not
   behavior. This is the root cause of findings 1, 9, 10, 11, 21, 22.
9. **Feature parity drift: `Textarea` maps to `PopOutEditor` (modal editor) in
   fluent/mui only** — **Medium / High** — `fluent/src/registry.ts:43` vs
   `headless/src/registry.ts:43`; antd lacks the entry entirely. Same config produces
   materially different UX per adapter. Fix: document per-adapter behavior in the
   parity matrix, or split into a distinct `ComponentTypes` key.
10. **Autocomplete semantics diverge** — **Medium / Medium** — Fluent forces option
    selection; antd can commit free text (`antd/src/fields/Autocomplete.tsx:32-36`).
    Same config, different data shape downstream. Standardize or document.
11. **DateRange value relies on string comparison of formatted dates** — **Low–Medium
    / Medium** — `fluent/src/fields/DateRange.tsx:18-21`. Works for `YYYY-MM-DD` but
    breaks the moment a locale-formatted string sneaks in. Standardize ISO across
    adapters + contract test asserting the shape.
12. **Global singletons (registries) — known-open** — **Medium / High** — validators,
    value functions, locales, templates, lookups are module-level
    (`TemplateRegistry.ts:16` etc.). Current guidance is to populate registries once
    at app boot. Longer-term fix is instance scoping (see F).
13. **Internal helpers leak from the public barrel — known-open FU-1** — 13 helpers
    (`InitOnCreateFormState`, `ShowField`, …) exported from `@formosaic/core` root.
    Already has a sound deprecation plan; just needs executing in 1.5.0.

### Frontend (React)

14. **Side effects during render in RenderField** — **High / High (verified) —
    RESOLVED 2026-06-10** — `RenderField.tsx:219-225`. Three distinct problems: (a)
    `trackValidationError` fired every render an error was present; (b)
    `trackFieldChange` + `previousValueRef` mutation in render double-fired under
    StrictMode; (c) setState-adjacent work in render. **Fix applied:** tracking moved
    into a new `FieldAnalyticsTracker` component (rendered from the Controller render
    prop, since hooks are unavailable there) with effects keyed on `[value]` /
    `[errorMessage]` and refs deduping across StrictMode remounts. **Test:**
    `RenderFieldAnalytics.test.tsx` renders under `<React.StrictMode>` and asserts
    one `onFieldChange` per actual change and one `onValidationError` per error
    transition (the latter fails against the pre-fix code — verified).
15. **Async options: refetch coupling + swallowed errors** — **Medium / Medium
    (verified code)** — `FormosaicFields.tsx:54-89`. The staleness handling (cacheKey
    + per-field AbortController, audit P1-6) is good; remaining issues are the
    `[fields]`-only dependency (dep-value changes only refetch when the rules state
    happens to produce a new `fields` reference) and `.catch(() => {})` leaving the
    user with stale options and no error UI. Test: change an `optionsDependsOn` field
    that triggers no rule; assert refetch.
16. **Save pipeline races** — **Medium / Medium** — `Formosaic.tsx:360-383`: state
    updates after the abort check can land post-unmount; the retry-sleep abort
    listener can double-settle. Fix: consistent `signal.aborted` re-checks after every
    await + cleanup-on-unmount abort. Test: unmount mid-save; abort mid-retry-sleep.
17. **ConfirmInputsModal** — **Medium / Medium — MOSTLY RESOLVED 2026-06-10** —
    `setValueFunctionFieldValue` now wrapped in `useCallback` (was defeating
    RenderField's `React.memo`); focus restore now guarded with `isConnected`.
    Remaining (low): focus trap fragility with nested popovers — fold into a later
    a11y pass.
18. **Known-open FU-2 (perf):** RenderField's ~20-dep `useMemo` and missing FieldArray
    per-row memoization — re-confirmed, correctly deferred.
19. **Known-open FU-4 (SSR):** `renderToString` emits zero field rows because rule
    state initializes in `useEffect`. The `useReducer`-initializer plan in FOLLOWUPS
    is right.
20. **Known-open FU-5/P0-1 (a11y):** FieldWrapper-injected aria props dropped by
    mantine/react-aria/base-web inner inputs (`knownAriaGaps` in contract tests).
    Additionally (new, Medium/Medium): no adapter wires `aria-describedby` from the
    input to the rendered error node — worth folding into the FU-5 pass.
    ~~`FormErrorBoundary` fallback should add `aria-live="assertive"` (Low).~~
    **Done 2026-06-10** (with test assertion in `FormErrorBoundary.test.tsx`).
21. **MultiSelect uses `watch()` instead of the `value` prop in fluent/mui** —
    **Medium / Medium** — `fluent/src/fields/MultiSelect.tsx:15-16`. Re-renders on
    every form change and bypasses the controlled pattern other adapters use. Fix: use
    `value`.
22. **Dropdown auto-default effect has `[options]`-only deps** — **Medium / Medium** —
    same file pattern across ≥6 adapters (`fluent/src/fields/Dropdown.tsx:24-28`):
    `setDefaultKeyIfOnlyOneOption` won't re-apply when `value` is later cleared. Fix
    deps; one shared hook would fix all (see finding 8).

### Backend / API-equivalent (save flow, trust boundaries)

23. Covered above: save retry races (16), global registries (12), draft persistence
    quota errors silently ignored (`useDraftPersistence.ts:71-84`, **Low** — consider
    an `onPersistError` callback so consumers know drafts stopped saving).
24. **Date reviver accepts invalid dates** — **Low / Low (speculative)** —
    `formStateSerialization.ts`: `new Date("garbage")` → `Invalid Date` silently.
    Defensive `isNaN(getTime())` guard.

### Testing

29. **Coverage inverted vs risk** (Top-risk #4). Core 61 files; each adapter 1 contract
    file (render-only, ~20 of 27 types); E2E Fluent-only (66 tests/7 specs); `examples`
    0; benchmarks not in CI. Highest-value additions, ranked: (1) behavioral field
    contract suite — clear-to-empty, invalid input, option-select — run against all 11
    adapters (would have caught the Number bug) — **done 2026-06-10 for Number**; (2)
    component tests for `Formosaic`/`RenderField`/`FieldWrapper`/providers (currently
    only indirect) — **started** (`RenderFieldAnalytics.test.tsx`); (3) one E2E smoke
    per adapter; (4) zod-import test across zod v3/v4 `_def` shapes; (5) fix
    `lazyFieldRegistry` test to actually await suspension (prior audit P3-10).

29a. **The E2E suite was never green — discovered and repaired 2026-06-11** —
    **High / High (verified)**. The E2E CI step ran with `continue-on-error: true`
    from its introduction (c1bf07e) until v1.4.2 removed the flag — and v1.4.2
    simultaneously broke the CI build, so the failures stayed invisible. Verified by
    running the suite at the last nominally-green commit (589136e) in an isolated
    worktree: **59 of 66 tests failed**. Repairs applied: page-object
    `getByRole("option")` substring bug ("Active" matched "Inactive"); stale
    expectations from v1.4.2's intentional breaking changes (required Toggle, save
    enablement); read-only swap detection (`<fieldName>-read-only`); a value-based
    `isDirty` misunderstanding in the dirty-then-clear pattern; plus the real core
    bug in 29b. Result: **61 pass, 0 fail, 5 `test.fixme`** for genuinely
    unimplemented features (wizard×Formosaic integration, FieldArray adapter
    registration, draft-persistence values API) — tracked as **FU-6** in
    FOLLOWUPS.md. The fixmes are themselves findings: `config.wizard` is silently
    ignored by `Formosaic`, no adapter can render `type: "FieldArray"`, and
    `useDraftPersistence` is unusable from outside the form (no values-change
    callback).

29b. **Dropdown `""` normalization dirties pristine forms — FIXED 2026-06-11** —
    **Medium-High / High (verified via E2E probe + bisection)**.
    `CheckValidDropdownOptions` (`FormosaicHelper.ts:180`) nulled out any Dropdown
    value not present in `options` — including `""` ("no selection"). The
    `shouldDirty: false` flag skips `dirtyFields`, but react-hook-form's global
    `isDirty` deep-compares values against defaults, so `"" → null` flipped
    `isDirty` at mount: Save/Cancel enabled on untouched forms, spurious
    `useBeforeUnload` warnings. Fix: skip normalization for `""`.

### Documentation

30. **Genuinely accurate post-1.4.2** — verified test counts, API names, RJSF/zod
    exports, field-type tables against the barrel and source. Status update
    2026-06-10: (a) **README compound-condition example — verified broken and
    FIXED**: it read `then: { assignee: { required: true } }`, but `assignee` is not
    an `IFieldEffect` property, so the copy-pasted rule was a silent no-op; now
    `then: { fields: { assignee: { required: true } } }`; (b) `website/` +
    `npm run docs:dev` references — **re-verified: already absent** from
    AGENTS.md/CONTRIBUTING.md; the original claim was stale; (c) parity-matrix
    field-count arithmetic drift (Low, open); (d) **no examples for 9 of 11
    adapters** and Storybook is Fluent-only (Medium for adoption, open). Missing
    docs: SSR guidance/limitations, multi-tenant registry guidance, troubleshooting,
    per-adapter behavior differences (Textarea/Autocomplete/DateRange) — open.

### Tooling / Dependencies

31. **No ESLint/Prettier** anywhere (the codebase uses `eslint-disable` comments that
    no ESLint consumes) — **Medium / High**.
32. **CI typecheck step was structurally broken — RESOLVED 2026-06-10** — Deeper than
    originally reported. Investigation with the CI run history showed: **(a) CI on
    `main` had been red since the v1.4.2 release** (4 consecutive failures). Root
    cause of the build break: one bare `process.env.NODE_ENV` left at
    `RenderField.tsx:173` — commit 762e31c fixed three files with the
    `globalThis`-cast idiom but missed this one; tsup's DTS compiler has no
    `@types/node`, so `npm run build` failed in CI. Fixed with the same idiom.
    **(b) The `Typecheck` CI step (added in the v1.4.2 release commit) never passed
    once:** `tsc -p tsconfig.base.json` sweeps the whole repo — forcing `strict`
    onto adapters that intentionally compile with `strict: false`, plus
    e2e/stories/benchmarks — yielding 1,017 errors at HEAD. **Fix applied:** new
    `npm run typecheck` (`scripts/typecheck.mjs`) typechecks each of the 13 packages
    against its own tsconfig; ci.yml now calls it; all 13 pass. En route, 15 real
    test-file type errors were fixed (vitest/jest-dom type wiring via
    `test-env.d.ts`, `lib: ES2022` for `Object.hasOwn`, a stale `IEntityData` import,
    ChakraProvider `children` typing ×4, literal-union and union-narrowing issues),
    and `composeForm`/`defineComposedForm` return types were narrowed from
    `IFormConfig` to `IResolvedFormConfig` (non-breaking subtype; fixes the same
    union error in benchmarks and improves the public API contract).
33. **No coverage thresholds** despite generating reports (Medium).
34. **Release: manual `bump-version.mjs` + hand-maintained CHANGELOG**, no pre-bump
    validation (Medium) — consider changesets.
35. **Benchmarks exist but never run** (Medium) — wire a regression gate or at least a
    manual job.
36. **`packages/core` CSS export path** `"./styles.css": "./dist/index.css"` —
    **verified OK 2026-06-10**: a clean `npm run build` emits
    `packages/core/dist/index.css` and `require.resolve("@formosaic/core/styles.css")`
    resolves. No action needed.
37. Dependencies are current and healthy (React 19, TS 5.9, vitest 4, rhf 7.71); peer
    ranges correct; `sideEffects` correct; native-ESM `@fluentui/react-icons`
    breakage is upstream (UP-1, documented).

### Performance

38. FU-2 memoization (deferred, fine at reasonable sizes).
39. Expression evaluation re-runs substitution regexes per call though the parser is
    cached (`ExpressionEngine.ts`) — bounded-LRU AST cache is a possible win at scale
    (Low).
40. `composeForm`/`resolveTemplates` not memoized by input hash (Low).
41. No oversized-bundle smoking gun; barrel exports + `sideEffects:false` make
    tree-shaking viable.

---

## E. Quick wins (low effort, high value)

1. ~~Fix the Number empty-string bug across all adapters (+ contract test).~~ **Done 2026-06-10** (see finding 1).
2. ~~Move RenderField analytics/`previousValueRef` into a `useEffect` (finding 14).~~ **Done 2026-06-10.**
3. ~~Dev-`console.warn` on unregistered validators (finding 4) and on connection suffix collisions (finding 5).~~ **Done 2026-06-10.**
4. `aria-describedby` linking input↔error in the headless/radix/react-aria fields (finding 20) — **open**, fold into FU-5.
5. ~~`aria-live="assertive"` on the FormErrorBoundary fallback.~~ **Done 2026-06-10.**
6. ~~Verify and fix the README compound-condition example; remove `website/` references.~~ **Done 2026-06-10** (README fixed; `website/` refs were already absent).
7. ~~Verify the core CSS export path resolves to a real emitted file (finding 36).~~ **Verified OK 2026-06-10.**
8. ~~Memoize `setValueFunctionFieldValue`; guard modal focus restore with `isConnected` (finding 17).~~ **Done 2026-06-10.**

---

## F. Larger refactors (plan separately)

- **Shared field-behavior layer.** Extract `useNumberField`/`useDropdownField`/
  `useDateField`/etc. into `@formosaic/core/adapter-utils`; adapters render JSX only.
  Eliminates findings 1, 9–11, 21–22 at the root. *Tradeoff:* touches all 12 packages;
  do it behind the existing contract tests, one field type at a time, adapter parity
  asserted before/after. *Migration risk:* medium — internal-only, no public API change.
- **SSR-synchronous initial state (FU-4).** `useReducer` initializer computes
  `IRuntimeFormState` during render. *Risk:* medium — changes the init lifecycle;
  needs the existing SSR smoke tests plus a "renderToString emits ≥1 row" assertion.
- **Instance-scoped registries.** Optional provider-scoped validator/locale/template
  registries for SSR/multi-tenant, keeping the global default. *Risk:* high surface;
  opt-in only.
- **Template override deep-merge + structuredClone** (finding 8). *Risk:* behavior
  change for anyone relying on the current replace semantics — ship in a minor with a note.

---

## G. Documentation plan (backlog)

| Priority | Doc | Location | Audience | Contents |
|---|---|---|---|---|
| P0 | Fix compound-condition example | `README.md` | New users | Correct `then: { fields: { … } }` shape |
| P1 | Per-adapter behavior matrix | `docs/adapters/parity-matrix.mdx` | Adapter choosers | Textarea/PopOutEditor, Autocomplete, DateRange, aria gaps |
| P1 | SSR guide & known limitations | `docs/guide/ssr.mdx` (new) | Next.js/SSR users | FU-4 flash-of-empty-form, global-registry boot guidance |
| P1 | Multi-tenant/registry guidance | `docs/guide/registries.mdx` (new) | Server-render teams | "register once at boot," contamination risk |
| P2 | Troubleshooting | `docs/guide/troubleshooting.mdx` (new) | All | Silent rule no-ops, validator typos, native-ESM Fluent (UP-1) |
| P2 | Analytics callback caveat | `docs/api` + `IAnalyticsCallbacks` JSDoc | Integrators | Callbacks receive raw field values; document this and add a field-level `telemetryExcluded` opt-out |
| P2 | Examples for non-Fluent adapters | `packages/examples` / Storybook | Adopters | At least headless + one styled adapter |
| P3 | Fix stale paths/counts | AGENTS.md, CONTRIBUTING.md, parity matrix | Contributors | Remove `website/`, fix arithmetic |

---

## H. Suggested implementation plan

1. **Safe immediate fixes (1 PR each, reviewable):** Number empty-string (all
   adapters); RenderField effect move; validator/connection dev-warns; aria-describedby
   + aria-live; README + CSS-export verification.
2. **Tests before risky changes:** behavioral field-contract suite across all 12
   adapters; component tests for Formosaic/RenderField/providers; SSR "≥1 row"
   assertion (pre-FU-4); zod v3/v4 test. These lock current behavior before the
   shared-layer refactor.
3. **Medium refactors:** shared field-behavior hooks (incremental, one type at a
   time); template override deep-merge + structuredClone; MultiSelect/Dropdown
   effect-deps cleanup (folds into the shared layer).
4. **Documentation cleanup:** execute the G backlog P0–P1; add ESLint/Prettier +
   coverage thresholds + per-package typecheck to CI in the same wave.
5. **Longer-term architecture:** SSR-synchronous init (FU-4); FU-5 adapter aria
   rework; instance-scoped registries; FU-1 barrel cleanup in 1.5.0; benchmark
   regression gate; changesets-based release.

---

*No source files were modified in producing the original audit. **Update 2026-06-10:**
the recommended starting point — the Number-field fix plus its behavioral contract
test — has been implemented (finding 1, Top Risk #1). The contract test now exercises
typed-value commit and clear-to-null across all 11 adapters, validating the
shared-behavior refactor direction.*
