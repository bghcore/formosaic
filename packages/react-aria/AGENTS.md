# AGENTS.md -- @formosaic/react-aria

## Package Purpose

React Aria Components field components for `@formosaic/core`. Provides 10 native React Aria fields and 3 semantic HTML fields. Best-in-class ARIA accessibility patterns. Highest native Tier 1 coverage among primitives-first adapters (10/13). No provider wrapper needed.

## Critical Constraints

- **React Aria Components only.** Use `react-aria-components` for interactive components (TextField, NumberField, Switch, Select, Slider, RadioGroup, CheckboxGroup). Use semantic HTML for simple inputs (MultiSelect, DateControl, DynamicFragment).
- **No styles shipped.** All fields emit `data-field-type`, `data-field-state`, and `df-*` CSS class names. React Aria also exposes `data-*` render props for fine-grained state styling.
- **No provider wrapper needed.** Unlike Chakra/Mantine adapters, this adapter works without any wrapping provider.
- **All field components receive `IFieldProps<T>`** via `React.cloneElement` -- this is the contract with core's `RenderField`.
- **Import core types from `@formosaic/core`**, not from relative paths into the core package.
- **Use `React.JSX.Element`** not bare `JSX.Element` for return types.

## Known Divergences

- **DIV-012**: React Aria Select uses `Key` type (string | number) for `selectedKey`/`onSelectionChange`. The boundary cast `String(key)` is transparent and lossless.

## Key Files

| File | Purpose |
|------|---------|
| `src/registry.ts` | `createReactAriaFieldRegistry()` -- maps `ComponentTypes` keys to React Aria/HTML field JSX elements. Returns `Record<string, React.JSX.Element>` for `InjectedFieldProvider`. |
| `src/helpers.ts` | Re-exports shared helpers from `@formosaic/core/adapter-utils`: `GetFieldDataTestId()`, `getFieldState()`, `formatDateTime()`, `convertBooleanToYesOrNoText()`, `isNull()`. |
| `src/index.ts` | Public API barrel exports. |
| `src/fields/Textbox.tsx` | React Aria `TextField` + `Input` |
| `src/fields/Number.tsx` | React Aria `NumberField` + `Input` (NaN guard on onChange) |
| `src/fields/Toggle.tsx` | React Aria `Switch` |
| `src/fields/Dropdown.tsx` | React Aria `Select` + `Button` + `Popover` + `ListBox` + `ListBoxItem` |
| `src/fields/MultiSelect.tsx` | `<select multiple>` (semantic HTML) |
| `src/fields/DateControl.tsx` | `<input type="date">` (semantic HTML) with clear button |
| `src/fields/Slider.tsx` | React Aria `Slider` + `SliderTrack` + `SliderThumb` |
| `src/fields/RadioGroup.tsx` | React Aria `RadioGroup` + `Radio` |
| `src/fields/CheckboxGroup.tsx` | React Aria `CheckboxGroup` + `Checkbox` |
| `src/fields/Textarea.tsx` | React Aria `TextField` + `TextArea` (inline) + native `<dialog>` (modal) |
| `src/fields/DynamicFragment.tsx` | `<input type="hidden">` |
| `src/fields/readonly/ReadOnly.tsx` | `ReadOnlyText` display |
| `src/components/ReadOnlyText.tsx` | Shared read-only text renderer |

## Adding a New Field

1. Create `src/fields/MyField.tsx` implementing `IFieldProps<T>`
2. Use a React Aria Component if one exists for the interaction pattern, otherwise use semantic HTML
3. Use React Aria's `isInvalid`, `isRequired`, `isDisabled` props where supported
4. Emit `data-field-type` and `data-field-state` attributes for styling
5. Export from `src/index.ts`
6. Add to `ComponentTypes` in core's `src/constants.ts`
7. Register in `src/registry.ts` inside `createReactAriaFieldRegistry()`

## Field Component Pattern

```tsx
import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";
import { TextField, Input } from "react-aria-components";

const MyField = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={value as string} />;
  }

  return (
    <TextField
      className="df-my-field"
      value={(value as string) ?? ""}
      onChange={(val) => setFieldValue(fieldName, val, false, 3000)}
      isInvalid={!!error}
      isRequired={required}
      data-field-type="MyField"
      data-field-state={getFieldState({ error, required, readOnly })}
    >
      <Input
        autoComplete="off"
        data-testid={GetFieldDataTestId(fieldName, testId)}
      />
    </TextField>
  );
};

export default MyField;
```
