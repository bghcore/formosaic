# Field Capability Matrix

## Overview

This document provides a per-field, per-adapter capability matrix for the 13 Tier 1 field types across all 9 form-engine adapter packages. It tracks the support level, implementation strategy, feature parity, and known caveats for each combination.

**Why this matrix exists:**
- Helps consumers choose the right adapter for their use case
- Documents where adapters diverge from canonical behavior
- Identifies parity risks for cross-adapter migration
- Guides future Tier 2 expansion work

### Terminology

- **Support Level**: `full` = all canonical behaviors implemented; `partial` = most behaviors but with documented gaps; `fallback` = uses semantic HTML instead of library component; `missing` = field type not registered
- **Implementation**: `native-component` = uses the UI library's own component; `semantic-html` = uses plain HTML elements styled for the ecosystem; `hybrid` = uses a mix of library and HTML elements
- **Canonical serialization**: `conformant` = matches the canonical value contract exactly; `divergent` = serializes differently (documented in notes)

---

## Field Capability Matrix

### Textbox

| Adapter | Support | Implementation | readOnly | disabled | required | validation | serialization | caveats |
|---------|---------|---------------|----------|----------|----------|------------|---------------|---------|
| fluent | full | native-component (Fluent Input) | yes | yes | yes | yes | conformant | PopOutEditor variant for Textarea |
| mui | full | native-component (MUI TextField) | yes | yes | yes | yes | conformant | |
| headless | full | semantic-html (`<input type="text">`) | yes | yes | yes | yes | conformant | Reference implementation |
| antd | full | native-component (antd Input) | yes | yes | yes | yes | conformant | Uses `status="error"` for validation |
| chakra | full | native-component (Chakra Input) | yes | yes | yes | yes | conformant | |
| mantine | full | native-component (Mantine TextInput) | yes | yes | yes | yes | conformant | |
| atlaskit | full | semantic-html (`<input type="text">`) | yes | yes | yes | yes | conformant | Styled for Atlassian ecosystem |
| base-web | full | native-component (baseui Input) | yes | yes | yes | yes | conformant | Uses overrides for data-testid |
| heroui | full | semantic-html (`<input type="text">`) | yes | yes | yes | yes | conformant | Styled for HeroUI ecosystem |

### Number

| Adapter | Support | Implementation | readOnly | disabled | required | validation | serialization | caveats |
|---------|---------|---------------|----------|----------|----------|------------|---------------|---------|
| fluent | full | native-component (Fluent SpinButton) | yes | yes | yes | yes | conformant | |
| mui | full | native-component (MUI TextField type=number) | yes | yes | yes | yes | conformant | |
| headless | full | semantic-html (`<input type="number">`) | yes | yes | yes | yes | conformant | |
| antd | full | native-component (antd InputNumber) | yes | yes | yes | yes | conformant | |
| chakra | full | semantic-html (`<input type="number">`) | yes | yes | yes | yes | conformant | Semantic HTML due to Ark UI DTS issues |
| mantine | full | native-component (Mantine NumberInput) | yes | yes | yes | yes | divergent | Empty input -> `null` explicitly (others leave as local state) |
| atlaskit | full | semantic-html (`<input type="number">`) | yes | yes | yes | yes | conformant | |
| base-web | full | native-component (baseui Input type=number) | yes | yes | yes | yes | conformant | |
| heroui | full | semantic-html (`<input type="number">`) | yes | yes | yes | yes | conformant | |

### Toggle

