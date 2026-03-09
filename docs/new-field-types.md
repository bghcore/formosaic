# New Field Types: RadioGroup, CheckboxGroup, Rating, ColorPicker, Autocomplete

This document covers the five new field types added in v1.1.0. All types follow the standard `IFieldProps<T>` pattern and are available in all three adapters: `@form-eng/fluent`, `@form-eng/mui`, and `@form-eng/headless`.

## RadioGroup

Single-selection from a list of options rendered as radio buttons.

- **ComponentType key:** `"RadioGroup"` (`ComponentTypes.RadioGroup`)
- **Value type:** `string`
- **Options:** `IOption[]` via `options` prop

### Usage

```typescript
const config: IFormConfig = {
  version: 2,
  fields: {
    size: {
      type: "RadioGroup",
      label: "Size",
      required: true,
      options: [
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
      ],
    },
  },
};
```

### Adapter notes

| Adapter  | Component used |
|----------|---------------|
| Fluent   | `Radio` + `RadioGroup` from `@fluentui/react-components` |
| MUI      | `Radio` + `RadioGroup` + `FormControl` + `FormControlLabel` from `@mui/material` |
| Headless | Native `<input type="radio">` elements, `data-field-type="RadioGroup"` |

---

## CheckboxGroup

Multi-selection from a list of options rendered as checkboxes.

- **ComponentType key:** `"CheckboxGroup"` (`ComponentTypes.CheckboxGroup`)
- **Value type:** `string[]`
- **Options:** `IOption[]` via `options` prop

### Usage

```typescript
const config: IFormConfig = {
  version: 2,
  fields: {
    frameworks: {
      type: "CheckboxGroup",
      label: "Frameworks",
      options: [
        { value: "react", label: "React" },
        { value: "vue", label: "Vue" },
        { value: "angular", label: "Angular" },
      ],
    },
  },
};
```

### Rules integration

Because the value is `string[]`, use `contains` / `notContains` operators in rules:

```typescript
rules: [
  {
    when: { field: "frameworks", operator: "contains", value: "angular" },
    then: { hidden: true },
  },
],
```

### Adapter notes

| Adapter  | Component used |
|----------|---------------|
| Fluent   | `Checkbox` from `@fluentui/react-components` |
| MUI      | `Checkbox` + `FormControlLabel` + `FormGroup` from `@mui/material` |
| Headless | Native `<input type="checkbox">` elements, `data-field-type="CheckboxGroup"` |

---

## Rating

Numeric star rating input.

- **ComponentType key:** `"Rating"` (`ComponentTypes.Rating`)
- **Value type:** `number`
- **Config options:**
  - `config.max?: number` — Maximum number of stars (default: `5`)
  - `config.allowHalf?: boolean` — Allow half-star ratings (default: `false`; MUI only for now)

### Usage

```typescript
const config: IFormConfig = {
  version: 2,
  fields: {
    productRating: {
      type: "Rating",
      label: "Product Rating",
      required: true,
      config: {
        max: 5,
        allowHalf: false,
      },
    },
  },
};
```

### Adapter notes

| Adapter  | Component used |
|----------|---------------|
| Fluent   | Custom star button implementation (Fluent Rating component is v9.x preview only) |
| MUI      | `Rating` from `@mui/material` — supports `allowHalf` via `precision: 0.5` |
| Headless | Radio-based star implementation with `aria-label`, `data-field-type="Rating"` |

---

## ColorPicker

Hex color selection using the browser's native color picker.

- **ComponentType key:** `"ColorPicker"` (`ComponentTypes.ColorPicker`)
- **Value type:** `string` (hex format, e.g. `"#ff0000"`)

The selected hex value is displayed as text next to the color swatch for all adapters.

### Usage

```typescript
const config: IFormConfig = {
  version: 2,
  fields: {
    brandColor: {
      type: "ColorPicker",
      label: "Brand Color",
      defaultValue: "#3b82f6",
    },
  },
};
```

### Adapter notes

| Adapter  | Component used |
|----------|---------------|
| Fluent   | Native `<input type="color">` with hex value display |
| MUI      | Native `<input type="color">` with hex value display |
| Headless | Native `<input type="color">` with hex value display, `data-field-type="ColorPicker"` |

All adapters use the same native `<input type="color">` — browser rendering varies by OS and browser.

---

## Autocomplete

Searchable single-selection input with type-ahead filtering.

- **ComponentType key:** `"Autocomplete"` (`ComponentTypes.Autocomplete`)
- **Value type:** `string` (option value key)
- **Options:** `IOption[]` via `options` prop

### Usage

```typescript
const config: IFormConfig = {
  version: 2,
  fields: {
    country: {
      type: "Autocomplete",
      label: "Country",
      required: true,
      options: [
        { value: "us", label: "United States" },
        { value: "ca", label: "Canada" },
        { value: "gb", label: "United Kingdom" },
      ],
    },
  },
};
```

### Adapter notes

| Adapter  | Component used |
|----------|---------------|
| Fluent   | `Combobox` from `@fluentui/react-components` with `freeform` enabled |
| MUI      | `Autocomplete` from `@mui/material` |
| Headless | `<input>` with `<datalist>` for native browser suggestions, `data-field-type="Autocomplete"` |

The headless adapter uses `<datalist>` which provides basic browser-native autocomplete. For richer filtering behavior, use the Fluent or MUI adapters.

---

## Read-only rendering

All five field types render a plain `ReadOnlyText` component when `readOnly: true` is set, displaying:

| Field type     | Read-only display |
|----------------|-------------------|
| RadioGroup     | The matching option label |
| CheckboxGroup  | Comma-separated selected labels |
| Rating         | The numeric value as a string |
| ColorPicker    | The hex color string |
| Autocomplete   | The matching option label |

---

## Rules engine integration

All new types work with the existing rules engine. Example: show a `CheckboxGroup` only when a `Toggle` is on:

```typescript
fields: {
  enableExtras: { type: "Toggle", label: "Enable extras" },
  extras: {
    type: "CheckboxGroup",
    label: "Choose extras",
    options: [
      { value: "a", label: "Extra A" },
      { value: "b", label: "Extra B" },
    ],
    rules: [
      {
        when: { field: "enableExtras", operator: "equals", value: false },
        then: { hidden: true },
      },
    ],
  },
},
```
