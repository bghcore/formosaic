# Tier 1 Implementation Patterns for Tier 2

Canonical implementation patterns extracted from Tier 1 to guide Tier 2 field development. Each pattern identifies the reference adapter, the code structure, and caveats.

## 1. Text-Like Field Pattern

**Reference:** `packages/headless/src/fields/Textbox.tsx`

**Applies to:** Textbox, Textarea, and any single-value text input (PhoneInput, RichText)

```tsx
const Field = (props: IFieldProps<IConfig>) => {
  const { fieldName, value, readOnly, error, required, setFieldValue, options } = props;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={value as string} />;
  }

  return (
    <input
      type="text"
      value={(value as string) ?? ""}
      onChange={(e) => setFieldValue(fieldName, e.target.value)}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};
```

**Key conventions:**
- `value ?? ""` coercion for empty state
- ReadOnlyText for read-only display with "-" sentinel for null/undefined
- `setFieldValue(fieldName, stringValue)` on change
- `aria-invalid`, `aria-required` for accessibility
- `data-testid` via `GetFieldDataTestId` helper

**Caveats:**
- Debounced save: pass `setFieldValue(fieldName, value, false, 3000)` for text inputs to avoid saving on every keystroke

---

## 2. Selection Field Pattern (Single)

**Reference:** `packages/headless/src/fields/Dropdown.tsx` (post-DIV-006 fix)

**Applies to:** Dropdown, StatusDropdown, and any single-select field

```tsx
const Field = (props: IFieldProps<IConfig>) => {
  const { fieldName, value, readOnly, options, setFieldValue } = props;

  const selectedLabel = options?.find(o => String(o.value) === String(value))?.label;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={selectedLabel ?? (value as string)} />;
  }

  return (
    <select value={(value as string) ?? ""} onChange={(e) => setFieldValue(fieldName, e.target.value)}>
      <option value="">{placeholder ?? ""}</option>
      {options?.map(option => (
        <option key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
```

**Key conventions:**
- Options label lookup for readOnly display (CRITICAL — this was DIV-006)
- `String(option.value)` coercion for consistent comparison
- Empty option for placeholder
- Disabled option support

---

## 3. Selection Field Pattern (Multi)

**Reference:** `packages/headless/src/fields/MultiSelect.tsx`

**Applies to:** MultiSelect, MultiSelectSearch, CheckboxGroup (multi-value)

```tsx
const Field = (props: IFieldProps<{}>) => {
  const { fieldName, value, readOnly, options, setFieldValue } = props;
  const selectedValues = (value as string[]) ?? [];

  if (readOnly) {
    if (selectedValues.length === 0) {
      return <ReadOnlyText fieldName={fieldName} value="" />;  // shows "-"
    }
    const labels = selectedValues.map(v =>
      options?.find(o => String(o.value) === v)?.label ?? v
    );
    return <span>{labels.join(", ")}</span>;
  }

  // Render multi-select UI
};
```

**Key conventions:**
- `value as string[]` with `?? []` fallback
- ReadOnly shows comma-separated labels (or "-" sentinel for empty)
- Look up labels from options, fall back to raw value

---

## 4. Boolean Field Pattern

**Reference:** `packages/headless/src/fields/Toggle.tsx`

**Applies to:** Toggle, and any boolean-valued field

```tsx
const Field = (props: IFieldProps<{}>) => {
  const { fieldName, value, readOnly, setFieldValue } = props;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={convertBooleanToYesOrNoText(!!value)} />;
  }

  return (
    <input
      type="checkbox"
      role="switch"
      checked={!!value}
      onChange={(e) => setFieldValue(fieldName, e.target.checked)}
    />
  );
};
```

**Key conventions:**
- `!!value` coercion for boolean
- `convertBooleanToYesOrNoText()` from adapter-utils for readOnly
- `role="switch"` for toggle semantics (vs checkbox)

---

## 5. Numeric Field Pattern

**Reference:** `packages/headless/src/fields/Number.tsx`

**Applies to:** Number, Slider, Rating (numeric)

```tsx
const Field = (props: IFieldProps<{}>) => {
  const { fieldName, value, readOnly, setFieldValue } = props;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={String(value ?? 0)} />;
  }

  return (
    <input
      type="number"
      value={(value as number) ?? 0}
      onChange={(e) => {
        const num = parseFloat(e.target.value);
        setFieldValue(fieldName, isNaN(num) ? null : num);
      }}
    />
  );
};
```

**Key conventions:**
- `value ?? 0` coercion (Number/Slider need numeric values for inputs)
- ReadOnly shows "0" for null/undefined, NOT "-" sentinel (DIV-001 accepted)
- ParseFloat with NaN guard

---

## 6. Date Field Pattern

**Reference:** `packages/headless/src/fields/DateControl.tsx`

**Applies to:** DateControl, DateTime, DateRange

```tsx
const Field = (props: IFieldProps<{}>) => {
  const { fieldName, value, readOnly, setFieldValue } = props;

  if (readOnly) {
    return value ? (
      <span>{formatDateTime(value as string, { hideTimestamp: true })}</span>
    ) : (
      <ReadOnlyText fieldName={fieldName} value="" />  // shows "-"
    );
  }

  const dateInputValue = value ? new Date(value as string).toISOString().split("T")[0] : "";

  return (
    <input
      type="date"
      value={dateInputValue}
      onChange={(e) => {
        const date = new Date(e.target.value);
        setFieldValue(fieldName, !isNaN(date.getTime()) ? date.toISOString() : null);
      }}
    />
  );
};
```

**Key conventions:**
- ISO string serialization (always `toISOString()`)
- `formatDateTime()` from adapter-utils for readOnly display
- "-" sentinel for null/undefined dates
- Native `<input type="date">` for semantic fallback; native library picker for framework adapters

