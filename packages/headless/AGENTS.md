# AGENTS.md -- @formosaic/headless

## Package Purpose

Unstyled, semantic HTML field components for `@formosaic/core`. Provides 22 editable and 6 read-only field types using **only native HTML elements** -- no UI framework dependency. Fields output `data-field-type` and `data-field-state` attributes for CSS targeting and ARIA attributes for accessibility.

## Critical Constraints

- **No UI library imports allowed.** No `@fluentui/*`, no `@mui/*`, no CSS-in-JS. Native HTML elements only.
- **All field components receive `IFieldProps<T>`** via `React.cloneElement` -- this is the contract with core's `RenderField`.
- **Import core types from `@formosaic/core`**, not from relative paths into the core package.
- **Use `React.JSX.Element`** not bare `JSX.Element` for return types.
- **Every field must render `data-field-type` and `data-field-state` attributes.**

## Key Files

| File | Purpose |
|------|---------|
| `src/registry.ts` | `createHeadlessFieldRegistry()` -- maps `ComponentTypes` keys to headless field JSX elements. Returns `Record<string, React.JSX.Element>` for `InjectedFieldProvider`. |
| `src/helpers.ts` | Shared helpers: `GetFieldDataTestId()`, `getFieldState()`, `formatDateTime()`, `DocumentLinksStrings`. |
| `src/index.ts` | Public API barrel exports. |
| `src/styles.css` | Optional default styles using CSS custom properties (`--df-*` prefix). Fully functional without. |
| `src/fields/Textbox.tsx` | `<input type="text">` |
| `src/fields/Number.tsx` | `<input type="number">` |
| `src/fields/Toggle.tsx` | `<input type="checkbox" role="switch">` |
| `src/fields/Dropdown.tsx` | `<select>` + `<option>` |
| `src/fields/MultiSelect.tsx` | `<select multiple>` |
| `src/fields/DateControl.tsx` | `<input type="date">` + clear button |
| `src/fields/Slider.tsx` | `<input type="range">` + `<output>` |
| `src/fields/MultiSelectSearch.tsx` | `<input type="search">` + checkbox list |
| `src/fields/Textarea.tsx` | `<textarea>` + native `<dialog>` expand |
| `src/fields/DocumentLinks.tsx` | URL list with add/remove |
| `src/fields/StatusDropdown.tsx` | `<select>` with status color indicator |
| `src/fields/DynamicFragment.tsx` | `<input type="hidden">` |
| `src/fields/RadioGroup.tsx` | Radio button group. |
| `src/fields/CheckboxGroup.tsx` | Checkbox group for multi-select. |
| `src/fields/Rating.tsx` | Star rating input. |
| `src/fields/ColorPicker.tsx` | Color picker input. |
| `src/fields/Autocomplete.tsx` | Autocomplete/typeahead with datalist. |
| `src/fields/FileUpload.tsx` | File upload with drag-and-drop. |
| `src/fields/DateRange.tsx` | Date range picker (start + end). |
| `src/fields/DateTime.tsx` | Combined date and time input. |
| `src/fields/PhoneInput.tsx` | Phone number input with formatting. |
| `src/fields/readonly/ReadOnly.tsx` | `<span>` |
| `src/fields/readonly/ReadOnlyArray.tsx` | `<ul>` / `<li>` |
| `src/fields/readonly/ReadOnlyDateTime.tsx` | `<time>` |
| `src/fields/readonly/ReadOnlyCumulativeNumber.tsx` | `<span>` |
| `src/fields/readonly/ReadOnlyRichText.tsx` | `<div dangerouslySetInnerHTML>` |
| `src/fields/readonly/ReadOnlyWithButton.tsx` | `<span>` + `<button>` |
| `src/components/ReadOnlyText.tsx` | Shared read-only text renderer |
| `src/components/StatusMessage.tsx` | Form status display |
| `src/components/FormLoading.tsx` | Skeleton loading state |

## Adding a New Field

1. Create `src/fields/MyField.tsx` implementing `IFieldProps<T>`
2. Add `data-field-type` and `data-field-state` attributes
3. Use ARIA attributes (aria-invalid, aria-required, etc.)
4. Export from `src/index.ts`
5. Add to `ComponentTypes` in core's `src/constants.ts`
6. Register in `src/registry.ts` inside `createHeadlessFieldRegistry()`

## Field Component Pattern

```tsx
import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const MyField = (props: IFieldProps<{}>) => {
  const { fieldName, value, readOnly, error, required, setFieldValue } = props;
  const state = getFieldState({ error, required, readOnly });

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={value as string} />
  ) : (
    <input
      type="text"
      data-field-type="MyField"
      data-field-state={state}
      aria-invalid={!!error}
      aria-required={required}
      value={(value as string) ?? ""}
      onChange={(e) => setFieldValue(fieldName, e.target.value, false, 3000)}
      data-testid={GetFieldDataTestId(fieldName)}
    />
  );
};

export default MyField;
```