| Adapter | Support | Implementation | readOnly | disabled | required | validation | serialization | caveats |
|---------|---------|---------------|----------|----------|----------|------------|---------------|---------|
| fluent | full | native-component (Fluent Switch) | yes | yes | yes | yes | conformant | |
| mui | full | native-component (MUI Switch) | yes | yes | yes | yes | conformant | |
| headless | full | semantic-html (`<input type="checkbox" role="switch">`) | yes | yes | yes | yes | conformant | |
| antd | full | native-component (antd Switch) | yes | yes | yes | yes | conformant | |
| chakra | full | semantic-html (`<input type="checkbox" role="switch">`) | yes | yes | yes | yes | conformant | Semantic HTML due to Ark UI Switch DTS issues |
| mantine | full | native-component (Mantine Switch) | yes | yes | yes | yes | conformant | |
| atlaskit | full | semantic-html (`<input type="checkbox" role="switch">`) | yes | yes | yes | yes | conformant | |
| base-web | full | native-component (baseui Checkbox toggle) | yes | yes | yes | yes | conformant | Uses `STYLE_TYPE.toggle` |
| heroui | full | semantic-html (`<input type="checkbox" role="switch">`) | yes | yes | yes | yes | conformant | |

### Dropdown

| Adapter | Support | Implementation | readOnly | disabled | required | validation | serialization | caveats |
|---------|---------|---------------|----------|----------|----------|------------|---------------|---------|
| fluent | full | native-component (Fluent Combobox) | yes | yes | yes | yes | conformant | |
| mui | full | native-component (MUI Select) | yes | yes | yes | yes | conformant | |
| headless | full | semantic-html (`<select>`) | yes | yes | yes | yes | conformant | |
| antd | full | native-component (antd Select) | yes | yes | yes | yes | conformant | |
| chakra | full | native-component (Chakra NativeSelect) | yes | yes | yes | yes | conformant | Uses NativeSelect compound component |
| mantine | full | native-component (Mantine NativeSelect) | yes | yes | yes | yes | conformant | |
| atlaskit | full | semantic-html (`<select>`) | yes | yes | yes | yes | conformant | |
| base-web | full | native-component (baseui Select) | yes | yes | yes | yes | conformant | Uses baseui Select with clearable |
| heroui | full | semantic-html (`<select>`) | yes | yes | yes | yes | conformant | |

### SimpleDropdown

| Adapter | Support | Implementation | readOnly | disabled | required | validation | serialization | caveats |
|---------|---------|---------------|----------|----------|----------|------------|---------------|---------|
| fluent | full | native-component (Fluent Combobox) | yes | yes | yes | yes | conformant | Uses `config.dropdownOptions` |
| mui | full | native-component (MUI Select) | yes | yes | yes | yes | conformant | |
| headless | full | semantic-html (`<select>`) | yes | yes | yes | yes | conformant | |
| antd | full | native-component (antd Select) | yes | yes | yes | yes | conformant | |
| chakra | full | semantic-html (`<select>`) | yes | yes | yes | yes | conformant | |
| mantine | full | native-component (Mantine NativeSelect) | yes | yes | yes | yes | conformant | |
| atlaskit | full | semantic-html (`<select>`) | yes | yes | yes | yes | conformant | |
| base-web | full | native-component (baseui Select) | yes | yes | yes | yes | conformant | |
| heroui | full | semantic-html (`<select>`) | yes | yes | yes | yes | conformant | |

### MultiSelect

| Adapter | Support | Implementation | readOnly | disabled | required | validation | serialization | caveats |
|---------|---------|---------------|----------|----------|----------|------------|---------------|---------|
| fluent | full | native-component (Fluent Combobox multi) | yes | yes | yes | yes | conformant | |
| mui | full | native-component (MUI Autocomplete multi) | yes | yes | yes | yes | conformant | |
| headless | full | semantic-html (`<select multiple>`) | yes | yes | yes | yes | conformant | ReadOnly renders `<ul>` list |
| antd | full | native-component (antd Select mode=multiple) | yes | yes | yes | yes | conformant | |
| chakra | full | semantic-html (`<select multiple>`) | yes | yes | yes | yes | conformant | |
| mantine | full | native-component (Mantine MultiSelect) | yes | yes | yes | yes | conformant | |
| atlaskit | full | semantic-html (`<select multiple>`) | yes | yes | yes | yes | conformant | |
| base-web | full | native-component (baseui Select multi) | yes | yes | yes | yes | conformant | |
| heroui | full | semantic-html (`<select multiple>`) | yes | yes | yes | yes | conformant | |

