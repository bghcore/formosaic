# Adapter Parity Matrix

Implementation status of 32 field types across 11 adapter packages. All adapters now support 28 of 32 types (v1.6.0).

## Legend

- **Y** -- Native UI library component
- **FB** -- HTML fallback (semantic HTML, data-* attributes, ARIA)
- **---** -- Not implemented

## Matrix

| # | ComponentType | Type Key | fluent | mui | headless | antd | chakra | mantine | atlaskit | base-web | heroui | radix | react-aria |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| | **Tier 1 (Core)** | | | | | | | | | | | | |
| 1 | Textbox | `Textbox` | Y | Y | FB | Y | Y | Y | FB | Y | FB | FB | Y |
| 2 | Number | `Number` | Y | Y | FB | Y | FB | Y | FB | Y | FB | FB | Y |
| 3 | Toggle | `Toggle` | Y | Y | FB | Y | FB | Y | FB | Y | FB | Y | Y |
| 4 | Dropdown | `Dropdown` | Y | Y | FB | Y | Y | Y | FB | Y | FB | Y | Y |
| 5 | SimpleDropdown | `SimpleDropdown` | Y | Y | FB | Y | Y | Y | FB | Y | FB | Y | Y |
| 6 | MultiSelect | `MultiSelect` | Y | Y | FB | Y | FB | Y | FB | Y | FB | FB | FB |
| 7 | DateControl | `DateControl` | Y | Y | FB | Y | Y | Y | FB | FB | FB | FB | FB |
| 8 | Slider | `Slider` | Y | Y | FB | Y | FB | Y | FB | Y | FB | Y | Y |
| 9 | RadioGroup | `RadioGroup` | Y | Y | FB | Y | FB | Y | FB | Y | FB | Y | Y |
| 10 | CheckboxGroup | `CheckboxGroup` | Y | Y | FB | Y | FB | Y | FB | Y | FB | Y | Y |
| 11 | Textarea | `Textarea` | Y | Y | FB | Y | Y | Y | FB | Y | FB | FB | FB |
| 12 | DynamicFragment | `DynamicFragment` | Y | Y | FB | Y | Y | Y | FB | FB | FB | FB | FB |
| 13 | ReadOnly | `ReadOnly` | Y | Y | FB | Y | Y | Y | FB | FB | FB | FB | FB |
| | **Tier 2 (Extended)** | | | | | | | | | | | | |
| 14 | Rating | `Rating` | Y | Y | FB | Y | FB | Y | FB | FB | FB | FB | FB |
| 15 | Autocomplete | `Autocomplete` | Y | Y | FB | Y | FB | Y | FB | FB | FB | FB | Y |
| 16 | DateTime | `DateTime` | Y | Y | FB | Y | FB | Y | FB | FB | FB | FB | FB |
| 17 | DateRange | `DateRange` | Y | Y | FB | Y | FB | FB | FB | FB | FB | FB | FB |
| 18 | PhoneInput | `PhoneInput` | Y | Y | FB | FB | FB | FB | FB | FB | FB | FB | FB |
| 19 | FileUpload | `FileUpload` | Y | Y | FB | Y | FB | Y | FB | FB | FB | FB | FB |
| 20 | ColorPicker | `ColorPicker` | Y | Y | FB | Y | FB | Y | FB | FB | FB | FB | FB |
| 21 | MultiSelectSearch | `MultiSelectSearch` | Y | Y | FB | FB | FB | FB | FB | FB | FB | FB | FB |
| 22 | StatusDropdown | `StatusDropdown` | Y | Y | FB | FB | FB | FB | FB | FB | FB | FB | FB |
| 23 | DocumentLinks | `DocumentLinks` | Y | Y | FB | FB | FB | FB | FB | FB | FB | FB | FB |
| 24 | PopOutEditor / Textarea | `Textarea`* | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 25 | ChoiceSet | `ChoiceSet` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 26 | FieldArray | `FieldArray` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| | **Tier 3 (Read-Only)** | | | | | | | | | | | | |
| 27 | ReadOnlyArray | `ReadOnlyArray` | Y | Y | FB | FB | FB | FB | FB | FB | FB | FB | FB |
| 28 | ReadOnlyDateTime | `ReadOnlyDateTime` | Y | Y | FB | FB | FB | FB | FB | FB | FB | FB | FB |
| 29 | ReadOnlyCumulativeNumber | `ReadOnlyCumulativeNumber` | Y | Y | FB | FB | FB | FB | FB | FB | FB | FB | FB |
| 30 | ReadOnlyRichText | `ReadOnlyRichText` | Y | Y | FB | FB | FB | FB | FB | FB | FB | FB | FB |
| 31 | ReadOnlyWithButton | `ReadOnlyWithButton` | Y | Y | FB | FB | FB | FB | FB | FB | FB | FB | FB |
| 32 | RichText | `RichText` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |

\* The `Textarea` type key maps to `PopOutEditor` in the fluent adapter (rich textarea with modal) and to `Textarea` in all other adapters.

