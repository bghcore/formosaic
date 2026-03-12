# AGENTS.md -- @formosaic/mui

## Package Purpose

Material UI (MUI) field component implementations for `@formosaic/core`. Provides 22 editable and 6 read-only field types, plus a one-line registry setup via `createMuiFieldRegistry()`.

## Critical Constraints

- **MUI v5 or v6 only.** Use `@mui/material` components. Do NOT import from `@material-ui/core` (v4).
- **`@emotion/react` and `@emotion/styled` are required peer dependencies** of MUI -- consumers must install them.
- **All field components receive `IFieldProps<T>`** via `React.cloneElement` -- this is the contract with core's `RenderField`.
- **Import core types from `@formosaic/core`**, not from relative paths into the core package.
- **Use `React.JSX.Element`** not bare `JSX.Element` for return types.

## Key Files

| File | Purpose |
|------|---------|
| `src/registry.ts` | `createMuiFieldRegistry()` -- maps `ComponentTypes` string keys to MUI field JSX elements. Returns `Record<string, React.JSX.Element>` for `InjectedFieldProvider`. |
| `src/helpers.ts` | Shared field helpers: `FieldClassName()` (CSS class with error state), `GetFieldDataTestId()` (data-testid builder), `formatDateTime()` (date string formatting), `DocumentLinksStrings` (link UI strings). |
| `src/index.ts` | Public API barrel exports. All field components, supporting components, registry, helpers, and types. |
| `src/fields/Textbox.tsx` | Text input using MUI `TextField`. |
| `src/fields/Number.tsx` | Numeric input. |
| `src/fields/Toggle.tsx` | Boolean toggle switch. |
| `src/fields/Dropdown.tsx` | Single-select dropdown. |
| `src/fields/MultiSelect.tsx` | Multi-select checkboxes. |
| `src/fields/MultiSelectSearch.tsx` | Multi-select with search/filter. |
| `src/fields/DateControl.tsx` | Date picker. |
| `src/fields/Slider.tsx` | Range slider. |
| `src/fields/DynamicFragment.tsx` | Dynamic fragment container. |
| `src/fields/PopOutEditor.tsx` | Expandable text editor / textarea. |
| `src/fields/DocumentLinks.tsx` | URL link CRUD. |
| `src/fields/StatusDropdown.tsx` | Status dropdown with color indicators. |
| `src/fields/RadioGroup.tsx` | Radio button group. |
| `src/fields/CheckboxGroup.tsx` | Checkbox group for multi-select. |
| `src/fields/Rating.tsx` | Star rating input. |
| `src/fields/ColorPicker.tsx` | Color picker input. |
| `src/fields/Autocomplete.tsx` | Autocomplete/typeahead input. |
| `src/fields/FileUpload.tsx` | File upload with drag-and-drop. |
| `src/fields/DateRange.tsx` | Date range picker (start + end). |
| `src/fields/DateTime.tsx` | Combined date and time picker. |
| `src/fields/PhoneInput.tsx` | Phone number input with formatting. |
| `src/fields/readonly/ReadOnly.tsx` | Read-only text display. |
| `src/fields/readonly/ReadOnlyArray.tsx` | Read-only array/list display. |
| `src/fields/readonly/ReadOnlyDateTime.tsx` | Read-only date/time display. |
| `src/fields/readonly/ReadOnlyCumulativeNumber.tsx` | Read-only cumulative number. |
| `src/fields/readonly/ReadOnlyRichText.tsx` | Read-only rich text/HTML. |
| `src/fields/readonly/ReadOnlyWithButton.tsx` | Read-only text with action button. |
| `src/components/ReadOnlyText.tsx` | Shared read-only text display component. |
| `src/components/StatusMessage.tsx` | Error/warning/saving status display. |
| `src/components/FormLoading.tsx` | Skeleton loading state. |

## Adding a New Field

1. Create `src/fields/MyField.tsx` implementing `IFieldProps<T>`
2. Add `export { default as MyField } from "./fields/MyField"` to `src/index.ts`
3. Add the component key to `ComponentTypes` in core's `src/constants.ts`
4. Register it in `src/registry.ts` inside `createMuiFieldRegistry()`

## Field Component Pattern

```tsx
import { IFieldProps } from "@formosaic/core";
import { TextField } from "@mui/material";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { FieldClassName, GetFieldDataTestId } from "../helpers";

interface IMyFieldProps {
  customOption?: string;
}

const MyField = (props: IFieldProps<IMyFieldProps>) => {
  const { fieldName, testId, value, readOnly, error, setFieldValue } = props;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue(fieldName, event.target.value, false, 3000);
  };

  return readOnly ? (
    <ReadOnlyText fieldName={fieldName} value={value as string} />
  ) : (
    <TextField
      className={FieldClassName("my-field", error)}
      autoComplete="off"
      value={(value as string) ?? ""}
      onChange={onChange}
      size="small"
      fullWidth
      error={!!error}
      helperText={error?.message}
      inputProps={{
        "data-testid": GetFieldDataTestId(fieldName, testId),
      }}
    />
  );
};

export default MyField;
```

Key points:
- Props type is `IFieldProps<T>` where `T` is your custom meta props interface
- Use `setFieldValue(fieldName, newValue, skipSave, debounceMs)` to update the form
- Handle `readOnly` state by rendering `ReadOnlyText` or a disabled variant
- Use MUI's `error` and `helperText` props for inline validation display
- Use `size="small"` and `fullWidth` for consistent sizing with other fields
- Use `FieldClassName()` for consistent error styling
- Use `GetFieldDataTestId()` for consistent test ID generation
- Export as `default` export
