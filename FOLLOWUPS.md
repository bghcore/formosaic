# Formosaic Follow-up Work Items

Items deliberately left open at the 1.4.2 release per the audit closure. Each
entry has a stable ID so release notes, issues, and PRs can reference it
without ambiguity. Convert to GitHub issues when ready.

**Status:** open as of 2026-04-17.

---

## FU-1 — Public barrel cleanup + deprecation path for internal helpers

**Origin:** audit finding P1-23; confirmed during pack audit — `@formosaic/core`
exposes **118** named exports, of which roughly 13 are internal helpers that
were never intended as public API.

**Internal helpers currently exposed at the root barrel:**

- `CheckAsyncFieldValidationRules`
- `CheckDefaultValues`
- `CheckFieldValidationRules`
- `CheckValidDropdownOptions`
- `ExecuteComputedValue`
- `GetComputedValuesOnCreate`
- `GetComputedValuesOnDirtyFields`
- `GetConfirmInputModalProps`
- `GetFieldsToRender`
- `InitOnCreateFormState`
- `InitOnEditFormState`
- `IsExpandVisible`
- `ShowField`

Plus the `RulesEngineActionType` enum and a handful of `build*`/`topologicalSort`
helpers whose signatures are effectively private.

**Why open:** removing these is a breaking change. Must be done behind a
deprecation path.

**Proposed plan:**

1. In a minor release (1.5.0): add `@formosaic/core/internal` subpath and
   **also** keep the root exports with a runtime dev-mode `console.warn` on
   first access, indicating deprecation.
2. In the following major release: remove the root exports entirely.
3. Update `docs/api/stability.mdx` to clearly mark public vs internal API.
4. Refresh the pack-audit consumer smoke to assert the public surface count
   stays within an explicit allowlist (snapshot-style test).

**Owner:** TBD.
**Blocker for 1.4.2 release:** no.

---

## FU-2 — Performance: `RenderField` useMemo split + FieldArray per-row memoization

**Origin:** audit findings P1-26, P1-27.

**Problem:**

- `RenderField.tsx`'s main `useMemo` has a ~20-dep array; any dep change
  invalidates the whole memo for every field.
- `FieldArray.tsx` has no per-row memoization, so edits to one row re-render
  every row.

Neither is a correctness bug — both are noticeable at scale (50+ fields,
50+ array rows).

**Proposed plan:**

1. Split `RenderField`'s memo into narrower scopes (one for label/chrome,
   one for the cloned field element, one for the validation schema).
2. Introduce a small `FieldArrayRow` internal component wrapped in
   `React.memo`, with stable `onChange` / `onRemove` callbacks via refs.
3. Benchmark before and after in `benchmarks/suites/` with a 100-field form
   and a 100-row array to confirm the improvement.

**Owner:** TBD.
**Blocker for 1.4.2 release:** no. Current performance is acceptable for
reasonable form sizes; large-form tuning is a dedicated pass.

---

## FU-3 — Short-regex ReDoS hardening

**Origin:** audit finding P0-10; regression tests
(`RedosCaps.test.ts`) empirically confirm that `(a+)+b` on a 25-char input
takes ~5 seconds on V8 under jsdom.

**Problem:** the current length caps (256-char source, 10 000-char input)
stop long-source and long-input attacks but do not stop short pathological
regex on short input. A hostile config with a 10-char regex can still hang
the main thread for seconds.

**Proposed plan (pick one, not all):**

1. **Regex complexity heuristic** — reject patterns with nested
   quantifiers (`(a+)+`, `(a*)*`, `(a|a)+`) via a pre-scan. Low overhead,
   catches the common cases. See `safe-regex` for prior art.
2. **Worker-thread evaluation with timeout** — run `regex.test()` in a
   dedicated thread with a hard 100ms budget. Highest safety, highest
   complexity; cross-platform portability is a concern.
3. **Document-only** — make it clear that callers must validate regex
   complexity out-of-band when accepting patterns from untrusted sources,
   and rely on consumer-side hygiene. (Current state.)

