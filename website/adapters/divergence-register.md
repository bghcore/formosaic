---
title: Divergence Register
---

# Divergence Register

Structured tracking of all known behavioral differences across Formosaic adapters.
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
| Affected adapters | All 11 |
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

### DIV-003: Fluent/MUI Textarea required indicator (PopOutEditor) -- RESOLVED

| Property | Value |
|----------|-------|
| Affected adapters | ~~fluent, mui~~ **None (fixed)** |
| Affected fields | Textarea |
| Observed behavior | PopOutEditor shows required `*` only inside the expanded modal dialog title, not in the inline textarea rendering |
| Canonical expectation | Required indicator should be visible in all rendering modes |
| Root cause | PopOutEditor inline rendering did not propagate required attribute |
| Severity | ~~Medium~~ **Resolved** |
| User-visible | ~~Yes~~ **No (fixed)** |
| jsdom-only | No |
| Category | ~~UX-visible inconsistency~~ **Resolved** |
| Resolution | Fluent inline `<Textarea>` now receives `aria-required={required}`. MUI inline `<TextField>` now receives `required={required}` (which sets both the visual `*` and `aria-required` automatically). |

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

### DIV-006: Dropdown readOnly shows value not label -- RESOLVED

| Property | Value |
|----------|-------|
| Affected adapters | ~~All 11~~ **None (fixed in v1.5.2)** |
| Affected fields | Dropdown |
| Observed behavior | ReadOnly rendering showed the option VALUE string, not the option LABEL |
| Canonical expectation | "selected option label (not value), or '-'" per readOnly contract for single-select fields |
| Root cause | ReadOnlyText received `value` directly without options lookup |
| Severity | ~~Medium~~ **Resolved** |
| User-visible | ~~Yes~~ **No (fixed)** |
| jsdom-only | No |
| Category | ~~Should normalize before Tier 2~~ **Resolved** |
| Resolution | All 11 adapters now perform `options?.find(o => String(o.value) === String(value))?.label` before passing to ReadOnlyText. Falls back to raw value if label lookup fails. |

### DIV-007: Semantic HTML adapter classification honesty

| Property | Value |
|----------|-------|
| Affected adapters | atlaskit, heroui |
| Affected fields | All |
| Observed behavior | These adapters are labeled as "Atlassian Design System" and "HeroUI" but use pure semantic HTML, not their namesake UI library components |
| Canonical expectation | Package names imply native component usage |
| Root cause | Adapters created for ecosystem compatibility; native components had jsdom/SSR issues |
| Severity | Low |
| User-visible | No — behavior is correct, just classification |
| jsdom-only | No |
| Category | Permanent acceptable |
| Recommended action | Package READMEs clarify this. Note: base-web was previously listed here but actually uses native baseui components for 9/12 Tier 1 fields (Textbox, Number, Toggle, Dropdown, MultiSelect, Slider, RadioGroup, CheckboxGroup, Textarea). Only DateControl, DynamicFragment, and ReadOnly use HTML fallbacks. |

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

### DIV-010: Radix Select empty value handling

| Property | Value |
|----------|-------|
| Affected adapters | radix |
| Affected fields | Dropdown |
| Observed behavior | Radix Select.Root does not support `""` as a value; uses `undefined` for no selection. Empty trigger text displayed instead of empty string. |
| Canonical expectation | Empty string `""` for no selection |
| Root cause | Radix Select uses `undefined` internally for uncontrolled/empty state; `""` is not a valid value |
| Severity | Low |
| User-visible | No — form state ends up equivalent (both represent "no selection") |
| jsdom-only | No |
| Category | Permanent acceptable |
| Recommended action | Accept. The boundary conversion `(value as string) \|\| undefined` handles this cleanly. Form state remains conformant. |

### DIV-011: Radix Slider array boundary conversion

| Property | Value |
|----------|-------|
| Affected adapters | radix |
| Affected fields | Slider |
| Observed behavior | Radix Slider uses `number[]` for value/onValueChange; Formosaic uses single `number` |
| Canonical expectation | Single number value |
| Root cause | Radix Slider supports multi-thumb sliders; single-thumb is `[number]` |
| Severity | None |
| User-visible | No — conversion is transparent |
| jsdom-only | No |
| Category | Permanent acceptable |
| Recommended action | None. The boundary conversion `value={[num]}` / `onValueChange={([num]) => ...}` is clean and lossless. |

### DIV-012: React Aria Select Key type cast

| Property | Value |
|----------|-------|
| Affected adapters | react-aria |
| Affected fields | Dropdown |
| Observed behavior | React Aria Select uses `Key` type (string \| number) for selectedKey/onSelectionChange; Formosaic uses string |
| Canonical expectation | String value |
| Root cause | React Aria's Key type is a union of string and number to support both use cases |
| Severity | None |
| User-visible | No — `String(key)` cast is transparent |
| jsdom-only | No |
| Category | Permanent acceptable |
| Recommended action | None. The `String(key)` cast in `onSelectionChange` is clean and lossless. |
