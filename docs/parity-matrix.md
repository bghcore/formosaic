# Adapter Parity Matrix

Implementation status of 32 field types across 11 adapter packages (+ shadcn recipe model).

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
| 14 | MultiSelectSearch | `MultiSelectSearch` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 15 | PopOutEditor / Textarea | `Textarea`* | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 16 | DocumentLinks | `DocumentLinks` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 17 | StatusDropdown | `StatusDropdown` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 18 | Rating | `Rating` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 19 | ColorPicker | `ColorPicker` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 20 | Autocomplete | `Autocomplete` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 21 | FileUpload | `FileUpload` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 22 | DateRange | `DateRange` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 23 | DateTime | `DateTime` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 24 | PhoneInput | `PhoneInput` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 25 | ChoiceSet | `ChoiceSet` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 26 | FieldArray | `FieldArray` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| | **Tier 3 (Read-Only)** | | | | | | | | | | | | |
| 27 | ReadOnlyArray | `ReadOnlyArray` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 28 | ReadOnlyDateTime | `ReadOnlyDateTime` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 29 | ReadOnlyCumulativeNumber | `ReadOnlyCumulativeNumber` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 30 | ReadOnlyRichText | `ReadOnlyRichText` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | ReadOnlyWithButton | `ReadOnlyWithButton` | Y | Y | FB | --- | --- | --- | --- | --- | --- | --- | --- |
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

## Tier 2 Gap Summary

The following Tier 2 field types are only implemented in fluent, mui, and headless adapters. All other adapters do not yet support these:

| Type | Description | Complexity |
|---|---|---|
| MultiSelectSearch | Searchable multi-select with async options | High -- requires combobox pattern |
| DocumentLinks | Dynamic link list with add/delete | Medium -- structured data UI |
| StatusDropdown | Dropdown with color-coded status indicators | Low -- styled dropdown variant |
| Rating | Star/numeric rating input | Low -- simple range input |
| ColorPicker | Color selection with preview | Medium -- requires color picker widget |
| Autocomplete | Typeahead search input | High -- requires combobox pattern |
| FileUpload | File selection with drag-and-drop | Medium -- file input + preview |
| DateRange | Start/end date pair picker | Medium -- dual date inputs |
| DateTime | Date + time picker | Medium -- date + time inputs |
| PhoneInput | Formatted phone number input | Low -- masked input |

Tier 3 read-only types (ReadOnlyArray, ReadOnlyDateTime, ReadOnlyCumulativeNumber, ReadOnlyRichText, ReadOnlyWithButton) are display-only and relatively low complexity to implement.

## Adapter Strength Summary

**Full Tier 1 + Tier 2 (26+ field types):** fluent, mui, headless -- all fields native or reference HTML.

**Native Tier 1 (13 types):** antd (Ant Design v5), mantine (Mantine v7) -- all 13 use real library components.

**Hybrid Tier 1 (13 types, mix):** chakra (7 native + 6 HTML fallback due to Ark UI DTS), base-web (10 native baseui + 3 HTML).

**Primitives-first (13 types, unstyled):** radix (6 Radix primitives + 7 HTML), react-aria (10 React Aria Components + 3 HTML).

**Compatibility (13 types, all semantic HTML):** atlaskit, heroui.
