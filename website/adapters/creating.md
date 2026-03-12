---
title: Creating a Custom UI Adapter
---

# Creating a Custom UI Adapter Package

Guide for building a new adapter package for `@formosaic/core`. An adapter maps the core library's abstract field types to concrete UI components from a specific design system.

## Architecture

```
@formosaic/core
  -> RenderField looks up injectedFields[componentType]
  -> React.cloneElement(element, IFieldProps)
  -> Your field component receives props and renders UI
```

Every field component receives `IFieldProps<T>` via `React.cloneElement`. Props are passed automatically by the core rendering pipeline.

## Step-by-Step Guide

### 1. Create the Package Structure

```
packages/my-adapter/
  package.json
  tsup.config.ts
  src/
    index.ts           # Barrel exports
    registry.ts        # createMyAdapterFieldRegistry()
    helpers.ts         # Re-exports from @formosaic/core/adapter-utils
    fields/
      Textbox.tsx
      Dropdown.tsx
      Toggle.tsx
      ...
    components/
      ReadOnlyText.tsx
      StatusMessage.tsx
      FormLoading.tsx
    __tests__/
      contract.test.ts
```

### 2. Understand IFieldProps

```ts
interface IFieldProps<T> {
  fieldName?: string;
  readOnly?: boolean;
  required?: boolean;
  error?: FieldError;
  saving?: boolean;
  value?: unknown;
  config?: T;
  options?: IOption[];
  label?: string;
  type?: string;
  placeholder?: string;
  setFieldValue?: (fieldName: string, fieldValue: unknown, skipSave?: boolean, timeout?: number) => void;
}
```

### 3. Implement Field Components

```tsx
import { IFieldProps } from "@formosaic/core";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const Textbox = (props: IFieldProps<{ placeHolder?: string }>) => {
  const { fieldName, value, readOnly, error, required, setFieldValue } = props;

  if (readOnly) {
    return <ReadOnlyText fieldName={fieldName} value={value as string} />;
  }

  return (
    <input
      type="text"
      value={(value as string) ?? ""}
      onChange={(e) => setFieldValue(fieldName, e.target.value, false, 3000)}
      aria-invalid={!!error}
      aria-required={required}
      data-field-type="Textbox"
      data-field-state={getFieldState({ error, required, readOnly })}
    />
  );
};

export default Textbox;
```

**Important patterns:**
- Always handle `readOnly` mode
- Use `setFieldValue` to report value changes
- `timeout` parameter controls auto-save debounce (3000ms for text, 0 for dropdowns)
- Emit `data-field-type` and `data-field-state` attributes

### 4. Implement the Registry

```tsx
import { ComponentTypes, Dictionary } from "@formosaic/core";

export function createMyAdapterFieldRegistry(): Dictionary<React.JSX.Element> {
  return {
    [ComponentTypes.Textbox]: React.createElement(Textbox),
    [ComponentTypes.Number]: React.createElement(NumberField),
    [ComponentTypes.Toggle]: React.createElement(Toggle),
    [ComponentTypes.Dropdown]: React.createElement(Dropdown),
    // ... all 13 Tier 1 fields
  };
}
```

### 5. Tier 1 Field Types (Required)

All adapters must implement these 13 Tier 1 fields:

| ComponentType Key | Purpose | Value Type |
|-------------------|---------|------------|
| `Textbox` | Single-line text input | `string` |
| `Number` | Numeric input | `number` |
| `Toggle` | Boolean switch | `boolean` |
| `Dropdown` | Single-select from `options` | `string` |
| `SimpleDropdown` | Single-select from `config.dropdownOptions` | `string` |
| `MultiSelect` | Multi-select from `options` | `string[]` |
| `DateControl` | Date picker | `string` (ISO 8601) |
| `Slider` | Range slider | `number` |
| `RadioGroup` | Radio button group | `string` |
| `CheckboxGroup` | Checkbox group | `string[]` |
| `Textarea` | Multi-line text | `string` |
| `DynamicFragment` | Hidden field | any |
| `ReadOnly` | Read-only text display | `string` |

### 6. Contract Tests

```ts
import { runAdapterContractTests } from "@formosaic/core/testing";
import { createMyAdapterFieldRegistry } from "../registry";

runAdapterContractTests("my-adapter", createMyAdapterFieldRegistry());
```

### 7. Registry Mixing

You can mix registries or override specific fields:

```tsx
const fields = {
  ...createRadixFieldRegistry(),
  Textbox: <MyStyledTextbox />,
  MyCustomType: <MyCustomComponent />,
};
```