### DateControl

| Adapter | Support | Implementation | readOnly | disabled | required | validation | serialization | caveats |
|---------|---------|---------------|----------|----------|----------|------------|---------------|---------|
| fluent | full | native-component (Fluent DatePicker) | yes | yes | yes | yes | conformant | |
| mui | full | native-component (MUI DatePicker) | yes | yes | yes | yes | conformant | |
| headless | full | semantic-html (`<input type="date">`) | yes | yes | yes | yes | conformant | Native HTML date picker, `<time>` for readOnly |
| antd | full | native-component (antd DatePicker) | yes | yes | yes | yes | conformant | Uses dayjs internally, converts to ISO at boundary |
| chakra | full | semantic-html (`<input type="date">`) | yes | yes | yes | yes | conformant | |
| mantine | full | native-component (Mantine DateInput) | yes | yes | yes | yes | conformant | |
| atlaskit | full | semantic-html (`<input type="date">`) | yes | yes | yes | yes | conformant | |
| base-web | full | semantic-html (`<input type="date">`) | yes | yes | yes | yes | conformant | No baseui DatePicker; falls back to native HTML |
| heroui | full | semantic-html (`<input type="date">`) | yes | yes | yes | yes | conformant | Native HTML date picker |

### Slider

| Adapter | Support | Implementation | readOnly | disabled | required | validation | serialization | caveats |
|---------|---------|---------------|----------|----------|----------|------------|---------------|---------|
| fluent | full | native-component (Fluent Slider) | yes | yes | yes | yes | conformant | |
| mui | full | native-component (MUI Slider) | yes | yes | yes | yes | conformant | |
| headless | full | semantic-html (`<input type="range">`) | yes | yes | yes | yes | conformant | |
| antd | full | native-component (antd Slider) | yes | yes | yes | yes | conformant | |
| chakra | full | semantic-html (`<input type="range">`) | yes | yes | yes | yes | conformant | |
| mantine | full | native-component (Mantine Slider) | yes | yes | yes | yes | conformant | |
| atlaskit | full | semantic-html (`<input type="range">`) | yes | yes | yes | yes | conformant | |
| base-web | full | native-component (baseui Slider) | yes | yes | yes | yes | conformant | |
| heroui | full | semantic-html (`<input type="range">`) | yes | yes | yes | yes | conformant | |

### RadioGroup

| Adapter | Support | Implementation | readOnly | disabled | required | validation | serialization | caveats |
|---------|---------|---------------|----------|----------|----------|------------|---------------|---------|
| fluent | full | native-component (Fluent RadioGroup) | yes | yes | yes | yes | conformant | |
| mui | full | native-component (MUI RadioGroup) | yes | yes | yes | yes | conformant | |
| headless | full | semantic-html (`<input type="radio">`) | yes | yes | yes | yes | conformant | |
| antd | full | native-component (antd Radio.Group) | yes | yes | yes | yes | conformant | |
| chakra | full | semantic-html (`<input type="radio">`) | yes | yes | yes | yes | conformant | |
| mantine | full | native-component (Mantine Radio.Group) | yes | yes | yes | yes | conformant | |
| atlaskit | full | semantic-html (`<input type="radio">`) | yes | yes | yes | yes | conformant | |
| base-web | full | native-component (baseui RadioGroup) | yes | yes | yes | yes | conformant | |
| heroui | full | semantic-html (`<input type="radio">`) | yes | yes | yes | yes | conformant | |

### CheckboxGroup

