# Tier 1 Baseline Report

> **Status: HISTORICAL** -- This was the pre-Tier-2 baseline. Tier 2 expansion completed in v1.6.0. See `parity-matrix.md` for current field support.

Final Tier 1 stabilization assessment as of v1.5.2. This is the definitive pre-Tier-2 reference.

## 1. Tier 1 Field Audit

All 13 Tier 1 fields verified across all 11 adapters.

### Per-Field/Adapter Audit Table

| Field | fluent | mui | headless | antd | chakra | mantine | atlaskit | base-web | heroui | radix | react-aria |
|-------|--------|-----|----------|------|--------|---------|----------|----------|--------|-------|------------|
| **Textbox** | Y | Y | FB | Y | Y | Y | FB | Y | FB | FB | Y |
| **Number** | Y | Y | FB | Y | FB | Y | FB | Y | FB | FB | Y |
| **Toggle** | Y | Y | FB | Y | FB | Y | FB | Y | FB | Y | Y |
| **Dropdown** | Y | Y | FB | Y | Y | Y | FB | Y | FB | Y | Y |
| **SimpleDropdown** | Y | Y | FB | Y | Y | Y | FB | Y | FB | Y | Y |
| **MultiSelect** | Y | Y | FB | Y | FB | Y | FB | Y | FB | FB | FB |
| **DateControl** | Y | Y | FB | Y | Y | Y | FB | FB | FB | FB | FB |
| **Slider** | Y | Y | FB | Y | FB | Y | FB | Y | FB | Y | Y |
| **RadioGroup** | Y | Y | FB | Y | FB | Y | FB | Y | FB | Y | Y |
| **CheckboxGroup** | Y | Y | FB | Y | FB | Y | FB | Y | FB | Y | Y |
| **Textarea** | Y | Y | FB | Y | Y | Y | FB | Y | FB | FB | FB |
| **DynamicFragment** | Y | Y | FB | Y | Y | Y | FB | FB | FB | FB | FB |
| **ReadOnly** | Y | Y | FB | Y | Y | Y | FB | FB | FB | FB | FB |

Legend: **Y** = Native UI library component, **FB** = Semantic HTML fallback

### Verified Behaviors (all fields, all adapters)

| Behavior | Status |
|----------|--------|
| Renders without error | Pass (all 143 field/adapter pairs) |
| Value hydration | Pass |
| ReadOnly rendering | Pass (Dropdown now shows label, not value) |
| Empty value sentinel ("-") | Pass (except Number/Slider which show "0" — accepted DIV-001) |
| Required indicator | Pass (except Fluent/MUI Textarea modal-only DIV-003, MUI CheckboxGroup DIV-004) |
| Disabled state | Pass |
| Validation display | Pass |
| Serialization conformance | Pass (except Mantine Number null — DIV-002, monitored) |

---

## 2. Adapter Production-Readiness Scorecard

| Adapter | Tier 1 Fields | Native | Fallback | Parity | Smoke | Accepted DIVs | Unresolved Gaps | Readiness | Tier 2 Target |
|---------|---------------|--------|----------|--------|-------|---------------|-----------------|-----------|---------------|
| **fluent** | 13/13 | 13 | 0 | Pass | Pass | DIV-003 | None | Production-ready primary | Primary |
| **mui** | 13/13 | 13 | 0 | Pass | Pass | DIV-003, DIV-004 | None | Production-ready primary | Primary |
| **headless** | 13/13 | 0 | 13 | Pass | Pass | None | None | Production-ready reference | Primary (always first) |
| **antd** | 13/13 | 13 | 0 | Pass | Pass | None | None | Production-ready primary | Primary |
| **mantine** | 13/13 | 13 | 0 | Pass | Pass | DIV-002 | None | Production-ready primary | Primary |
| **chakra** | 13/13 | 7 | 6 | Pass | Pass | DIV-008 | None | Production-ready with caveats | Secondary |
| **base-web** | 13/13 | 10 | 3 | Pass | Pass | None | None | Production-ready secondary | Secondary |
| **atlaskit** | 13/13 | 0 | 13 | Pass | Pass | DIV-007 | None | Compatibility layer | Fallback |
| **heroui** | 13/13 | 0 | 13 | Pass | Pass | DIV-007 | None | Compatibility layer | Fallback |
| **radix** | 13/13 | 6 | 7 | Pass | Pass | DIV-010, DIV-011 | None | Production-ready (unstyled) | Primary |
| **react-aria** | 13/13 | 10 | 3 | Pass | Pass | DIV-012 | None | Production-ready (unstyled) | Primary |

### Readiness Categories

