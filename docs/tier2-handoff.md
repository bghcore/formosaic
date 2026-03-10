# Tier 2 Handoff Document

Tier 1 stabilization complete (v1.5.2). This document consolidates all Tier 2 planning: readiness status, feasibility matrix, rollout waves, adapter priorities, and go/no-go assessment.

## 1. Tier 1 Parity Status

**All 11 adapters pass the full parity test suite.**

| Suite | Tests |
|---|---|
| parityTests (11 adapters x 8 fixtures) | ~2090 |
| crossAdapterEdgeCases (11 adapters) | ~316 |
| businessFormRoundTrip (6 adapters) | ~220 |
| primitiveAdapterEdgeCases (radix + react-aria) | 21 |
| edgeCases (headless) | ~66 |
| consumerSmoke (11 adapters) | 36 |

Known divergences documented in the [Divergence Register](./divergence-register.md). DIV-006 (Dropdown readOnly label) resolved in v1.5.2. All remaining divergences are permanent-acceptable, temporary-acceptable, or test-environment-only.

## 2. Primitives-First Adapters

Both radix and react-aria are production-ready:
- Pass all 8 parity fixtures, cross-adapter edge cases, business form round-trips
- Dedicated edge-case coverage (DIV-010, DIV-011, DIV-012)
- No wrapper component required
- Known divergences are all permanent-acceptable

## 3. shadcn Integration

Validated via reference implementation in `stories/examples/shadcn-fields/`:
- 7 shadcn-style wrappers + `createShadcnFieldRegistry()` using radix registry spread
- Pattern confirmed: radix adapter + custom overrides = complete shadcn path
- Guide: [shadcn Integration](./shadcn-integration.md)

## 4. Open Divergences

| DIV | Severity | Category | Impact on Tier 2 |
|-----|----------|----------|-----------------|
| DIV-001 | Low | Permanent | None -- same pattern for Rating/numeric |
| DIV-002 | Low | Monitor | Watch if Mantine Tier 2 fields also normalize |
| DIV-003 | Medium | UX inconsistency | Low priority, fix during Tier 2 Textarea work |
| DIV-004 | Low | Test-env | None |
| DIV-005 | Low | UX inconsistency | May affect MultiSelectSearch readOnly |
| DIV-008 | Medium | Temporary | Monitor upstream; affects Tier 2 component choices |

**None block Tier 2 start.**

## 5. Feasibility Matrix

19 candidate Tier 2 fields assessed across all targets.

**Key:** Strong (native component exists), Viable (minor workarounds), Partial (heavy custom work), Defer (not practical now), Recipe (shadcn copy-paste pattern)

| Field | fluent | mui | headless | antd | chakra | mantine | atlaskit | base-web | heroui | radix | react-aria | shadcn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Rating | Strong | Strong | Viable | Strong | Viable | Strong | Viable | Viable | Viable | Viable | Viable | Recipe |
| Autocomplete | Strong | Strong | Viable | Strong | Viable | Strong | Viable | Viable | Viable | Partial | Strong | Recipe |
| DateTime | Strong | Strong | Viable | Strong | Viable | Strong | Viable | Viable | Viable | Viable | Strong | Recipe |
| DateRange | Partial | Strong | Viable | Strong | Viable | Strong | Viable | Viable | Viable | Viable | Strong | Recipe |
| PhoneInput | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Recipe |
| FileUpload | Viable | Viable | Viable | Strong | Viable | Strong | Viable | Strong | Viable | Viable | Viable | Recipe |
| ColorPicker | Strong | Viable | Viable | Strong | Viable | Strong | Viable | Viable | Viable | Viable | Viable | Recipe |
| MultiSelectSearch | Strong | Strong | Partial | Strong | Partial | Strong | Partial | Partial | Partial | Partial | Viable | Recipe |
| RichText | Defer | Defer | Defer | Defer | Defer | Strong | Defer | Defer | Defer | Defer | Defer | Defer |
| DocumentLinks | Strong | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Recipe |
| StatusDropdown | Strong | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Recipe |
| ReadOnly variants (5) | Strong | Strong | Strong | Strong | Strong | Strong | Viable | Viable | Viable | Viable | Viable | Recipe |
| ChoiceSet | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Recipe |
| FieldArray (nested) | Strong | Strong | Strong | Strong | Strong | Strong | Strong | Strong | Strong | Strong | Strong | Recipe |
| PopOutEditor | Strong | Strong | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Viable | Recipe |

