# Tier 2 Handoff Document

Pre-Tier-2 hardening pass complete (v1.5.2). This document summarizes readiness status and answers the 7 key decision questions for Tier 2 expansion.

## 1. Are all adapters at parity for Tier 1 fields?

**Yes.** All 11 adapters pass the full parity test suite (11 adapters x 8 fixtures). Known divergences are documented in the [Divergence Register](./divergence-register.md) and classified as acceptable or monitored.

| Suite | Tests |
|---|---|
| parityTests (11 adapters x 8 fixtures) | ~2090 |
| crossAdapterEdgeCases (11 adapters) | ~316 |
| businessFormRoundTrip (6 adapters) | ~220 |
| primitiveAdapterEdgeCases (radix + react-aria) | 21 |
| edgeCases (headless) | ~66 |
| consumerSmoke (11 adapters) | 36 |

## 2. Are the primitives-first adapters (radix, react-aria) ready?

**Yes.** Both adapters:

- Pass all 8 parity fixtures with no skips
- Pass cross-adapter edge cases (Number, Dropdown, MultiSelect, RadioGroup, CheckboxGroup, DateControl, ReadOnly)
- Pass business form round-trip tests (profile, workflow, option-heavy)
- Have dedicated primitives-first edge-case coverage (DIV-010, DIV-011, DIV-012)
- Produce conformant 13-key registries (verified by consumer smoke tests)
- Need no wrapper component (unlike Chakra/Mantine)

**Known divergences:**
- DIV-010: Radix Select uses `undefined` (not `""`) for empty value — permanent acceptable
- DIV-011: Radix Slider array boundary conversion — permanent acceptable, transparent
- DIV-012: React Aria Key type cast `String(key)` — permanent acceptable, transparent

## 3. Has the shadcn integration been validated?

**Yes.** A runnable reference implementation exists:

- 7 shadcn-style field wrappers in `stories/examples/shadcn-fields/`
- `createShadcnFieldRegistry()` spreads radix registry + overrides with styled wrappers
- Storybook story at "Examples/shadcn Reference" with HybridRegistry and Empty variants
- Demonstrates the recommended pattern from `docs/shadcn-integration.md`

The pattern confirms: radix adapter + custom overrides via registry spread = complete shadcn integration path.

## 4. What are the known divergences going into Tier 2?

12 entries in the [Divergence Register](./divergence-register.md):

| ID | Severity | Category | Summary |
|---|---|---|---|
| DIV-001 | Low | Permanent acceptable | Number/Slider readOnly null shows "0" |
| DIV-002 | Low | Must monitor | Mantine NumberInput empty → null |
| DIV-003 | Medium | UX inconsistency | Fluent/MUI Textarea required (PopOutEditor) |
| DIV-004 | Low | Test-env limitation | MUI CheckboxGroup required detection |
| DIV-005 | Low | UX inconsistency | MultiSelect readOnly format variance |
| DIV-006 | Medium | Should normalize | Dropdown readOnly shows value not label |
| DIV-007 | Low | Permanent acceptable | Semantic HTML adapter classification |
| DIV-008 | Medium | Temporary acceptable | Chakra compound component DTS fallbacks |
| DIV-009 | None | Permanent acceptable | Date picker UX variance |
| DIV-010 | Low | Permanent acceptable | Radix Select empty value handling |
| DIV-011 | None | Permanent acceptable | Radix Slider array boundary conversion |
| DIV-012 | None | Permanent acceptable | React Aria Select Key type cast |

**Action items for Tier 2:**
- DIV-006 should be fixed before Wave 1 (affects 4 adapters)
- DIV-002, DIV-008 should be monitored during Tier 2 expansion

## 5. What is the rollout strategy?

Four waves, prioritized by value and implementation feasibility:

| Wave | Fields | Rationale |
|---|---|---|
| 1 | Rating, Autocomplete, DateTime | Strong native support in 5+ adapters, most requested |
| 2 | DateRange, PhoneInput, FileUpload | Common form patterns, several native implementations |
| 3 | ColorPicker, MultiSelectSearch, RichText | Specialized use cases, RichText may slip to Wave 4 |
| 4 | DocumentLinks, StatusDropdown, ReadOnly variants, ChoiceSet, PopOutEditor | Completeness round |

Full feasibility assessment: [Tier 2 Feasibility Matrix](./tier2-feasibility-matrix.md)

## 6. Recommendations

1. **Fix DIV-006 first** — Dropdown readOnly label lookup affects headless, atlaskit, base-web, heroui. Low-risk fix, high-value normalization.

2. **Start Wave 1 with headless as reference** — Implement Rating, Autocomplete, DateTime in headless first, then propagate to framework-native adapters.

3. **Expand parity harness for Tier 2** — Add new fixture types to `parityFixtures.ts` for each Wave 1 field type.

4. **Consider shared utilities** — PhoneInput formatting, DateRange value type, and Rating star rendering could live in `core/adapter-utils`.

5. **Defer RichText** — Editor library dependency (tiptap vs prosemirror vs lexical) is a significant decision. Only Mantine has native support. Consider making this a recipe rather than adapter code.

## 7. Go/No-Go per adapter

| Adapter | Tier 2 Ready | Notes |
|---|---|---|
| fluent | Go | Full Tier 1, many native Tier 2 components available |
| mui | Go | Full Tier 1, strong Tier 2 component library |
| headless | Go | Reference implementation, always first |
| antd | Go | Full Tier 1, rich component library for Tier 2 |
| chakra | Go (cautious) | 6 HTML fallbacks (DIV-008), monitor DTS issue |
| mantine | Go | Full Tier 1, strongest Tier 2 native support |
| atlaskit | Go (limited) | Semantic HTML only, Tier 2 will also be semantic |
| base-web | Go | 10 native baseui + 3 semantic, good Tier 2 potential |
| heroui | Go (limited) | Semantic HTML only, Tier 2 will also be semantic |
| radix | Go | 6 native + 7 semantic, good primitives for Tier 2 |
| react-aria | Go | 10 native + 3 semantic, excellent a11y base for Tier 2 |
| shadcn (recipe) | Go | Pattern validated, expand recipes alongside radix |

## Test Count Summary (v1.5.2)

| Suite | File Count | Test Count |
|---|---|---|
| Core unit tests | 29 | ~616 |
| Parity tests | 5 | ~2713 |
| Smoke tests | 1 | 36 |
| Performance tests | 1 | ~30 |
| Contract tests | 11 | varies |
| **Total vitest** | **55** | **4774** |
| E2E (Playwright) | 7 | 54 |

## Related Documentation

- [Choosing an Adapter](./choosing-an-adapter.md) — adapter recommendation guide
- [Divergence Register](./divergence-register.md) — behavioral differences
- [Tier 2 Feasibility Matrix](./tier2-feasibility-matrix.md) — field x adapter assessment
- [shadcn Integration](./shadcn-integration.md) — shadcn/ui integration guide
- [Adapter Architecture](./adapter-architecture.md) — internal implementation patterns
