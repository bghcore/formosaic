# Creating a Custom UI Adapter Package

Guide for building a new adapter package for `@form-eng/core`. An adapter maps the core library's abstract field types to concrete UI components from a specific design system.

For architecture context, see [adapter-architecture.md](./adapter-architecture.md). For choosing between existing adapters, see [choosing-an-adapter.md](./choosing-an-adapter.md).

## Architecture

```
@form-eng/core
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
  tsconfig.json
  tsup.config.ts
  README.md
  AGENTS.md
  llms.txt
  src/
    index.ts           # Barrel exports
    registry.ts        # createMyAdapterFieldRegistry()
    helpers.ts         # Re-exports from @form-eng/core/adapter-utils
    fields/
      Textbox.tsx
      Dropdown.tsx
      Toggle.tsx
      Number.tsx
      MultiSelect.tsx
      DateControl.tsx
      Slider.tsx
      DynamicFragment.tsx
      SimpleDropdown.tsx
      RadioGroup.tsx
      CheckboxGroup.tsx
      Textarea.tsx
      readonly/
        ReadOnly.tsx
    components/
      ReadOnlyText.tsx
      StatusMessage.tsx
      FormLoading.tsx
    __tests__/
      contract.test.ts
```

### 2. Configure package.json

```json
{
  "name": "@form-eng/my-adapter",
  "version": "1.5.2",
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "react-hook-form": "^7.0.0",
    "my-ui-library": "^X.0.0",
    "@form-eng/core": "^1.5.0"
  }
}
```

### 3. Configure tsup.config.ts

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "react-hook-form",
    "my-ui-library",
    "@form-eng/core",
  ],
  jsx: "automatic",
});
```

### 4. Understand IFieldProps

Every field component receives these props (from `@form-eng/core`):

```ts
interface IFieldProps<T> {
  fieldName?: string;
  entityId?: string;
  entityType?: string;
  programName?: string;
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

### 5. Implement Field Components

Field components do NOT use a `Hook*` prefix. Use bare names: `Textbox`, `Dropdown`, `Toggle`, etc.

```tsx
import { IFieldProps } from "@form-eng/core";
import React from "react";
import { ReadOnlyText } from "../components/ReadOnlyText";
import { GetFieldDataTestId, getFieldState } from "../helpers";

const Textbox = (props: IFieldProps<{ placeHolder?: string }>) => {
  const { fieldName, programName, entityType, entityId, value, readOnly, error, required, setFieldValue } = props;

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
      data-testid={GetFieldDataTestId(fieldName, programName, entityType, entityId)}
    />
  );
};

export default Textbox;
```

**Important patterns:**
- Always handle `readOnly` mode
- Use `setFieldValue` to report value changes (triggers auto-save and rules)
- `timeout` parameter controls auto-save debounce (3000ms for text, 0 for dropdowns)
- Cast `value` to the appropriate type
- Dropdown readOnly: look up option label before passing to ReadOnlyText
- Emit `data-field-type` and `data-field-state` attributes

### 6. Implement the Registry

```tsx
import { ComponentTypes, Dictionary } from "@form-eng/core";
import React from "react";

export function createMyAdapterFieldRegistry(): Dictionary<React.JSX.Element> {
  return {
    [ComponentTypes.Textbox]: React.createElement(Textbox),
    [ComponentTypes.Number]: React.createElement(Number),
    [ComponentTypes.Toggle]: React.createElement(Toggle),
    [ComponentTypes.Dropdown]: React.createElement(Dropdown),
    [ComponentTypes.MultiSelect]: React.createElement(MultiSelect),
    [ComponentTypes.DateControl]: React.createElement(DateControl),
    [ComponentTypes.Slider]: React.createElement(Slider),
    [ComponentTypes.Fragment]: React.createElement(DynamicFragment),
    [ComponentTypes.SimpleDropdown]: React.createElement(SimpleDropdown),
    [ComponentTypes.RadioGroup]: React.createElement(RadioGroup),
    [ComponentTypes.CheckboxGroup]: React.createElement(CheckboxGroup),
    [ComponentTypes.Textarea]: React.createElement(Textarea),
    [ComponentTypes.ReadOnly]: React.createElement(ReadOnly),
  };
}
```

### 7. Tier 1 Field Types (Required)

All adapters must implement these 13 Tier 1 fields:

| ComponentType Key | Purpose | Value Type |
|-------------------|---------|------------|
| `Textbox` | Single-line text input | `string` |
| `Number` | Numeric input | `number` |
| `Toggle` | Boolean switch | `boolean` |
| `Dropdown` | Single-select from `options` | `string` |
| `SimpleDropdown` | Single-select from `config.dropdownOptions` string array | `string` |
| `MultiSelect` | Multi-select from `options` | `string[]` |
| `DateControl` | Date picker | `string` (ISO 8601) |
| `Slider` | Range slider | `number` |
| `RadioGroup` | Radio button group from `options` | `string` |
| `CheckboxGroup` | Checkbox group from `options` | `string[]` |
| `Textarea` | Multi-line text | `string` |
| `DynamicFragment` | Hidden field (form state only) | any |
| `ReadOnly` | Read-only text display | `string` |

See [canonical-field-contracts.md](./canonical-field-contracts.md) for value semantics and readOnly behavior.

### 8. Helpers

Re-export shared helpers from `@form-eng/core/adapter-utils`:

```ts
// helpers.ts
export { GetFieldDataTestId, FieldClassName, getFieldState, formatDateTime, convertBooleanToYesOrNoText, isNull } from "@form-eng/core/adapter-utils";
```

### 9. Contract Tests

Add `src/__tests__/contract.test.ts` using the shared test infrastructure:

```ts
import { runAdapterContractTests } from "@form-eng/core/testing";
import { createMyAdapterFieldRegistry } from "../registry";

runAdapterContractTests("my-adapter", createMyAdapterFieldRegistry());
```

### 10. Partial Adapters and Registry Mixing

You can implement a subset of fields, or mix registries:

```tsx
const fields = {
  ...createRadixFieldRegistry(),       // Base Radix fields
  Textbox: <MyStyledTextbox />,        // Override one field
  MyCustomType: <MyCustomComponent />, // Add a custom type
};
```

## Existing Adapters

See [choosing-an-adapter.md](./choosing-an-adapter.md) for a full comparison of all 11 adapters and the shadcn recipe model.