## 6. Rollout Waves

| Wave | Fields | Rationale | Est. Tests |
|------|--------|-----------|------------|
| 1 | Rating, Autocomplete, DateTime | Strong native support in 5+ adapters, most requested | ~400 |
| 2 | DateRange, PhoneInput, FileUpload | Common form patterns, several native implementations | ~300 |
| 3 | ColorPicker, MultiSelectSearch, RichText | Specialized; RichText may slip to Wave 4 | ~250 |
| 4 | DocumentLinks, StatusDropdown, ReadOnly variants, ChoiceSet, PopOutEditor | Completeness round | ~350 |

## 7. Adapter Priorities for Tier 2

### Primary (implement first)

| Priority | Adapter | Reason |
|----------|---------|--------|
| 1 | headless | Always first -- reference implementation |
| 2 | fluent | Already has Tier 2 fields, strongest ecosystem |
| 3 | mui | Already has Tier 2 fields, large community |
| 4 | antd | Rich component library |
| 5 | mantine | Rich component library |

### Secondary

| Adapter | Reason |
|---------|--------|
| react-aria | Excellent a11y, covers most Tier 2 patterns |
| radix | Good primitives base, expand alongside shadcn recipes |
| base-web | 10/13 native; baseui has relevant Tier 2 components |

### Fallback (semantic HTML)

| Adapter | Strategy |
|---------|----------|
| chakra | Native where Ark UI DTS allows; fallbacks otherwise |
| atlaskit | All Tier 2 fields as semantic HTML |
| heroui | All Tier 2 fields as semantic HTML |

## 8. Implementation Patterns

See [tier1-patterns.md](./tier1-patterns.md) for the full Tier 1 blueprint.

| New Field | Pattern Source |
|-----------|---------------|
| Rating | Numeric + Slider readOnly |
| Autocomplete | Dropdown + Textbox (combobox) |
| DateTime | DateControl + time component |
| DateRange | DateControl x2 |
| PhoneInput | Textbox + input mask |
| FileUpload | Custom (new pattern) |
| ColorPicker | Custom (new pattern) |
| MultiSelectSearch | MultiSelect + Autocomplete |
| StatusDropdown | Dropdown + status styling |
| DocumentLinks | Custom (structured list) |

## 9. Go/No-Go

| # | Criterion | Status |
|---|-----------|--------|
| 1 | All Tier 1 fields pass across all 11 adapters | **GO** |
| 2 | No unresolved Tier 1 blocking issues | **GO** |
| 3 | Documentation reconciled and accurate | **GO** |
| 4 | Parity test infrastructure supports new fields | **GO** |
| 5 | Contract test infrastructure supports new fields | **GO** |
| 6 | Implementation patterns documented | **GO** |
| 7 | Adapter priority order established | **GO** |
| 8 | Tier 2 wave plan exists | **GO** |

**Verdict: GO for Tier 2.** Start with Wave 1 (Rating, Autocomplete, DateTime) using headless as reference implementation.

## 10. Docs to Update During Tier 2

| Document | Update When |
|----------|-------------|
| `docs/parity-matrix.md` | Every new field added |
| `docs/divergence-register.md` | Any new behavioral divergence |
| `docs/choosing-an-adapter.md` | Adapter readiness changes |
| Package READMEs | Field count changes |
| Package AGENTS.md / llms.txt | New field patterns |
| `CLAUDE.md` | Major architecture changes |
| Root `README.md` / `AGENTS.md` / `llms.txt` | Feature-level changes |

## Test Count (v1.5.2)

| Suite | Files | Tests |
|---|---|---|
| Core unit tests | 29 | ~616 |
| Parity tests | 5 | ~2713 |
| Smoke tests | 1 | 36 |
| Performance tests | 1 | ~30 |
| Contract tests | 11 | varies |
| **Total vitest** | **55** | **4774** |
| E2E (Playwright) | 7 | 54 |
