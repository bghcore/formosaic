# AGENTS.md -- @formosaic/radix

## Package Purpose

Radix UI primitives field components for `@formosaic/core`. Provides 5 native Radix fields (Toggle, Dropdown, Slider, RadioGroup, CheckboxGroup) and 7 semantic HTML fields. Ships with **no styles** -- ideal as the base for Tailwind CSS, shadcn/ui, and custom design systems. No provider wrapper needed.

## Critical Constraints

- **Radix UI primitives only.** Use `@radix-ui/react-*` packages for interactive components (Select, Switch, Slider, Checkbox, RadioGroup). Use semantic HTML for simple inputs (Textbox, Number, Textarea, MultiSelect, DateControl, DynamicFragment).
- **No styles shipped.** All fields emit `data-field-type`, `data-field-state`, and `df-*` CSS class names for consumer styling.
- **No provider wrapper needed.** Unlike Chakra/Mantine adapters, this adapter works without any wrapping provider.
- **All field components receive `IFieldProps<T>`** via `React.cloneElement` -- this is the contract with core's `RenderField`.
- **Import core types from `@formosaic/core`**, not from relative paths into the core package.
- **Use `React.JSX.Element`** not bare `JSX.Element` for return types.

## Known Divergences

- **DIV-010**: Radix Select uses `undefined` (not `""`) for empty/no-selection state. The boundary conversion `(value as string) || undefined` handles this.
- **DIV-011**: Radix Slider uses `number[]` internally. The boundary conversion `value={[num]}` / `onValueChange={([num]) => ...}` is transparent.
- **ResizeObserver mock**: Radix Slider requires `global.ResizeObserver` mock in jsdom tests.

## Key Files

| File | Purpose |
|------|---------|
| `src/registry.ts` | `createRadixFieldRegistry()` -- maps `ComponentTypes` keys to Radix/HTML field JSX elements. Returns `Record<string, React.JSX.Element>` for `InjectedFieldProvider`. |
| `src/helpers.ts` | Re-exports shared helpers from `@formosaic/core/adapter-utils`: `GetFieldDataTestId()`, `getFieldState()`, `formatDateTime()`, `convertBooleanToYesOrNoText()`, `isNull()`. |
| `src/index.ts` | Public API barrel exports. |
| `src/fields/Textbox.tsx` | `<input type="text">` (semantic HTML) |
| `src/fields/Number.tsx` | `<input type="number">` (semantic HTML) |
| `src/fields/Toggle.tsx` | `@radix-ui/react-switch` (Switch.Root + Switch.Thumb) |
| `src/fields/Dropdown.tsx` | `@radix-ui/react-select` (Select.Root + Trigger + Content + Items) |
| `src/fields/MultiSelect.tsx` | `<select multiple>` (semantic HTML) |
| `src/fields/DateControl.tsx` | `<input type="date">` (semantic HTML) with clear button |
| `src/fields/Slider.tsx` | `@radix-ui/react-slider` (Slider.Root + Track + Range + Thumb) |
| `src/fields/RadioGroup.tsx` | `@radix-ui/react-radio-group` (Root + Items) |
| `src/fields/CheckboxGroup.tsx` | `@radix-ui/react-checkbox` (Checkbox.Root per option) |
| `src/fields/Textarea.tsx` | `<textarea>` (semantic HTML) |
| `src/fields/DynamicFragment.tsx` | `<input type="hidden">` |
| `src/fields/readonly/ReadOnly.tsx` | `ReadOnlyText` display |
| `src/components/ReadOnlyText.tsx` | Shared read-only text renderer |

## Adding a New Field

1. Create `src/fields/MyField.tsx` implementing `IFieldProps<T>`
2. Use a Radix UI primitive if one exists for the interaction pattern, otherwise use semantic HTML
3. Emit `data-field-type` and `data-field-state` attributes for styling
4. Export from `src/index.ts`
5. Add to `ComponentTypes` in core's `src/constants.ts`
6. Register in `src/registry.ts` inside `createRadixFieldRegistry()`

## Field Component Pattern

```tsx
import { IFieldProps } from "@formosaic/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const MyField = (props: IFieldProps<{}>) => {
  const { fieldName, testId, value, readOnly, error, required, setFieldValue } = props;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={value as string} />;
  }

  return (
    <input
      type="text"
      className="df-my-field"
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

## shadcn/ui Integration

This adapter is the recommended base for shadcn/ui projects. See the [shadcn integration guide](https://bghcore.github.io/formosaic/adapters/shadcn) and the reference implementation in `stories/examples/shadcn-fields/` for the registry spread pattern.
