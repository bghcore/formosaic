# AGENTS.md -- @formosaic/heroui

## Package Purpose

HeroUI field components for `@formosaic/core`. Provides 12 editable and 1 read-only field type using semantic HTML elements styled for HeroUI compatibility.

## Critical Constraints

- **Semantic HTML fallback approach.** Field components use native HTML elements (input, select, textarea) with ARIA attributes instead of `@heroui/react` components directly, ensuring jsdom/SSR compatibility.
- **No `Form.Item` wrappers.** Core's `FieldWrapper` handles labels and error display -- fields render the bare input component only.
- **Native dates.** `DateControl` uses `<input type="date">` with native Date, not `@internationalized/date` CalendarDate.
- **All field components receive `IFieldProps<T>`** via `React.cloneElement` -- this is the contract with core's `RenderField`.
- **Import core types from `@formosaic/core`**, not from relative paths into the core package.
- **Use `React.JSX.Element`** not bare `JSX.Element` for return types.

## Key Files

| File | Purpose |
|------|---------|
| `src/registry.ts` | `createHeroUIFieldRegistry()` -- maps `ComponentTypes` keys to HeroUI field JSX elements. Returns `Record<string, React.JSX.Element>` for `InjectedFieldProvider`. |
| `src/helpers.ts` | Re-exports shared helpers from core: `FieldClassName()`, `GetFieldDataTestId()`, `getFieldState()`, `formatDateTime()`, `DocumentLinksStrings`. |
| `src/index.ts` | Public API barrel exports. |
| `src/fields/Textbox.tsx` | `<input type="text">` |
| `src/fields/Number.tsx` | `<input type="number">` |
| `src/fields/Toggle.tsx` | `<input type="checkbox" role="switch">` |
| `src/fields/Dropdown.tsx` | `<select>` |
| `src/fields/SimpleDropdown.tsx` | `<select>` for string arrays |
| `src/fields/MultiSelect.tsx` | `<select multiple>` |
| `src/fields/DateControl.tsx` | `<input type="date">` |
| `src/fields/Slider.tsx` | `<input type="range">` |
| `src/fields/RadioGroup.tsx` | `<input type="radio">` group |
| `src/fields/CheckboxGroup.tsx` | `<input type="checkbox">` group |
| `src/fields/Textarea.tsx` | `<textarea>` |
| `src/fields/DynamicFragment.tsx` | `<input type="hidden">` |
| `src/fields/readonly/ReadOnly.tsx` | `ReadOnlyText` |
| `src/components/ReadOnlyText.tsx` | Shared read-only text renderer |
| `src/components/StatusMessage.tsx` | Form status display |
| `src/components/FormLoading.tsx` | Loading state |

## Adding a New Field

1. Create `src/fields/MyField.tsx` implementing `IFieldProps<T>`
2. Use semantic HTML elements with appropriate ARIA attributes
3. Use CSS classes with `fe-` prefix for styling
4. Export from `src/index.ts`
5. Add to `ComponentTypes` in core's `src/constants.ts`
6. Register in `src/registry.ts` inside `createHeroUIFieldRegistry()`

## Field Component Pattern

```tsx
import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const MyField = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={value as string} />
  ) : (
    <input
      type="text"
      className={FieldClassName("fe-my-field", error)}
      value={(value as string) ?? ""}
      onChange={(e) => setFieldValue(fieldName, e.target.value, false, 3000)}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default MyField;
```
