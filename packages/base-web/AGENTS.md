# AGENTS.md -- @formosaic/base-web

## Package Purpose

Base Web (Uber) field components for `@formosaic/core`. Provides 12 editable and 1 read-only field type using **baseui** components with Styletron for CSS-in-JS styling.

## Critical Constraints

- **Requires StyletronProvider wrapper.** All baseui components require `styletron-react`'s `Provider` wrapping the app. Tests must also use a wrapper.
- **Base Web Select uses `[{id, label}]` value format.** Must map from `IOption[]` to baseui's format and extract `.value[0].id` on change for single select, `.value.map(o => o.id)` for multi.
- **Base Web Slider uses `[number]` array format.** Must wrap/unwrap: `value={[numValue]}`, extract `params.value[0]` on change.
- **DateControl uses native `<input type="date">`.** baseui's DatePicker depends on `react-input-mask` which uses `ReactDOM.findDOMNode` -- incompatible with React 19.
- **Toggle uses Checkbox with `STYLE_TYPE.toggle`.** Import `{ Checkbox, STYLE_TYPE }` from `baseui/checkbox`.
- **No `Form.Item` wrappers.** Core's `FieldWrapper` handles labels and error display -- fields render the bare input component only.
- **All field components receive `IFieldProps<T>`** via `React.cloneElement` -- this is the contract with core's `RenderField`.
- **Import core types from `@formosaic/core`**, not from relative paths into the core package.
- **Import adapter utilities from `@formosaic/core/adapter-utils`** (e.g., `isNull`, `convertBooleanToYesOrNoText`).
- **Use `React.JSX.Element`** not bare `JSX.Element` for return types.

## Key Files

| File | Purpose |
|------|---------|
| `src/registry.ts` | `createBaseWebFieldRegistry()` -- maps `ComponentTypes` keys to field JSX elements. Returns `Record<string, React.JSX.Element>` for `InjectedFieldProvider`. |
| `src/helpers.ts` | Re-exports shared helpers from core: `FieldClassName()`, `GetFieldDataTestId()`, `formatDateTime()`, `DocumentLinksStrings`. |
| `src/index.ts` | Public API barrel exports. |
| `src/fields/Textbox.tsx` | baseui `Input` |
| `src/fields/Number.tsx` | baseui `Input` with type="number" |
| `src/fields/Toggle.tsx` | baseui `Checkbox` with `STYLE_TYPE.toggle` |
| `src/fields/Dropdown.tsx` | baseui `Select` |
| `src/fields/MultiSelect.tsx` | baseui `Select` with `multi` prop |
| `src/fields/DateControl.tsx` | Native `<input type="date">` (React 19 fallback) |
| `src/fields/Slider.tsx` | baseui `Slider` |
| `src/fields/RadioGroup.tsx` | baseui `RadioGroup` + `Radio` |
| `src/fields/CheckboxGroup.tsx` | baseui `Checkbox` |
| `src/fields/Textarea.tsx` | baseui `Textarea` |
| `src/fields/DynamicFragment.tsx` | `<input type="hidden">` |
| `src/fields/readonly/ReadOnly.tsx` | `ReadOnlyText` |
| `src/components/ReadOnlyText.tsx` | Shared read-only text renderer |
| `src/components/StatusMessage.tsx` | Form status display |
| `src/components/FormLoading.tsx` | Loading state |

## Adding a New Field

1. Create `src/fields/MyField.tsx` implementing `IFieldProps<T>`
2. Use the appropriate baseui component (e.g., `Input`, `Select`, `Checkbox`)
3. Use baseui's `error` prop for error state where supported
4. Use `overrides` prop for custom data attributes (data-testid)
5. Export from `src/index.ts`
6. Add to `ComponentTypes` in core's `src/constants.ts`
7. Register in `src/registry.ts` inside `createBaseWebFieldRegistry()`

## Field Component Pattern

```tsx
import { IFieldProps } from "@formosaic/core";
import { Input } from "baseui/input";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId } from "../helpers";

const MyField = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={value as string} />
  ) : (
    <Input
      value={(value as string) ?? ""}
      onChange={(e) => setFieldValue(fieldName, e.target.value, false, 3000)}
      error={!!error}
      aria-invalid={!!error}
      aria-required={required}
      overrides={{
        Root: {
          props: {
            "data-testid": GetFieldDataTestId(fieldName, testId),
          },
        },
      }}
    />
  );
};

export default MyField;
```
