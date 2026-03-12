# AGENTS.md -- @formosaic/chakra

## Package Purpose

Chakra UI v3 field components for `@formosaic/core`. Provides 12 editable and 1 read-only field type using **Chakra UI v3** components, with semantic HTML fallbacks where Chakra's compound components have TypeScript DTS issues.

## Critical Constraints

- **Chakra UI v3 only.** Do not use Chakra v2 APIs.
- **Compound components have DTS issues.** Chakra v3 compound components (Switch, NumberInput, Slider, RadioGroup, CheckboxGroup) rely on Ark UI's `Assign` type which causes TypeScript declaration file errors. Use semantic HTML fallbacks styled with Chakra CSS variables instead.
- **All field components receive `IFieldProps<T>`** via `React.cloneElement` -- this is the contract with core's `RenderField`.
- **Import core types from `@formosaic/core`**, not from relative paths into the core package.
- **Use `React.JSX.Element`** not bare `JSX.Element` for return types.
- **Use `data-field-type` and `data-field-state` attributes** on field containers for CSS targeting and testing.

## Fallback Status

| Field | Implementation | Status | Notes |
|---|---|---|---|
| Textbox | Chakra `Input` | Native | - |
| Number | `<input type="number">` | Temporary fallback | Chakra `NumberInput` compound component DTS issue |
| Toggle | `<input type="checkbox" role="switch">` | Temporary fallback | Chakra `Switch` compound component DTS issue |
| Dropdown | Chakra `NativeSelect` | Native | - |
| SimpleDropdown | Chakra `NativeSelect` | Native | - |
| MultiSelect | `<select multiple>` | Temporary fallback | Chakra `Select` compound component DTS issue |
| DateControl | Chakra `Input` (`type="date"`) | Native | - |
| Slider | `<input type="range">` | Temporary fallback | Chakra `Slider` compound component DTS issue |
| RadioGroup | `<fieldset>` + `<input type="radio">` | Temporary fallback | Chakra `RadioGroup` compound component DTS issue |
| CheckboxGroup | `<fieldset>` + `<input type="checkbox">` | Temporary fallback | Chakra `CheckboxGroup` compound component DTS issue |
| Textarea | Chakra `Textarea` | Native | - |
| DynamicFragment | `<input type="hidden">` | Expected | Always native HTML |
| ReadOnly | `ReadOnlyText` (span) | Expected | Always custom component |

Temporary fallbacks are styled with Chakra CSS variables for visual consistency and will be replaced with native Chakra components when the Ark UI `Assign` type DTS issue is resolved in a future Chakra v3 release.

## Key Files

| File | Purpose |
|------|---------|
| `src/registry.ts` | `createChakraFieldRegistry()` -- maps `ComponentTypes` keys to Chakra field JSX elements. Returns `Record<string, React.JSX.Element>` for `InjectedFieldProvider`. |
| `src/helpers.ts` | Re-exports shared helpers from core: `FieldClassName()`, `GetFieldDataTestId()`, `getFieldState()`, `formatDateTime()`, `DocumentLinksStrings`. |
| `src/index.ts` | Public API barrel exports. |
| `src/fields/Textbox.tsx` | Chakra `Input` |
| `src/fields/Number.tsx` | Chakra `Input` (`type="number"`) -- HTML fallback |
| `src/fields/Toggle.tsx` | Semantic `<input type="checkbox" role="switch">` -- HTML fallback |
| `src/fields/Dropdown.tsx` | Chakra `NativeSelect` |
| `src/fields/SimpleDropdown.tsx` | Chakra `NativeSelect` for string arrays |
| `src/fields/MultiSelect.tsx` | Semantic `<select multiple>` -- HTML fallback |
| `src/fields/DateControl.tsx` | Chakra `Input` (`type="date"`) |
| `src/fields/Slider.tsx` | Semantic `<input type="range">` -- HTML fallback |
| `src/fields/RadioGroup.tsx` | Semantic `<fieldset>` + `<input type="radio">` -- HTML fallback |
| `src/fields/CheckboxGroup.tsx` | Semantic `<fieldset>` + `<input type="checkbox">` -- HTML fallback |
| `src/fields/Textarea.tsx` | Chakra `Textarea` |
| `src/fields/DynamicFragment.tsx` | `<input type="hidden">` |
| `src/fields/readonly/ReadOnly.tsx` | `ReadOnlyText` |
| `src/components/ReadOnlyText.tsx` | Shared read-only text renderer |
| `src/components/StatusMessage.tsx` | Form status display |
| `src/components/FormLoading.tsx` | Loading state |

## Adding a New Field

1. Create `src/fields/MyField.tsx` implementing `IFieldProps<T>`
2. Try the Chakra component first; if DTS errors occur, use semantic HTML with `data-field-type`/`data-field-state` attributes and Chakra CSS variables for styling
3. Export from `src/index.ts`
4. Add to `ComponentTypes` in core's `src/constants.ts`
5. Register in `src/registry.ts` inside `createChakraFieldRegistry()`

## Field Component Pattern

```tsx
import { IFieldProps } from "@formosaic/core";
import { Input } from "@chakra-ui/react";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const MyField = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={value as string} />
  ) : (
    <Input
      type="text"
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