**Owner:** TBD.
**Blocker for 1.4.2 release:** no. Documented as a caveat in
CHANGELOG, SECURITY.md, and `formosaic-audit-closure.md` §6.

---

## FU-4 — SSR hydration efficiency: render fields on the server

**Origin:** audit finding P1-21b; SSR smoke tests confirm `<Formosaic>`'s
wrapper renders, but `FormFields` reads `fieldOrder` from the rules state
populated in a `useEffect` — so `renderToString` returns zero field rows.
Fields materialize only after client hydration.

**Problem:** not a safety issue, but a user-visible "flash of empty form"
on first paint, plus a hit to LCP and bundle-level concerns for
server-rendered apps.

**Proposed plan:**

1. Derive an initial `IRuntimeFormState` during render (synchronously)
   from `IFormConfig` + `defaultValues` rather than in `useEffect`.
   Candidate approach: use `useReducer`'s initializer function to compute
   the initial state synchronously, and treat the effect as reconciliation
   on prop changes only.
2. Add an E2E test that asserts `renderToString` output contains at least
   one rendered field row for a basic 2-field config.
3. Update docs to reflect full SSR support.

**Owner:** TBD.
**Blocker for 1.4.2 release:** no. SSR is safe today (no cross-request
leakage); this is about first-paint parity, not correctness.

---

## FU-5 — Per-adapter a11y rework for Mantine + react-aria

**Origin:** audit finding P0-1; contract-test `knownAriaGaps` records the
remaining misalignment between FieldWrapper-injected props and each adapter's
internal element structure.

**Gaps:**

- **Mantine**: `<TextInput>` / `<NumberInput>` / `<Select>` / `<MultiSelect>`
  / `<Textarea>` don't surface `aria-invalid` on the inner `<input>` when we
  spread rest on the outer component; Mantine expresses error state through
  a sibling error `<div>`. Fields affected: Textbox, Number, Dropdown,
  Multiselect, Textarea.
- **react-aria**: React Aria Components own `aria-required` / `aria-invalid`
  via their `isRequired` / `isInvalid` props. Our adapters already pass
  those, but the contract test's strict descendant assertion looks for the
  literal attribute, and RAC does not always emit it in the inner input.
  Fields affected: Textbox, Number, Toggle, Slider, Dropdown, Autocomplete,
  Textarea, CheckboxGroup.
- **base-web**: `<Input>` / `<NumberInput>` overrides own inner-input aria.
  Fields affected: Textbox, Number.

Each is **adapter-library design**, not a Formosaic bug, which is why they
ship today as documented `knownAriaGaps`.

**Proposed plan:**

1. **Mantine**: move the rest-spread from the outer component prop to the
   library's `inputProps={rest}` override (mantine supports this for every
   affected component). Verify with the contract harness.
2. **react-aria**: drop the outer-wrapper rest-spread for these fields and
   rely solely on `isRequired` / `isInvalid`; then audit whether the
   contract harness should accept RAC's internal aria placement
   (e.g. inspect the inner `<input>` element explicitly).
3. **base-web**: thread `overrides.Input.props.aria-invalid` and
   `overrides.Input.props.aria-required` through from the wrapper.
4. Remove the corresponding entries from each adapter's `knownAriaGaps` in
   `packages/{mantine,react-aria,base-web}/src/__tests__/contract.test.ts`.

**Owner:** TBD.
**Blocker for 1.4.2 release:** no. Skips are legitimately adapter-owned and
documented.

---

## Upstream (not a Formosaic fix)

### UP-1 — `@fluentui/react-icons` broken ESM entrypoint

**Problem:** Native Node ESM `import "@formosaic/fluent"` fails because
`@fluentui/react-icons/lib/index.js` dynamic-imports a nonexistent
`chunk-0`.

**Status:** upstream bug in `@fluentui/react-icons`. CJS consumers and
bundlers with dual-package resolution (Vite, webpack, Next.js) are
unaffected. Track the fix at the upstream repo; our options are limited
short of pinning to an older version.

**Blocker for 1.4.2 release:** no, but consumers on native Node ESM should
be warned.