---

## 7. ReadOnly Rendering Pattern

**Reference:** All adapters' `components/ReadOnlyText.tsx`

```tsx
const ReadOnlyText = ({ value, fieldName, ellipsifyTextCharacters }) => {
  const displayValue = value
    ? ellipsifyTextCharacters && value.length > ellipsifyTextCharacters
      ? `${value.substring(0, cutoff)}...`
      : value
    : "-";

  return <span data-field-type="ReadOnly">{displayValue}</span>;
};
```

**Key conventions:**
- "-" sentinel for null/undefined/empty string
- Optional ellipsification via `ellipsifyTextCharacters` config
- Every field type delegates to ReadOnlyText in readOnly mode
- **Exception:** Number/Slider show "0" not "-" (DIV-001)
- **Exception:** Date fields use `formatDateTime()` before ReadOnlyText
- **Since v1.5.2:** Dropdown does options label lookup before passing to ReadOnlyText

---

## 8. Semantic HTML Fallback Pattern

**Reference:** `packages/atlaskit/src/fields/` (entire package), `packages/heroui/src/fields/`

**When to use:** When a UI library component is unavailable (DTS issues, jsdom incompatibility, React version conflicts).

**Approach:**
1. Use standard HTML elements (`<input>`, `<select>`, `<textarea>`, `<fieldset>`)
2. Add `data-field-type` and `data-field-state` attributes for styling hooks
3. Add `aria-*` attributes for accessibility
4. Style with the target library's CSS variables or class prefix
5. Pass all same props as the native version — behavior should be identical

**Example:** Atlaskit uses `ak-*` class prefix, Heroui uses `fe-*`, Chakra fallbacks use Chakra CSS variables.

**Caveats:**
- Semantic HTML components pass all parity tests — behavior is identical to native
- Visual appearance differs from native library components without CSS
- Acceptable for Tier 2 expansion when native components have issues

---

## 9. Primitives-First Pattern

**Reference:** `packages/radix/src/fields/` (Radix primitives), `packages/react-aria/src/fields/` (React Aria Components)

**When to use:** When building unstyled adapters for design-system-agnostic use.

**Approach:**
1. Use the primitive library's components for complex interactions (Select, Switch, Slider, Radio, Checkbox)
2. Use semantic HTML for simple inputs (text, number, textarea, date)
3. Ship with no styles — expose `data-*` attributes and CSS classes
4. No provider wrapper required
5. Handle library-specific type/value boundary conversions (DIV-010, DIV-011, DIV-012)

**Boundary conversion examples:**
- Radix Select: `""` → `undefined` for empty value
- Radix Slider: `number` → `[number]` for array-based API
- React Aria Select: `string` → `Key` type cast

---

## 10. Recipe/Local-Wrapper Pattern

**Reference:** `docs/shadcn-integration.md`

**When to use:** When consumers want to wrap Formosaic fields with their own styled components.

**Approach:**
1. Start with `@formosaic/radix` (or `@formosaic/headless`) as base
2. Create local wrapper components that spread `IFieldProps` onto styled components
3. Override specific fields in the registry via spread: `{ ...createRadixFieldRegistry(), Textbox: <StyledTextbox /> }`

**For Tier 2:** New Tier 2 fields should work with this pattern automatically — consumers override fields they want to style.

---

## 11. Validation Wiring Pattern

**Reference:** `packages/core/src/components/RenderField.tsx` → Controller → FieldWrapper

Validation is handled entirely by core, not by adapters:

1. `RenderField` wraps each field in react-hook-form's `Controller`
2. `Controller` runs validation rules from `IFieldConfig.validate[]` via `ValidationRegistry`
3. Errors are passed to the field as `error` prop (string or undefined)
4. `FieldWrapper` renders the error message below the field
5. Field components only need `aria-invalid={!!error}` — they don't run validation themselves

**For Tier 2:** New fields get validation for free. No adapter-level validation code needed.

---

## 12. Serialization Pattern

**Reference:** `packages/core/src/utils/formStateSerialization.ts`

All fields serialize to/from JSON-safe values:

| Type | Serialized Form | Notes |
|------|----------------|-------|
| Text | `string` | Direct JSON string |
| Number | `number \| null` | `null` for empty |
| Boolean | `boolean` | `true`/`false` |
| Date | `string` (ISO 8601) | `toISOString()` |
| Select | `string` | Option value key |
| Multi-select | `string[]` | Array of option value keys |

**For Tier 2:**
- DateRange: `{ start: string, end: string }` (ISO pair)
- DateTime: `string` (ISO with time component)
- FileUpload: TBD (likely `{ name, url, size }[]`)
- Rating: `number` (1-5 or custom scale)

---

## Pattern Selection Guide for Tier 2

| Tier 2 Field | Primary Pattern | Notes |
|--------------|----------------|-------|
| Rating | Numeric (#5) | Star/slider input, 1-N scale |
| Autocomplete | Selection-single (#2) | Combobox with search — text + select hybrid |
| DateTime | Date (#6) | Date + time components |
| DateRange | Date (#6) | Dual date inputs |
| PhoneInput | Text-like (#1) | Masked input with format validation |
| FileUpload | Custom | File input + drag/drop + preview |
| ColorPicker | Custom | Color input with preview swatch |
| MultiSelectSearch | Selection-multi (#3) | Combobox + multi-select |
| RichText | Custom | Content-editable or library-specific |
| StatusDropdown | Selection-single (#2) | Dropdown with status color indicators |
| DocumentLinks | Custom | Dynamic list of link objects |
| ReadOnly variants | ReadOnly (#7) | Display-only, different formatters |
