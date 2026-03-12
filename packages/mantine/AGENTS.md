# AGENTS.md -- @formosaic/mantine

## Package Purpose

Mantine v7 field components for `@formosaic/core`. Provides 12 editable and 1 read-only field type using **Mantine v7** components with strong 1:1 component mappings.

## Critical Constraints

- **Mantine v7 only.** Do not use Mantine v6 APIs.
- **No Mantine form hooks.** Core's `react-hook-form` manages all form state -- do not use `useForm` from `@mantine/form`.
- **onChange passes values directly, not events.** Most Mantine components pass the value directly to `onChange` (e.g., `Select` passes `string | null`, `NumberInput` passes `number | string`). Handle both patterns.
- **All field components receive `IFieldProps<T>`** via `React.cloneElement` -- this is the contract with core's `RenderField`.
- **Import core types from `@formosaic/core`**, not from relative paths into the core package.
- **Use `React.JSX.Element`** not bare `JSX.Element` for return types.
- **Mantine `data` prop.** Mantine `Select` and `MultiSelect` use `data` (not `options`) with `{ value, label }` objects.

## Key Files

| File | Purpose |
|------|---------|
| `src/registry.ts` | `createMantineFieldRegistry()` -- maps `ComponentTypes` keys to Mantine field JSX elements. Returns `Record<string, React.JSX.Element>` for `InjectedFieldProvider`. |
| `src/helpers.ts` | Re-exports shared helpers from core: `FieldClassName()`, `GetFieldDataTestId()`, `formatDateTime()`, `DocumentLinksStrings`. |
| `src/index.ts` | Public API barrel exports. |
| `src/fields/Textbox.tsx` | Mantine `TextInput` |
| `src/fields/Number.tsx` | Mantine `NumberInput` |
| `src/fields/Toggle.tsx` | Mantine `Switch` |
| `src/fields/Dropdown.tsx` | Mantine `Select` |
| `src/fields/SimpleDropdown.tsx` | Mantine `Select` for string arrays |
| `src/fields/MultiSelect.tsx` | Mantine `MultiSelect` |
| `src/fields/DateControl.tsx` | Native `<input type="date">` |
| `src/fields/Slider.tsx` | Mantine `Slider` |
| `src/fields/RadioGroup.tsx` | Mantine `Radio.Group` + `Radio` |
| `src/fields/CheckboxGroup.tsx` | Mantine `Checkbox.Group` + `Checkbox` |
| `src/fields/Textarea.tsx` | Mantine `Textarea` |
| `src/fields/DynamicFragment.tsx` | `<input type="hidden">` |
| `src/fields/readonly/ReadOnly.tsx` | `ReadOnlyText` |
| `src/components/ReadOnlyText.tsx` | Shared read-only text renderer |
| `src/components/StatusMessage.tsx` | Form status display |
| `src/components/FormLoading.tsx` | Loading state |

## Adding a New Field

1. Create `src/fields/MyField.tsx` implementing `IFieldProps<T>`
2. Use the appropriate Mantine component (e.g., `TextInput`, `Select`, `NumberInput`)
3. Handle Mantine's value-based onChange (not event-based) where applicable
4. Export from `src/index.ts`
5. Add to `ComponentTypes` in core's `src/constants.ts`
6. Register in `src/registry.ts` inside `createMantineFieldRegistry()`

## Field Component Pattern

```tsx
import { IFieldProps } from "@formosaic/core";
import { TextInput } from "@mantine/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const MyField = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={value as string} />
  ) : (
    <TextInput
      className={FieldClassName("fe-my-field", error)}
      value={(value as string) ?? ""}
      onChange={(e) => setFieldValue(fieldName, e.target.value, false, 3000)}
      required={required}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, testId)}
    />
  );
};

export default MyField;
```
