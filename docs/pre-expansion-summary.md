# Pre-Expansion Summary (v1.4.0)

Assessment of adapter parity readiness before expanding to Tier 2 field types.

## Parity Test Infrastructure

v1.4.0 introduces three layers of automated parity verification:

1. **Cross-Adapter Parity Harness** (`@form-eng/core/testing` → `runParityTests`) — renders the same `IFormConfig` through multiple adapter registries and asserts engine-level equivalence: initial render produces content, readOnly mode has no editable elements, value hydration works, required indicators present, and empty values produce the `"-"` sentinel.

2. **Edge-Case Canonical Value Tests** (`packages/core/src/__tests__/parity/edgeCases.test.ts`) — comprehensive value-level tests using the headless adapter covering every combination of null/undefined/empty/zero/negative/whitespace for all 13 Tier 1 field types in both editable and readOnly modes.

3. **Parity Fixtures** (`@form-eng/core/testing` → `PARITY_*_FORM`) — 8 IFormConfig fixtures (Text, Number, Boolean, Select, Date, Choice, Mixed, ReadOnly) usable by both automated tests and manual Storybook verification.

## Known Divergences

### Accepted Divergences (no action required)

| Divergence | Adapter(s) | Details | Rationale |
|-----------|-----------|---------|-----------|
| Semantic HTML for all fields | atlaskit, heroui | All 13 Tier 1 fields use `<input>`, `<select>`, `<fieldset>` etc. instead of native UI lib components | By design — provides ecosystem-compatible structure without runtime dependency on UI libs with jsdom issues |
| Semantic HTML for subset | chakra (6 fields), base-web (subset) | Number, Toggle, Multiselect, Slider, RadioGroup, CheckboxGroup use HTML fallbacks in Chakra | Ark UI v3 DTS issue (`Assign` type breaks `.d.ts` generation); HTML fallbacks are fully functional |
| PopOutEditor for Textarea | fluent, mui | `Textarea` type key maps to `PopOutEditor` (rich textarea with modal expand) | Legacy behavior, functionally compatible — still accepts/returns `string` |
| Date picker UX | antd (dayjs), headless/heroui (native HTML `<input type="date">`) | Different date picker UIs across adapters | Expected — adapters use their ecosystem's date component; canonical ISO serialization is consistent |

### Must-Monitor Divergences

| Divergence | Adapter | Details | Risk | Mitigation |
|-----------|---------|---------|------|------------|
| Number empty → `null` | mantine | Mantine's `NumberInput` explicitly converts empty to `null`; other adapters leave it as browser-level empty state | Low — `null` and `undefined` are both valid empty values per canonical contract | Parity tests verify both paths produce equivalent form state |
| MultiSelect readOnly rendering | antd (comma-join text) vs headless (`<ul>` list) | Visual representation differs but both display the correct option labels | Low — readOnly is display-only; semantic content matches | ReadOnly contract standardized: comma-separated labels or `"-"` |

### No Must-Fix Divergences

All 9 adapters conform to the canonical field contracts for value serialization. No adapter produces incorrect form state values.

## Adapter Readiness Ranking

### Tier 2 Expansion Readiness

| Rank | Adapter | Classification | Tier 1 Status | Tier 2 Status | Readiness |
|------|---------|---------------|--------------|--------------|-----------|
| 1 | fluent | Native | All 13 complete | All 14 complete | Production |
| 2 | mui | Native | All 13 complete | All 14 complete | Production |
| 3 | headless | Reference | All 13 complete | All 14 complete | Production |
| 4 | antd | Native | All 13 complete | 0 of 14 | Ready — all fields use native Ant Design components |
| 5 | mantine | Native | All 13 complete | 0 of 14 | Ready — all fields use native Mantine components (monitor Number null) |
| 6 | chakra | Hybrid | All 13 complete | 0 of 14 | Conditional — 7 fields are native Chakra, 6 are HTML fallbacks; Tier 2 fields needing compound components will hit same DTS issue |
| 7 | base-web | Hybrid | All 13 complete | 0 of 14 | Conditional — limited native component usage; most fields are semantic HTML |
| 8 | atlaskit | Compatibility | All 13 complete | 0 of 14 | Low priority — all fields are semantic HTML; Tier 2 would also be semantic HTML |
| 9 | heroui | Compatibility | All 13 complete | 0 of 14 | Low priority — all fields are semantic HTML; Tier 2 would also be semantic HTML |

### Recommended Tier 2 Expansion Order

1. **antd** — Ant Design v5 has native components for most Tier 2 types (Rating via `Rate`, Autocomplete via `AutoComplete`, DateRange via `RangePicker`, FileUpload via `Upload`, PhoneInput via masked `Input`). Estimated: 10 of 14 Tier 2 types can use native components.

2. **mantine** — Mantine v7 has `Rating`, `Autocomplete`, `ColorInput`, `FileInput`, `DatePickerInput` (range mode). Similar native coverage to antd. Estimated: 9 of 14 Tier 2 types native.

3. **chakra** — Expansion blocked by Ark UI DTS issues for compound components. Recommend waiting for upstream fix or using semantic HTML approach for new types.

4. **base-web / atlaskit / heroui** — Lower priority; semantic HTML approach works but provides no visual integration benefit. Expand on demand.

## Infrastructure Readiness

| Capability | Status | Details |
|-----------|--------|---------|
| Contract test harness | Ready | `runAdapterContractTests()` validates registry coverage + basic rendering for all field types |
| Parity test harness | Ready | `runParityTests()` validates cross-adapter behavioral equivalence |
| Edge-case value tests | Ready | Comprehensive null/empty/edge-case coverage for all 13 Tier 1 types |
| Business form fixtures | Ready | 3 realistic IFormConfig fixtures (profile, workflow, option-heavy) for integration testing |
| Performance sanity tests | Ready | Render count baselines, option-heavy rendering, rules overhead comparison |
| Adapter render benchmarks | Ready | vitest bench suite for render + hydrate timing through headless adapter |
| Field capability matrix | Ready | Per-field, per-adapter documentation of support levels and caveats |
| Canonical field contracts | Ready | Documented value types, empty semantics, serialization, readOnly display for all 13 Tier 1 types |
| ReadOnly contract | Ready | Formalized readOnly rendering requirements for all field types |
| API stability classification | Ready | All public exports classified by stability level and audience |
| Adapter architecture doc | Ready | Classification (Native/Reference/Hybrid/Compatibility) for all 9 adapters |

## Test Coverage Summary

| Category | v1.3.0 | v1.4.0 | Delta |
|----------|--------|--------|-------|
| Vitest unit/integration | 1814 tests, 46 files | ~2200+ tests, 50+ files | +400+ tests |
| Parity test fixtures | 0 | 8 IFormConfig fixtures | New |
| Edge-case scenarios | 0 | ~100+ edge-case assertions | New |
| Performance sanity | 0 | 4 render sanity checks | New |
| Benchmarks | 5 suites | 6 suites | +1 adapter render benchmark |
| Storybook stories | 64 | 67+ | +3 business form examples |
| E2E tests | 54 | 54 (unchanged) | — |
| Documentation | 12 docs | 16 docs | +4 new docs |

## Conclusion

The v1.4.0 parity hardening establishes a trustworthy Tier 1 baseline:

- **All 9 adapters pass contract tests** for all 13 Tier 1 field types
- **No must-fix serialization divergences** — all adapters produce conformant form state values
- **Parity test infrastructure is in place** to catch regressions as Tier 2 types are added
- **antd and mantine are the clear next candidates** for Tier 2 expansion based on native component availability

The form engine is ready for Tier 2 expansion starting with antd and mantine adapters.