| Adapter | Support | Implementation | readOnly | disabled | required | validation | serialization | caveats |
|---------|---------|---------------|----------|----------|----------|------------|---------------|---------|
| fluent | full | native-component (Fluent Checkbox) | yes | yes | yes | yes | conformant | |
| mui | full | native-component (MUI Checkbox) | yes | yes | yes | yes | conformant | |
| headless | full | semantic-html (`<input type="checkbox">`) | yes | yes | yes | yes | conformant | |
| antd | full | native-component (antd Checkbox.Group) | yes | yes | yes | yes | conformant | |
| chakra | full | semantic-html (`<input type="checkbox">`) | yes | yes | yes | yes | conformant | |
| mantine | full | native-component (Mantine Checkbox.Group) | yes | yes | yes | yes | conformant | |
| atlaskit | full | semantic-html (`<input type="checkbox">`) | yes | yes | yes | yes | conformant | |
| base-web | full | native-component (baseui Checkbox) | yes | yes | yes | yes | conformant | |
| heroui | full | semantic-html (`<input type="checkbox">`) | yes | yes | yes | yes | conformant | |

### Textarea

| Adapter | Support | Implementation | readOnly | disabled | required | validation | serialization | caveats |
|---------|---------|---------------|----------|----------|----------|------------|---------------|---------|
| fluent | full | native-component (Fluent PopOutEditor) | yes | yes | yes | yes | conformant | Expand-to-modal rich textarea |
| mui | full | native-component (MUI TextField multiline) | yes | yes | yes | yes | conformant | |
| headless | full | semantic-html (`<textarea>`) | yes | yes | yes | yes | conformant | |
| antd | full | native-component (antd Input.TextArea) | yes | yes | yes | yes | conformant | |
| chakra | full | semantic-html (`<textarea>`) | yes | yes | yes | yes | conformant | |
| mantine | full | native-component (Mantine Textarea) | yes | yes | yes | yes | conformant | |
| atlaskit | full | semantic-html (`<textarea>`) | yes | yes | yes | yes | conformant | |
| base-web | full | native-component (baseui Textarea) | yes | yes | yes | yes | conformant | |
| heroui | full | semantic-html (`<textarea>`) | yes | yes | yes | yes | conformant | |

### DynamicFragment

| Adapter | Support | Implementation | readOnly | disabled | required | validation | serialization | caveats |
|---------|---------|---------------|----------|----------|----------|------------|---------------|---------|
| fluent | full | semantic-html (`<input type="hidden">`) | yes | n/a | n/a | n/a | conformant | Invisible field |
| mui | full | semantic-html (`<input type="hidden">`) | yes | n/a | n/a | n/a | conformant | |
| headless | full | semantic-html (`<input type="hidden">`) | yes | n/a | n/a | n/a | conformant | |
| antd | full | semantic-html (`<input type="hidden">`) | yes | n/a | n/a | n/a | conformant | |
| chakra | full | semantic-html (`<input type="hidden">`) | yes | n/a | n/a | n/a | conformant | |
| mantine | full | semantic-html (`<input type="hidden">`) | yes | n/a | n/a | n/a | conformant | |
| atlaskit | full | semantic-html (`<input type="hidden">`) | yes | n/a | n/a | n/a | conformant | |
| base-web | full | semantic-html (`<input type="hidden">`) | yes | n/a | n/a | n/a | conformant | |
| heroui | full | semantic-html (`<input type="hidden">`) | yes | n/a | n/a | n/a | conformant | |

### ReadOnly

| Adapter | Support | Implementation | readOnly | disabled | required | validation | serialization | caveats |
|---------|---------|---------------|----------|----------|----------|------------|---------------|---------|
| fluent | full | ReadOnlyText component | always | n/a | n/a | n/a | n/a | |
| mui | full | ReadOnlyText component | always | n/a | n/a | n/a | n/a | |
| headless | full | ReadOnlyText component | always | n/a | n/a | n/a | n/a | |
| antd | full | ReadOnlyText component | always | n/a | n/a | n/a | n/a | |
| chakra | full | ReadOnlyText component | always | n/a | n/a | n/a | n/a | |
| mantine | full | ReadOnlyText component | always | n/a | n/a | n/a | n/a | |
| atlaskit | full | ReadOnlyText component | always | n/a | n/a | n/a | n/a | |
| base-web | full | ReadOnlyText component | always | n/a | n/a | n/a | n/a | |
| heroui | full | ReadOnlyText component | always | n/a | n/a | n/a | n/a | |

