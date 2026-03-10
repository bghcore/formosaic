# Tier 2 Launch Checklist

Final go/no-go assessment for beginning Tier 2 field expansion.

## 1. Is Tier 1 truly stable enough to stop revisiting?

**Yes.**

- All 13 Tier 1 fields pass parity, contract, smoke, edge-case, and round-trip tests across all 11 adapters.
- DIV-006 (Dropdown readOnly value vs label) — the last actionable divergence — was resolved in this pass.
- All remaining divergences (DIV-001 through DIV-012 except DIV-006) are classified as permanent-acceptable, temporary-acceptable, or test-environment-only. None block Tier 2.
- Documentation is now fully reconciled: parity matrix, capability matrix, divergence register, adapter guide, and READMEs all agree on support claims.

## 2. Which Tier 1 issues remain open, if any?

| DIV | Issue | Status | Impact on Tier 2 |
|-----|-------|--------|-----------------|
| DIV-001 | Number/Slider readOnly "0" not "-" | Permanent acceptable | None — same pattern for Rating/numeric |
| DIV-002 | Mantine NumberInput empty → null | Monitor | Watch if Mantine Tier 2 fields also normalize |
| DIV-003 | Fluent/MUI PopOutEditor required indicator | Should normalize | Low priority, can fix during Tier 2 Textarea work |
| DIV-004 | MUI CheckboxGroup required in jsdom | Test-environment | None |
| DIV-005 | MultiSelect readOnly format variance | Acceptable | May affect MultiSelectSearch readOnly |
| DIV-008 | Chakra Ark UI DTS fallbacks | Temporary | Monitor upstream; affects Tier 2 component choices |

**None of these block Tier 2 start.**

## 3. Which adapters are the primary launch targets for Tier 2?

### Tier 2 Primary (implement first for each new field)

| Priority | Adapter | Reason |
|----------|---------|--------|
| 1 | **headless** | Always first — reference implementation |
| 2 | **fluent** | Already has Tier 2 fields, strongest ecosystem |
| 3 | **mui** | Already has Tier 2 fields, large community |
| 4 | **antd** | Rich component library (Rating, Upload, DateRange) |
| 5 | **mantine** | Rich component library (Rating, DateTimePicker, FileInput) |

### Tier 2 Secondary (implement in Wave 2 or alongside primary)

| Adapter | Reason |
|---------|--------|
| **react-aria** | Excellent a11y, React Aria covers most Tier 2 patterns |
| **radix** | Good primitives base, expand alongside shadcn recipes |
| **base-web** | 10/13 native; baseui has relevant Tier 2 components |

### Tier 2 Fallback (implement last, use semantic HTML)

| Adapter | Reason |
|---------|--------|
| **chakra** | Ark UI DTS issues may affect new fields — semantic HTML fallbacks are fine |
| **atlaskit** | Semantic HTML throughout — straightforward to add fields |
| **heroui** | Semantic HTML throughout — straightforward to add fields |

## 4. Which Tier 1 implementation patterns should be copied for new fields?

See `docs/tier1-patterns.md` for the full blueprint. Quick reference:

| New Field | Copy Pattern From |
|-----------|-------------------|
| Rating | Number (numeric pattern) + Slider (range-like readOnly) |
| Autocomplete | Dropdown (selection-single pattern) + Textbox (search input) |
| DateTime | DateControl (date pattern) + time component |
| DateRange | DateControl (date pattern) x2 |
| PhoneInput | Textbox (text-like pattern) + input mask |
| FileUpload | Custom — new pattern needed |
| ColorPicker | Custom — new pattern needed |
| MultiSelectSearch | MultiSelect (selection-multi pattern) + Autocomplete (combobox) |
| StatusDropdown | Dropdown (selection-single pattern) + status styling |
| DocumentLinks | Custom — structured list pattern |

## 5. Which adapters should only receive partial/deferred Tier 2 support initially?

| Adapter | Strategy |
|---------|----------|
| atlaskit | All Tier 2 fields as semantic HTML fallbacks — add with primary adapters |
| heroui | Same as atlaskit |
| chakra | Tier 2 fields that don't use Ark UI compound components can be native; others use fallbacks |
| base-web | Most Tier 2 fields can use native baseui; DatePicker may need fallback (react-input-mask) |

## 6. Which docs must stay in sync as Tier 2 lands?

| Document | Update When |
|----------|-------------|
| `docs/parity-matrix.md` | Every new field added to any adapter |
| `docs/field-capability-matrix.md` | Every new field added to any adapter |
| `docs/divergence-register.md` | Any new behavioral divergence discovered |
| `docs/choosing-an-adapter.md` | Adapter readiness levels change |
| `docs/tier2-feasibility-matrix.md` | Fields move from planned to implemented |
| Package READMEs | Field count changes |
| Package AGENTS.md files | New field component patterns |
| `CLAUDE.md` | Major architecture changes |
| Root `README.md` | Feature-level changes |

## 7. Is the repo ready to begin Tier 2 now?

### Go/No-Go Checklist

| # | Criterion | Status |
|---|-----------|--------|
| 1 | All Tier 1 fields pass across all 11 adapters | **GO** |
| 2 | No unresolved Tier 1 blocking issues | **GO** |
| 3 | Documentation is reconciled and accurate | **GO** |
| 4 | Parity test infrastructure supports new fields | **GO** |
| 5 | Contract test infrastructure supports new fields | **GO** |
| 6 | Implementation patterns documented for Tier 2 | **GO** |
| 7 | Adapter priority order established | **GO** |
| 8 | Tier 2 wave plan exists (tier2-feasibility-matrix.md) | **GO** |

### Verdict: **GO for Tier 2**

The repo is ready to begin Tier 2 field expansion. Recommended starting point:

**Wave 1:** Rating, Autocomplete, DateTime
- Start with headless reference implementation
- Then fluent/mui (which already have these fields — verify parity)
- Then antd/mantine (native components available)
- Then radix/react-aria/base-web
- Finally atlaskit/heroui/chakra (semantic HTML fallbacks)

Tier 1 should not need another general pass after this. Individual Tier 1 fixes can be made alongside Tier 2 work as needed.
