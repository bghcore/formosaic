# Creating a Custom UI Adapter Package

This guide explains how to create a new UI adapter package for `@bghcore/dynamic-forms-core`. An adapter maps the core library's abstract field types to concrete UI components from a specific design system (MUI, Ant Design, Chakra UI, etc.).

## Overview

The core package (`@bghcore/dynamic-forms-core`) handles form state, business rules, validation, and field orchestration. It delegates rendering to "injected fields" -- a `Dictionary<JSX.Element>` that maps component type strings (like `"Textbox"`, `"Dropdown"`) to React elements. Your adapter package provides those elements.

## Architecture

```
@bghcore/dynamic-forms-core
  -> HookRenderField looks up injectedFields[componentType]
  -> React.cloneElement(element, IHookFieldSharedProps)
  -> Your field component receives props and renders UI
```

Every field component receives `IHookFieldSharedProps<T>` via `React.cloneElement`. You do not need to declare these props yourself -- they are passed automatically by the core rendering pipeline.

## Step-by-Step Guide

### 1. Create the Package Structure

```
packages/my-adapter/
  package.json
  tsconfig.json
  tsup.config.ts
  README.md
  src/
    index.ts           # Barrel exports
    registry.ts        # createMyAdapterFieldRegistry()
    helpers.ts         # Shared helpers
    fields/
      HookTextbox.tsx
      HookDropdown.tsx
      HookToggle.tsx
      HookNumber.tsx
      HookMultiSelect.tsx
      HookDateControl.tsx
      HookSlider.tsx
      HookFragment.tsx
      HookSimpleDropdown.tsx
      HookMultiSelectSearch.tsx
      HookPopOutEditor.tsx
      HookDocumentLinks.tsx
      HookStatusDropdown.tsx
      readonly/
        HookReadOnly.tsx
        HookReadOnlyArray.tsx
        HookReadOnlyDateTime.tsx
        HookReadOnlyCumulativeNumber.tsx
        HookReadOnlyRichText.tsx
        HookReadOnlyWithButton.tsx
    components/
      ReadOnlyText.tsx
      StatusMessage.tsx
      HookFormLoading.tsx
```

### 2. Configure package.json

```json
{
  "name": "@bghcore/dynamic-forms-my-adapter",
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "react-hook-form": "^7.0.0",
    "my-ui-library": "^X.0.0",
    "@bghcore/dynamic-forms-core": "^1.1.0"
  }
}
```

Key points:
- Your UI library and `@bghcore/dynamic-forms-core` are **peer dependencies**
- Use `"*"` for the core package in `devDependencies` to reference the local workspace version
- Mark externals in `tsup.config.ts` to avoid bundling peer deps

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
    "my-ui-library",          // Your UI library
    "@bghcore/dynamic-forms-core",
  ],
  jsx: "automatic",
});
```

### 4. Understand IHookFieldSharedProps

Every field component receives these props (from `@bghcore/dynamic-forms-core`):

```ts
interface IHookFieldSharedProps<T> {
  fieldName?: string;          // Field identifier
  entityId?: string;           // Entity ID for test IDs
  entityType?: string;         // Entity type for test IDs
  programName?: string;        // Program name for test IDs
  parentEntityId?: string;     // Parent entity ID
  parentEntityType?: string;   // Parent entity type
  readOnly?: boolean;          // Whether field is read-only
  required?: boolean;          // Whether field is required
  error?: FieldError;          // Validation error from react-hook-form
  errorCount?: number;         // Number of validation errors
  saving?: boolean;            // Whether form is currently saving
  savePending?: boolean;       // Whether a save is pending
  value?: unknown;             // Current field value
  meta?: T;                    // Component-specific metadata
  dropdownOptions?: IDropdownOption[];  // Options for select fields
  validations?: string[];      // Validation rule keys
  label?: string;              // Field label text
  component?: string;          // Component type string
  setFieldValue?: (            // Callback to update value
    fieldName: string,
    fieldValue: unknown,
    skipSave?: boolean,
    timeout?: number
  ) => void;
}
```

### 5. Implement Field Components

Each field component follows this pattern:

```tsx
import { IHookFieldSharedProps } from "@bghcore/dynamic-forms-core";
import React from "react";

const HookMyField = (props: IHookFieldSharedProps<IMyFieldMeta>) => {
  const { fieldName, value, readOnly, error, setFieldValue } = props;

  const onChange = (newValue: string) => {
    // Call setFieldValue to report changes back to the form
    // Parameters: fieldName, value, skipSave?, autoSaveDebounceMs?
    setFieldValue(fieldName, newValue, false, 3000);
  };

  // Always handle readOnly mode
  if (readOnly) {
    return <MyReadOnlyComponent value={value as string} />;
  }

  return (
    <MyInputComponent
      value={(value as string) ?? ""}
      onChange={onChange}
      error={!!error}
    />
  );
};

export default HookMyField;
```

Important patterns:
- **Always handle `readOnly` mode** -- render a non-editable display when `readOnly` is true
- **Use `setFieldValue`** to report value changes -- this triggers auto-save and business rules
- **The `timeout` parameter** on `setFieldValue` controls auto-save debounce (e.g., 3000ms for text, 0 for dropdowns)
- **Cast `value`** to the appropriate type (it comes as `unknown`)
- **Use `meta`** for component-specific configuration passed via `IFieldConfig.meta`
- **Use `dropdownOptions`** for select-type fields -- it provides `{ key, text, disabled? }[]`

### 6. Implement the Registry

The registry maps `ComponentTypes` constants to React elements:

```tsx
import { ComponentTypes, Dictionary } from "@bghcore/dynamic-forms-core";
import React from "react";