---

## Summary

### Adapter Strength Tiers

**Full Tier 1 + Tier 2 support (26+ field types):**
- **fluent** -- All fields use Fluent UI v9 native components. Full readOnly, validation, ARIA. Includes Tier 2 fields: Rating, ColorPicker, Autocomplete, FileUpload, DateRange, DateTime, PhoneInput, MultiSelectSearch, StatusDropdown, DocumentLinks, PopOutEditor (Textarea), and 6 ReadOnly variants.
- **mui** -- All fields use MUI v5/v6 native components. Full readOnly, validation, ARIA. Same Tier 2 coverage as fluent.
- **headless** -- Semantic HTML reference implementation. Full readOnly, validation, ARIA via `data-*` attributes and CSS classes. Same Tier 2 coverage as fluent/mui.

**Native Tier 1 (13 field types, real UI library components):**
- **antd** -- All 13 Tier 1 fields use Ant Design v5 native components. DateControl uses dayjs internally (converted to ISO at boundary). Includes 1 ReadOnly field.
- **mantine** -- All 13 Tier 1 fields use Mantine v7 native components. Number field has a serialization divergence: empty input explicitly sets `null` via `setFieldValue`. Includes 1 ReadOnly field.

**Hybrid (13 field types, mix of native and semantic HTML):**
- **chakra** -- Dropdown uses Chakra NativeSelect compound component. Toggle, Number, Slider, DateControl, and several others fall back to semantic HTML due to Ark UI v3 DTS compatibility issues. Includes 1 ReadOnly field.
- **base-web** -- Textbox, Number, Toggle, Dropdown, SimpleDropdown, MultiSelect, Slider, RadioGroup, CheckboxGroup, and Textarea all use native baseui components. DateControl falls back to native HTML `<input type="date">`. Includes 1 ReadOnly field.

**Compatibility (13 field types, semantic HTML throughout):**
- **atlaskit** -- All fields use semantic HTML styled for Atlassian Design System integration. Uses `ak-*` CSS class prefix. Includes 1 ReadOnly field.
- **heroui** -- All fields use semantic HTML styled for HeroUI (NextUI) ecosystem. DateControl uses native HTML `<input type="date">`. Includes 1 ReadOnly field.

### Parity-Risk Fields

| Field | Risk | Description |
|-------|------|-------------|
| Number | low | Mantine `NumberInput` explicitly calls `setFieldValue(null)` on empty; other adapters leave value as-is or let the input clear naturally. May cause differing form state snapshots for the same user action. |
| DateControl | low | Three different implementation strategies: native library picker (fluent, mui, antd/dayjs, mantine), native HTML `<input type="date">` (headless, chakra, atlaskit, base-web, heroui). All produce conformant ISO strings but UX varies significantly. |
| Toggle | none | All adapters use `!!value` coercion and `convertBooleanToYesOrNoText()` for readOnly. Fully conformant. |
| Dropdown | none | All adapters store string values via `setFieldValue`. ReadOnly delegates to `ReadOnlyText`. |

### Tier 2 Readiness Ranking

Ranked by how close each adapter is to supporting all Tier 2 fields:

1. **fluent** -- Full Tier 2 (26+ types registered)
2. **mui** -- Full Tier 2 (26+ types registered)
3. **headless** -- Full Tier 2 (26+ types registered)
4. **antd** / **mantine** -- Tier 1 only; native components available for most Tier 2 types in the respective UI libraries
5. **base-web** -- Tier 1 only; baseui has components for some Tier 2 types (FileUploader, DatePicker)
6. **chakra** -- Tier 1 only; Ark UI DTS issues may complicate Tier 2 expansion
7. **atlaskit** / **heroui** -- Tier 1 only; semantic HTML approach means Tier 2 expansion is straightforward but won't leverage native library features