**Notes:**
- fluent and mui use framework-native components for all fields.
- headless uses semantic HTML for all fields (this IS its native implementation -- unstyled by design).
- antd uses native Ant Design v5 components; 6 Chakra fields use HTML fallbacks due to Ark UI DTS issues (see below).
- mantine uses native Mantine v7 components for all Tier 1 fields.
- atlaskit uses semantic HTML for all fields (no @atlaskit/* package imports) with `ak-` CSS class prefix.
- base-web uses native baseui components for 10/13 Tier 1 fields; DateControl, DynamicFragment, and ReadOnly use HTML fallbacks.
- heroui uses semantic HTML for all fields (no @heroui/* package imports).
- radix uses 6 native Radix UI primitives (Toggle, Dropdown, SimpleDropdown, Slider, RadioGroup, CheckboxGroup) + 7 semantic HTML fields (primitives-first, unstyled).
- react-aria uses 10 native React Aria Components + 3 semantic HTML fields (accessibility-first).
- shadcn/ui: No dedicated package. Use @form-eng/radix as a base with local Tailwind/shadcn wrappers (see docs/shadcn-integration.md).

## Chakra Fallback Details

The Chakra UI v3 adapter uses semantic HTML fallbacks for several field types due to TypeScript DTS compatibility issues with Ark UI's `Assign` type. Chakra v3's compound components (Switch, Slider, RadioGroup, CheckboxGroup, NumberInput) rely on Ark UI internally, and the `Assign` utility type causes declaration file generation failures when building with tsup.

### Affected Components

| Component | Chakra Component | Fallback Used | Styling |
|---|---|---|---|
| Number | `NumberInput` (Ark) | `<input type="number">` via Chakra `Input` | Chakra `Input` component |
| Toggle | `Switch` (Ark) | `<input type="checkbox" role="switch">` | Chakra CSS variables |
| MultiSelect | `Select` (Ark) | `<select multiple>` | Chakra CSS variables |
| Slider | `Slider` (Ark) | `<input type="range">` | Chakra CSS variables |
| RadioGroup | `RadioGroup` (Ark) | `<fieldset>` + `<input type="radio">` | Chakra CSS variables |
| CheckboxGroup | `CheckboxGroup` (Ark) | `<fieldset>` + `<input type="checkbox">` | Chakra CSS variables |

### Non-Affected Components

| Component | Implementation | Notes |
|---|---|---|
| Textbox | Chakra `Input` | No Ark dependency |
| Dropdown | Chakra `NativeSelect` | No Ark dependency |
| SimpleDropdown | Chakra `NativeSelect` | No Ark dependency |
| DateControl | Chakra `Input` (`type="date"`) | No Ark dependency |
| Textarea | Chakra `Textarea` | No Ark dependency |
| DynamicFragment | `<input type="hidden">` | No UI component needed |
| ReadOnly | `ReadOnlyText` | Plain text display |

### Root Cause

Ark UI's `Assign<T, U>` type merges two types but produces a conditional type that TypeScript cannot resolve when generating `.d.ts` files through tsup/rollup-plugin-dts. This is a known upstream issue. The fallback components are fully functional and styled with Chakra's CSS custom properties for visual consistency.

## Remaining Gaps

The following field types remain implemented only in fluent, mui, and headless:

| Type | Description | Notes |
|---|---|---|
| PopOutEditor | Rich textarea with modal editing | fluent/mui-specific pattern |
| ChoiceSet | Adaptive Card choice set | Legacy compatibility type |
| FieldArray | Dynamic field array with add/remove | Uses react-hook-form useFieldArray |
| RichText | WYSIWYG rich text editor | Requires editor library dependency |

These are specialized types that either depend on adapter-specific features or require additional library dependencies.

## Adapter Strength Summary

**Full coverage (28 field types):** All 11 adapters now implement 28 field types (13 Tier 1 + 10 Tier 2 extended + 5 read-only variants). The remaining 4 types (PopOutEditor, ChoiceSet, FieldArray, RichText) are fluent/mui/headless only.

**Native Tier 2 implementations:**
- **antd** -- 6 native: Rate, AutoComplete, DatePicker+showTime, RangePicker, Upload, ColorPicker
- **mantine** -- 5 native: Rating, Autocomplete, DateTimePicker, FileInput, ColorInput
- **react-aria** -- 1 native: ComboBox for Autocomplete
- All other Tier 2 fields use semantic HTML fallbacks across all adapters

**Overall native counts (Tier 1 + Tier 2):**
- antd: 19 native + 9 HTML
- mantine: 18 native + 10 HTML
- chakra: 7 native + 21 HTML
- base-web: 10 native + 18 HTML
- radix: 6 native + 22 HTML
- react-aria: 11 native + 17 HTML
- atlaskit: 0 native / 28 HTML (compatibility)
- heroui: 0 native / 28 HTML (compatibility)
