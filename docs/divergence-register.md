# Divergence Register

Structured tracking of all known behavioral differences across form-engine adapters.
Each entry is classified by severity and recommended action for Tier 2 readiness.

## Classification Key

| Category | Meaning |
|----------|---------|
| Permanent acceptable | By-design difference that will not change |
| Temporary acceptable | Acceptable now, should normalize eventually |
| Test-environment limitation | Only manifests in jsdom, not in real browsers |
| UX-visible inconsistency | Users may notice different behavior across adapters |
| Should normalize before Tier 2 | Fix before expanding field coverage |
| Must monitor during Tier 2 | Track actively during Tier 2 expansion |

## Register

### DIV-001: Number/Slider readOnly null coercion

| Property | Value |
|----------|-------|
| Affected adapters | All 9 |
| Affected fields | Number, Slider |
| Observed behavior | readOnly with null/undefined shows "0" (Number) or "0" (Slider) instead of "-" sentinel |
| Canonical expectation | Empty sentinel "-" per readOnly contract |
| Root cause | `?? 0` coercion in Number field; Slider always coerces to 0 for range input |
| Severity | Low |
| User-visible | Yes — readOnly Number shows "0" instead of "-" when no value is set |
| jsdom-only | No — same behavior in real browsers |
| Category | Permanent acceptable |
| Recommended action | Document as accepted. The coercion is intentional: Number/Slider need numeric values for their inputs. ReadOnly inherits this. Attempting to show "-" would require special-casing the readOnly path to distinguish "no value" from "value is 0", which is fragile. |

### DIV-002: Mantine NumberInput empty → null

| Property | Value |
|----------|-------|
| Affected adapters | mantine |
| Affected fields | Number |
| Observed behavior | Clearing Mantine NumberInput calls setFieldValue(fieldName, null). Other adapters leave it as browser-level empty state (no setFieldValue call on clear). |
| Canonical expectation | Both null and undefined are valid empty values per canonical contract |
| Root cause | Mantine NumberInput onChange fires with empty string or null on clear |
| Severity | Low |
| User-visible | No (form state ends up equivalent) |
| jsdom-only | No |
| Category | Must monitor during Tier 2 |
| Recommended action | Monitor. If Mantine Tier 2 fields also normalize empty→null, this becomes a pattern, not a bug. |

### DIV-003: Fluent/MUI Textarea required indicator (PopOutEditor)

| Property | Value |
|----------|-------|
| Affected adapters | fluent, mui |
| Affected fields | Textarea |
| Observed behavior | PopOutEditor shows required `*` only inside the expanded modal dialog title, not in the inline textarea rendering |
| Canonical expectation | Required indicator should be visible in all rendering modes |
| Root cause | PopOutEditor inline rendering does not propagate required attribute |
| Severity | Medium |
| User-visible | Yes — required indicator not visible until modal is opened |
| jsdom-only | No |
| Category | UX-visible inconsistency |
| Recommended action | Should normalize. The inline rendering of PopOutEditor should add aria-required or a visual `*`. This is a pre-existing design choice, not a regression. Fix is low-risk: add `aria-required={required}` to the inline `<TextField>`. |

### DIV-004: MUI CheckboxGroup required detection

| Property | Value |
|----------|-------|
| Affected adapters | mui |
| Affected fields | CheckboxGroup |
| Observed behavior | MUI FormControl with required={true} does not render a detectable required attribute in jsdom standalone rendering |
| Canonical expectation | Required should be detectable via aria-required or native required attribute |
| Root cause | MUI FormControl applies required semantics through FormLabel, not directly on the fieldset |
| Severity | Low |
| User-visible | No — FieldWrapper adds required indicator in production; this is standalone-render-only |
| jsdom-only | Partially — may also affect standalone usage without FieldWrapper |
| Category | Test-environment limitation |
| Recommended action | Accept for now. In production, FieldWrapper provides the required indicator. The parity test skip is appropriate. |

