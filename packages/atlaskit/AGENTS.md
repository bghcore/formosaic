# AGENTS.md -- @formosaic/atlaskit

## Package Purpose

Atlassian Design System compatible field components for `@formosaic/core`. Provides 12 editable and 1 read-only field type using **semantic HTML** with `ak-` CSS class prefix. No `@atlaskit/*` runtime dependencies -- fields render native HTML elements with data attributes and ARIA for accessibility.

## Critical Constraints

- **No @atlaskit dependencies.** All fields use native HTML elements (`<input>`, `<select>`, `<textarea>`, `<dialog>`, etc.) similar to the headless adapter approach.
- **CSS class prefix is `ak-`** (not `df-` like headless or `fe-` like others). This enables styling with Atlassian design tokens.
- **All fields emit `data-field-type` and `data-field-state` attributes** for CSS targeting and testing.
- **No `Form` wrappers.** Core's `FieldWrapper` handles labels and error display -- fields render the bare input component only.
- **All field components receive `IFieldProps<T>`** via `React.cloneElement` -- this is the contract with core's `RenderField`.
- **Import core types from `@formosaic/core`**, not from relative paths into the core package.
- **Import adapter utilities** from `@formosaic/core/adapter-utils` (e.g., `isNull`, `convertBooleanToYesOrNoText`).
- **Import helpers** from local `../helpers` which re-exports from `@formosaic/core/adapter-utils`.

## Key Files

| File | Purpose |
|------|---------|
| `src/registry.ts` | `createAtlaskitFieldRegistry()` -- maps `ComponentTypes` keys to field JSX elements. Returns `Record<string, React.JSX.Element>` for `InjectedFieldProvider`. |
| `src/helpers.ts` | Re-exports shared helpers from core: `GetFieldDataTestId()`, `getFieldState()`, `formatDateTime()`, `DocumentLinksStrings`. |
| `src/index.ts` | Public API barrel exports. |
| `src/fields/Textbox.tsx` | `<input type="text">` |
| `src/fields/Number.tsx` | `<input type="number">` |
| `src/fields/Toggle.tsx` | `<input type="checkbox" role="switch">` |
| `src/fields/Dropdown.tsx` | `<select>` + `<option>` |
| `src/fields/MultiSelect.tsx` | `<select multiple>` |
| `src/fields/DateControl.tsx` | `<input type="date">` + clear button |
| `src/fields/Slider.tsx` | `<input type="range">` + `<output>` |
| `src/fields/RadioGroup.tsx` | `<div role="radiogroup">` + `<input type="radio">` |
| `src/fields/CheckboxGroup.tsx` | `<div>` + `<input type="checkbox">` |
| `src/fields/Textarea.tsx` | `<textarea>` + expand `<dialog>` |
| `src/fields/DynamicFragment.tsx` | `<input type="hidden">` |
| `src/fields/readonly/ReadOnly.tsx` | `ReadOnlyText` |
| `src/components/ReadOnlyText.tsx` | Shared read-only text renderer |
| `src/components/StatusMessage.tsx` | Form status display |
| `src/components/FormLoading.tsx` | Loading state |

## Adding a New Field

1. Create `src/fields/MyField.tsx` implementing `IFieldProps<T>`
2. Use semantic HTML elements (no @atlaskit imports)
3. Add `data-field-type`, `data-field-state`, `aria-invalid`, `aria-required` attributes
4. Use `ak-` CSS class prefix
5. Export from `src/index.ts`
6. Add to `ComponentTypes` in core's `src/constants.ts`
7. Register in `src/registry.ts` inside `createAtlaskitFieldRegistry()`

## Field Component Pattern

```tsx
import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const MyField = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={value as string} />
  ) : (
    <input
      type="text"
      className="ak-my-field"
      value={(value as string) ?? ""}
      onChange={(e) => setFieldValue(fieldName, e.target.value, false, 3000)}
      aria-invalid={!!error}
      aria-required={required}
      data-field-type="MyField"
      data-field-state={getFieldState({ error, required, readOnly })}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default MyField;
```
