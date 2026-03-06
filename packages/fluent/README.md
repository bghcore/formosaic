# @form-engine/fluent

Fluent UI v9 field components for [`@form-engine/core`](https://www.npmjs.com/package/@form-engine/core). Provides 13 editable and 6 read-only field types that plug into the core form engine.

## Install

```bash
npm install @form-engine/core @form-engine/fluent
```

Peer dependencies: `react`, `react-dom`, `react-hook-form`, `@fluentui/react-components`, `@form-engine/core`

## Quick Start

```tsx
import {
  RulesEngineProvider,
  InjectedFieldProvider,
  UseInjectedFieldContext,
  FormEngine,
} from "@form-engine/core";
import { createFluentFieldRegistry } from "@form-engine/fluent";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { useEffect } from "react";

function FieldRegistrar({ children }: { children: React.ReactNode }) {
  const { setInjectedFields } = UseInjectedFieldContext();
  useEffect(() => {
    setInjectedFields(createFluentFieldRegistry());
  }, []);
  return <>{children}</>;
}

function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <RulesEngineProvider>
        <InjectedFieldProvider>
          <FieldRegistrar>
            <FormEngine
              configName="myForm"
              programName="myApp"
              fieldConfigs={{
                name: { type: "Textbox", label: "Name", required: true },
                status: {
                  type: "Dropdown",
                  label: "Status",
                  options: [
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                  ],
                },
              }}
              defaultValues={{ name: "", status: "Active" }}
              saveData={async (data) => data}
            />
          </FieldRegistrar>
        </InjectedFieldProvider>
      </RulesEngineProvider>
    </FluentProvider>
  );
}
```

## Available Fields

### Editable Fields

| Component Key | Component | Description |
|---------------|-----------|-------------|
| `Textbox` | `HookTextbox` | Single-line text input |
| `Number` | `HookNumber` | Numeric input with validation |
| `Toggle` | `HookToggle` | Boolean toggle switch |
| `Dropdown` | `HookDropdown` | Single-select dropdown |
| `Multiselect` | `HookMultiSelect` | Multi-select dropdown |
| `DateControl` | `HookDateControl` | Date picker with clear button |
| `Slider` | `HookSlider` | Numeric slider |
| `SimpleDropdown` | `HookSimpleDropdown` | Dropdown from string array in config |
| `MultiSelectSearch` | `HookMultiSelectSearch` | Searchable multi-select (ComboBox) |
| `Textarea` | `HookPopOutEditor` | Multiline text with expand-to-modal |
| `DocumentLinks` | `HookDocumentLinks` | URL link CRUD |
| `StatusDropdown` | `HookStatusDropdown` | Dropdown with color status indicator |
| `DynamicFragment` | `HookFragment` | Hidden field (form state only) |

### Read-Only Fields

| Component Key | Component | Description |
|---------------|-----------|-------------|
| `ReadOnly` | `HookReadOnly` | Plain text display |
| `ReadOnlyArray` | `HookReadOnlyArray` | Array of strings |
| `ReadOnlyDateTime` | `HookReadOnlyDateTime` | Formatted date/time |
| `ReadOnlyCumulativeNumber` | `HookReadOnlyCumulativeNumber` | Computed sum of other fields |
| `ReadOnlyRichText` | `HookReadOnlyRichText` | Rendered HTML |
| `ReadOnlyWithButton` | `HookReadOnlyWithButton` | Text with action button |

## Registry Setup

`createFluentFieldRegistry()` returns a `Dictionary<JSX.Element>` mapping all component keys to their Fluent UI implementations. You can extend or override individual fields:

```tsx
import { createFluentFieldRegistry } from "@form-engine/fluent";

const fields = {
  ...createFluentFieldRegistry(),
  Textbox: <MyCustomTextbox />, // override built-in
  RichEditor: <MyRichEditor />, // add new type
};

setInjectedFields(fields);
```

## Supporting Components

The package also exports supporting components:

- **`ReadOnlyText`** -- Read-only text display
- **`StatusMessage`** -- Error/warning/saving status messages
- **`HookFormLoading`** -- Shimmer loading placeholder

## Works with Core v1.3.0

When paired with `@form-engine/core` v1.3.0+, you automatically get:

- **Error boundary** -- each field is individually wrapped in `FormErrorBoundary`, so one crashing field does not take down the form
- **Save reliability** -- AbortController cancels in-flight saves, configurable timeout and retry with exponential backoff
- **Accessibility** -- focus trap in modals, focus-to-first-error on validation failure, ARIA live regions for status announcements
- **Draft persistence** -- `useDraftPersistence` hook auto-saves form state to localStorage; `useBeforeUnload` warns on page leave
- **Theming render props** -- `FieldWrapper` accepts `renderLabel`, `renderError`, `renderStatus` for custom field chrome
- **CSS custom properties** -- override `--fe-error-color`, `--fe-field-gap`, etc. via optional `styles.css`
- **DevTools** -- `FormDevTools` component for debugging business rules, form values, and errors
- **JSON Schema import** -- `jsonSchemaToFieldConfig()` converts JSON Schema to field configs
- **Lazy field registry** -- `createLazyFieldRegistry()` for on-demand field component loading

## License

MIT