### DIV-005: MultiSelect readOnly rendering format

| Property | Value |
|----------|-------|
| Affected adapters | headless (`<ul>` list) vs antd (comma-join text) vs others |
| Affected fields | MultiSelect |
| Observed behavior | Different visual representations of selected values in readOnly mode |
| Canonical expectation | "comma-separated option labels, or '-'" per readOnly contract |
| Root cause | Adapters chose different HTML structures for list rendering |
| Severity | Low |
| User-visible | Yes — different visual structure, same semantic content |
| jsdom-only | No |
| Category | UX-visible inconsistency |
| Recommended action | Accept. The headless `<ul>` renders raw values (not labels), while antd comma-joins raw values. Both display the correct selected values. The headless list format provides better accessibility (screen readers enumerate items). Normalizing to comma-join would reduce accessibility. |

### DIV-006: Dropdown readOnly shows value not label

| Property | Value |
|----------|-------|
| Affected adapters | headless, atlaskit, base-web, heroui |
| Affected fields | Dropdown, SimpleDropdown |
| Observed behavior | ReadOnly rendering shows the option VALUE string, not the option LABEL |
| Canonical expectation | "selected option label (not value), or '-'" per readOnly contract for single-select fields |
| Root cause | ReadOnlyText receives `value` directly without options lookup |
| Severity | Medium |
| User-visible | Yes — user sees "opt1" instead of "Option 1" |
| jsdom-only | No |
| Category | Should normalize before Tier 2 |
| Recommended action | Fix. The readOnly rendering of Dropdown should look up the option label from the options array and display that instead of the raw value. This affects headless, atlaskit, base-web, heroui. The antd and mantine adapters also do this. Only fluent/mui handle it differently (PopOutEditor path). |

### DIV-007: Semantic HTML adapter classification honesty

| Property | Value |
|----------|-------|
| Affected adapters | atlaskit, heroui, base-web (partially) |
| Affected fields | All |
| Observed behavior | These adapters are labeled as "Atlassian Design System", "HeroUI", "Base Web" but use pure semantic HTML, not their namesake UI library components |
| Canonical expectation | Package names imply native component usage |
| Root cause | Adapters created for ecosystem compatibility before native components were integrated |
| Severity | Low |
| User-visible | No — behavior is correct, just classification |
| jsdom-only | No |
| Category | Permanent acceptable |
| Recommended action | Ensure adapter-architecture.md clearly documents these as "Compatibility" adapters using semantic HTML. Package READMEs should also clarify this. |

### DIV-008: Chakra compound component DTS fallbacks

| Property | Value |
|----------|-------|
| Affected adapters | chakra |
| Affected fields | Number, Toggle, MultiSelect, Slider, RadioGroup, CheckboxGroup |
| Observed behavior | 6 of 13 Tier 1 fields use semantic HTML instead of native Chakra components |
| Root cause | Ark UI v3 DTS issue (Assign type breaks .d.ts generation) |
| Severity | Medium |
| User-visible | Yes — different visual appearance from native Chakra components |
| jsdom-only | No |
| Category | Temporary acceptable |
| Recommended action | Monitor upstream Ark UI/Chakra v3 releases. When DTS issue is fixed, migrate to native components. Until then, HTML fallbacks are functional and styled with Chakra CSS variables. |

### DIV-009: Date picker UX variance

| Property | Value |
|----------|-------|
| Affected adapters | antd (dayjs DatePicker), headless/heroui (native `<input type="date">`), others vary |
| Affected fields | DateControl |
| Observed behavior | Different date picker UIs across adapters |
| Canonical expectation | ISO string serialization is consistent; UX is adapter-specific |
| Root cause | Each adapter uses its ecosystem's date component by design |
| Severity | None |
| User-visible | Yes — expected and intentional |
| jsdom-only | No |
| Category | Permanent acceptable |
| Recommended action | None. Each adapter uses its ecosystem's date component. The canonical contract only requires ISO string serialization. |
