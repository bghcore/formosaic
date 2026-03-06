# AGENTS.md -- @form-eng/headless

## Package Purpose

Unstyled, semantic HTML field components for `@form-eng/core`. Provides 13 editable and 6 read-only field types using **only native HTML elements** -- no UI framework dependency. Fields output `data-field-type` and `data-field-state` attributes for CSS targeting and ARIA attributes for accessibility.

## Critical Constraints

- **No UI library imports allowed.** No `@fluentui/*`, no `@mui/*`, no CSS-in-JS. Native HTML elements only.
- **All field components receive `IFieldProps<T>`** via `React.cloneElement` -- this is the contract with core's `RenderField`.
- **Import core types from `@form-eng/core`**, not from relative paths into the core package.
- **Use `React.JSX.Element`** not bare `JSX.Element` for return types.
- **Every field must render `data-field-type` and `data-field-state` attributes.**

## Key Files

| File | Purpose |
|------|---------|
| `src/registry.ts` | `createHeadlessFieldRegistry()` -- maps `ComponentTypes` keys to headless field JSX elements. Returns `Record<string, React.JSX.Element>` for `InjectedFieldProvider`. |
| `src/helpers.ts` | Shared helpers: `GetFieldDataTestId()`, `getFieldState()`, `formatDateTime()`, `DocumentLinksStrings`. |
| `src/index.ts` | Public API barrel exports. |
| `src/styles.css` | Optional default styles using CSS custom properties (`--df-*` prefix). Fully functional without. |
| `src/fields/HookTextbox.tsx` | `<input type="text">` |
| `src/fields/HookNumber.tsx` | `<input type="number">` |
| `src/fields/HookToggle.tsx` | `<input type="checkbox" role="switch">` |
| `src/fields/HookDropdown.tsx` | `<select>` + `<option>` |
| `src/fields/HookMultiSelect.tsx` | `<select multiple>` |
| `src/fields/HookDateControl.tsx` | `<input type="date">` + clear button |
| `src/fields/HookSlider.tsx` | `<input type="range">` + `<output>` |
| `src/fields/HookSimpleDropdown.tsx` | `<select>` for string arrays |
| `src/fields/HookMultiSelectSearch.tsx` | `<input type="search">` + checkbox list |
| `src/fields/HookTextarea.tsx` | `<textarea>` + native `<dialog>` expand |
| `src/fields/HookDocumentLinks.tsx` | URL list with add/remove |
| `src/fields/HookStatusDropdown.tsx` | `<select>` with status color indicator |
| `src/fields/HookDynamicFragment.tsx` | `<input type="hidden">` |
| `src/fields/readonly/HookReadOnly.tsx` | `<span>` |
| `src/fields/readonly/HookReadOnlyArray.tsx` | `<ul>` / `<li>` |
| `src/fields/readonly/HookReadOnlyDateTime.tsx` | `<time>` |
| `src/fields/readonly/HookReadOnlyCumulativeNumber.tsx` | `<span>` |
| `src/fields/readonly/HookReadOnlyRichText.tsx` | `<div dangerouslySetInnerHTML>` |
| `src/fields/readonly/HookReadOnlyWithButton.tsx` | `<span>` + `<button>` |
| `src/components/ReadOnlyText.tsx` | Shared read-only text renderer |
| `src/components/StatusMessage.tsx` | Form status display |
| `src/components/HookFormLoading.tsx` | Skeleton loading state |

## Adding a New Field

1. Create `src/fields/HookMyField.tsx` implementing `IFieldProps<T>`
2. Add `data-field-type` and `data-field-state` attributes
3. Use ARIA attributes (aria-invalid, aria-required, etc.)
4. Export from `src/index.ts`
5. Add to `ComponentTypes` in core's `src/constants.ts`
6. Register in `src/registry.ts` inside `createHeadlessFieldRegistry()`

## Field Component Pattern

```tsx
import { IFieldProps } from "@form-eng/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const HookMyField = (props: IFieldProps<{}>) => {
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

export default HookMyField;
```
