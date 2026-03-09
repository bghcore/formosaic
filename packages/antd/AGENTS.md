# AGENTS.md -- @form-eng/antd

## Package Purpose

Ant Design v5 field components for `@form-eng/core`. Provides 12 editable and 1 read-only field type using **antd** components, with `dayjs` for date handling.

## Critical Constraints

- **antd v5 only.** Do not use antd v4 APIs or `moment.js`.
- **No `Form.Item` wrappers.** Core's `FieldWrapper` handles labels and error display -- antd fields render the bare input component only.
- **Use `dayjs` for dates.** `DateControl` uses antd's `DatePicker` which requires dayjs, not native Date.
- **All field components receive `IFieldProps<T>`** via `React.cloneElement` -- this is the contract with core's `RenderField`.
- **Import core types from `@form-eng/core`**, not from relative paths into the core package.
- **Use `React.JSX.Element`** not bare `JSX.Element` for return types.

## Key Files

| File | Purpose |
|------|---------|
| `src/registry.ts` | `createAntdFieldRegistry()` -- maps `ComponentTypes` keys to antd field JSX elements. Returns `Record<string, React.JSX.Element>` for `InjectedFieldProvider`. |
| `src/helpers.ts` | Re-exports shared helpers from core: `FieldClassName()`, `GetFieldDataTestId()`, `formatDateTime()`, `DocumentLinksStrings`. |
| `src/index.ts` | Public API barrel exports. |
| `src/fields/Textbox.tsx` | antd `Input` |
| `src/fields/Number.tsx` | antd `InputNumber` |
| `src/fields/Toggle.tsx` | antd `Switch` |
| `src/fields/Dropdown.tsx` | antd `Select` |
| `src/fields/SimpleDropdown.tsx` | antd `Select` for string arrays |
| `src/fields/MultiSelect.tsx` | antd `Select` with `mode="multiple"` |
| `src/fields/DateControl.tsx` | antd `DatePicker` with dayjs |
| `src/fields/Slider.tsx` | antd `Slider` |
| `src/fields/RadioGroup.tsx` | antd `Radio.Group` |
| `src/fields/CheckboxGroup.tsx` | antd `Checkbox.Group` |
| `src/fields/Textarea.tsx` | antd `Input.TextArea` |
| `src/fields/DynamicFragment.tsx` | `<input type="hidden">` |
| `src/fields/readonly/ReadOnly.tsx` | `ReadOnlyText` |
| `src/components/ReadOnlyText.tsx` | Shared read-only text renderer |
| `src/components/StatusMessage.tsx` | Form status display |
| `src/components/FormLoading.tsx` | Loading state |

## Adding a New Field

1. Create `src/fields/MyField.tsx` implementing `IFieldProps<T>`
2. Use the appropriate antd component (e.g., `Input`, `Select`, `DatePicker`)
3. Use antd's `status` prop for error state where supported
4. Export from `src/index.ts`
5. Add to `ComponentTypes` in core's `src/constants.ts`
6. Register in `src/registry.ts` inside `createAntdFieldRegistry()`

## Field Component Pattern

```tsx
import { IFieldProps } from "@form-eng/core";
import { Input } from "antd";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

const MyField = (props: IFieldProps<{}>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, setFieldValue } = props;

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={value as string} />
  ) : (
    <Input
      className={FieldClassName("fe-my-field", error)}
      value={(value as string) ?? ""}
      onChange={(e) => setFieldValue(fieldName, e.target.value, false, 3000)}
      status={error ? "error" : undefined}
      aria-invalid={!!error}
      aria-required={required}
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    />
  );
};

export default MyField;
```