| Category | Adapters | Meaning |
|----------|----------|---------|
| **Production-ready primary** | fluent, mui, antd, mantine | Full native components, battle-tested, recommended for production |
| **Production-ready reference** | headless | Reference implementation, ideal for testing and custom styling |
| **Production-ready (unstyled)** | radix, react-aria | Strong native coverage, unstyled — consumer provides CSS |
| **Production-ready secondary** | base-web | Mostly native, but requires specific provider wrappers |
| **Production-ready with caveats** | chakra | Functional but 6/13 fields use temporary HTML fallbacks (Ark UI DTS) |
| **Compatibility layer** | atlaskit, heroui | All semantic HTML — ecosystem-compatible but no native component benefit |

---

## 3. Tier 1 Gap Register

### Resolved in This Pass

| # | Issue | Resolution |
|---|-------|------------|
| 1 | DIV-006: Dropdown readOnly showed value not label | Fixed in all 11 adapters — now does options label lookup |
| 2 | Parity matrix showed atlaskit/base-web/heroui as "---" | Fixed — now correctly shows FB |
| 3 | Condition operator count (15 vs 18 vs 20) | Fixed — all current-state docs now say 20 |
| 4 | Base-web incorrectly classified as "compatibility/semantic HTML" | Fixed — now correctly classified as framework-native (10/13 native baseui) |
| 5 | Radix claimed "7 native + 6 semantic" | Fixed — actual is 6 native + 7 semantic |
| 6 | Choosing-an-adapter radix/react-aria fallback field lists | Fixed — corrected specific field names |

### Remaining Accepted Divergences (not blocking Tier 2)

| DIV | Issue | Severity | Blocks Tier 2? | Action |
|-----|-------|----------|-----------------|--------|
| DIV-001 | Number/Slider readOnly shows "0" not "-" | Low | No | Permanent acceptable |
| DIV-002 | Mantine NumberInput empty → null | Low | No | Monitor during Tier 2 |
| DIV-003 | Fluent/MUI Textarea required indicator in modal only | Medium | No | Should normalize eventually |
| DIV-004 | MUI CheckboxGroup required detection in jsdom | Low | No | Test-environment limitation |
| DIV-005 | MultiSelect readOnly rendering format variance | Low | No | Acceptable UX difference |
| DIV-007 | Atlaskit/heroui semantic HTML classification | Low | No | Permanent acceptable, documented |
| DIV-008 | Chakra 6-field HTML fallbacks (Ark UI DTS) | Medium | No | Monitor upstream |
| DIV-009 | Date picker UX variance across adapters | None | No | By design |
| DIV-010 | Radix Select empty value (undefined not "") | Low | No | Permanent acceptable |
| DIV-011 | Radix Slider array boundary conversion | None | No | Permanent acceptable |
| DIV-012 | React Aria Select Key type cast | None | No | Permanent acceptable |

### No Unresolved Tier 1 Gaps

All Tier 1 fields render, validate, serialize, and display readOnly correctly across all 11 adapters. The remaining divergences are either permanent-acceptable design decisions or low-severity edge cases that do not affect Tier 2 work.

---

## 4. Test Coverage Summary

| Suite | Files | Tests | Coverage |
|-------|-------|-------|----------|
| Core unit tests | 29 | ~616 | Rules engine, conditions, validation, expressions |
| Parity tests | 5 | ~2,713 | 11 adapters × 8 fixtures + edge cases |
| Consumer smoke | 1 | 36 | Registry shape + cloneElement compatibility |
| Business round-trip | 1 | ~220 | 6 adapters × realistic form configs |
| Render sanity | 1 | ~4 | Hang detection, option-heavy stress |
| Contract tests | 11 | ~726 | Per-adapter field rendering contracts |
| **Total vitest** | **55** | **~4,774** | |
| E2E (Playwright) | 7 | 54 | Full form lifecycle in browser |

---

## 5. Tier 2 Primary Target Adapters

Based on Tier 1 quality, native component availability, and ecosystem richness:

| Priority | Adapter | Rationale |
|----------|---------|-----------|
| 1 | headless | Always first — reference implementation for all new fields |
| 2 | fluent | Already has Tier 2 fields; strong FluentUI component library |
| 3 | mui | Already has Tier 2 fields; strong MUI component library |
| 4 | antd | Full native Tier 1; Ant Design has Rating, DateRange, Upload, etc. |
| 5 | mantine | Full native Tier 1; Mantine has Rating, DateTimePicker, FileInput, etc. |
| 6 | react-aria | 10/13 native; React Aria has DatePicker, ColorField, etc. |
| 7 | radix | 6/13 native; Radix has primitives for some Tier 2 fields |
| 8 | base-web | 10/13 native; baseui has FileUploader, DatePicker |
| 9 | chakra | 7/13 native; Ark UI DTS issues may complicate Tier 2 |
| 10 | atlaskit | Semantic HTML; Tier 2 will also be HTML fallbacks |
| 11 | heroui | Semantic HTML; Tier 2 will also be HTML fallbacks |