export function createMyAdapterFieldRegistry(): Dictionary<React.JSX.Element> {
  return {
    [ComponentTypes.Textbox]: React.createElement(HookTextbox),
    [ComponentTypes.Number]: React.createElement(HookNumber),
    [ComponentTypes.Toggle]: React.createElement(HookToggle),
    [ComponentTypes.Dropdown]: React.createElement(HookDropdown),
    [ComponentTypes.MultiSelect]: React.createElement(HookMultiSelect),
    [ComponentTypes.DateControl]: React.createElement(HookDateControl),
    [ComponentTypes.Slider]: React.createElement(HookSlider),
    [ComponentTypes.Fragment]: React.createElement(HookFragment),
    [ComponentTypes.SimpleDropdown]: React.createElement(HookSimpleDropdown),
    [ComponentTypes.MultiSelectSearch]: React.createElement(HookMultiSelectSearch),
    [ComponentTypes.Textarea]: React.createElement(HookPopOutEditor),
    [ComponentTypes.DocumentLinks]: React.createElement(HookDocumentLinks),
    [ComponentTypes.StatusDropdown]: React.createElement(HookStatusDropdown),
    [ComponentTypes.ReadOnly]: React.createElement(HookReadOnly),
    [ComponentTypes.ReadOnlyArray]: React.createElement(HookReadOnlyArray),
    [ComponentTypes.ReadOnlyDateTime]: React.createElement(HookReadOnlyDateTime),
    [ComponentTypes.ReadOnlyCumulativeNumber]: React.createElement(HookReadOnlyCumulativeNumber),
    [ComponentTypes.ReadOnlyRichText]: React.createElement(HookReadOnlyRichText),
    [ComponentTypes.ReadOnlyWithButton]: React.createElement(HookReadOnlyWithButton),
  };
}
```

### 7. Required Component Types

The following 19 component types should be implemented for a complete adapter:

**13 Editable Fields:**

| ComponentType Key | Purpose | Expected Value Type |
|-------------------|---------|---------------------|
| `Textbox` | Single-line text input | `string` |
| `Number` | Numeric input | `number` |
| `Toggle` | Boolean switch | `boolean` |
| `Dropdown` | Single-select from `dropdownOptions` | `string` |
| `MultiSelect` | Multi-select from `dropdownOptions` | `string[]` |
| `DateControl` | Date picker | `string` (ISO) |
| `Slider` | Range slider (uses `meta.min`, `meta.max`, `meta.step`) | `number` |
| `DynamicFragment` | Hidden field (form state only) | any |
| `SimpleDropdown` | Single-select from `meta.dropdownOptions` (string array) | `string` |
| `MultiSelectSearch` | Searchable multi-select from `dropdownOptions` | `string[]` |
| `Textarea` | Multi-line text with expand-to-dialog | `string` |
| `DocumentLinks` | Link title/URL CRUD | `{ title: string; url: string }[]` |
| `StatusDropdown` | Single-select with color indicators (uses `meta.statusColors`) | `string` |

**6 Read-Only Fields:**

| ComponentType Key | Purpose | Expected Value Type |
|-------------------|---------|---------------------|
| `ReadOnly` | Plain text display | `string` |
| `ReadOnlyArray` | Array of text values | `string[]` |
| `ReadOnlyDateTime` | Formatted date/time | `string` (ISO) |
| `ReadOnlyCumulativeNumber` | Computed sum (uses `meta.dependencyFields`) | computed `number` |
| `ReadOnlyRichText` | Rendered HTML content | `string` (HTML) |
| `ReadOnlyWithButton` | Text with action button (uses `meta.buttonText`, `meta.onButtonClick`) | `string` |

### 8. Consumer Usage

Consumers wire up the adapter like this:

```tsx
import { BusinessRulesProvider, InjectedHookFieldProvider, UseInjectedHookFieldContext, HookInlineForm } from "@bghcore/dynamic-forms-core";
import { createMyAdapterFieldRegistry } from "@bghcore/dynamic-forms-my-adapter";

function FieldRegistrar({ children }) {
  const { setInjectedFields } = UseInjectedHookFieldContext();
  useEffect(() => {
    setInjectedFields(createMyAdapterFieldRegistry());
  }, []);
  return <>{children}</>;
}

function App() {
  return (
    <MyUIThemeProvider>
      <BusinessRulesProvider>
        <InjectedHookFieldProvider>
          <FieldRegistrar>
            <HookInlineForm {...formProps} />
          </FieldRegistrar>
        </InjectedHookFieldProvider>
      </BusinessRulesProvider>
    </MyUIThemeProvider>
  );
}
```

### 9. Partial Adapters

You do not have to implement all 19 fields. If your use case only needs a subset, register only those types. The core will render nothing for unregistered component types. You can also mix registries:

```tsx
import { createFluentFieldRegistry } from "@bghcore/dynamic-forms-fluent";

const fields = {
  ...createFluentFieldRegistry(),           // Base Fluent fields
  Textbox: <MyCustomTextbox />,             // Override one field
  MyCustomType: <MyCustomComponent />,      // Add a new type
};
```

### 10. Helpers to Reuse

The adapter helpers file typically provides:

- `FieldClassName(base, error?)` -- Appends `" error"` class when there is a validation error
- `GetFieldDataTestId(fieldName, programName?, entityType?, entityId?)` -- Builds a consistent `data-testid` string
- `formatDateTime(dateStr, options?)` -- Formats ISO date strings for display
- `DocumentLinksStrings` -- String constants for document link UI labels

These are generic and can be copied directly from the Fluent or MUI adapters.

## Existing Adapters

- **`@bghcore/dynamic-forms-fluent`** -- Fluent UI v9 adapter
- **`@bghcore/dynamic-forms-mui`** -- Material UI (MUI) adapter
