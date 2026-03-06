# @form-engine/mui

Material UI (MUI) field components for [`@form-engine/core`](https://www.npmjs.com/package/@form-engine/core). Provides 13 editable and 6 read-only field types that plug into the core form engine.

## Install

```bash
npm install @form-engine/core @form-engine/mui @mui/material @emotion/react @emotion/styled
```

Peer dependencies: `react`, `react-dom`, `react-hook-form`, `@mui/material`, `@form-engine/core`

## Quick Start

```tsx
import {
  RulesEngineProvider,
  InjectedFieldProvider,
  UseInjectedFieldContext,
  FormEngine,
} from "@form-engine/core";
import { createMuiFieldRegistry } from "@form-engine/mui";
import { ThemeProvider, createTheme } from "@mui/material";
import { useEffect } from "react";

const theme = createTheme();

function FieldRegistrar({ children }: { children: React.ReactNode }) {
  const { setInjectedFields } = UseInjectedFieldContext();
  useEffect(() => {
    setInjectedFields(createMuiFieldRegistry());
  }, []);
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
}
```

## Available Fields

### Editable Fields

| Component Key | Component | MUI Component | Description |
|---------------|-----------|---------------|-------------|
| `Textbox` | `HookTextbox` | `TextField` | Single-line text input |
| `Number` | `HookNumber` | `TextField` (type=number) | Numeric input with validation |
| `Toggle` | `HookToggle` | `Switch` + `FormControlLabel` | Boolean toggle switch |
| `Dropdown` | `HookDropdown` | `Select` + `MenuItem` | Single-select dropdown |
| `Multiselect` | `HookMultiSelect` | `Select` (multiple) + `Chip` | Multi-select dropdown |
| `DateControl` | `HookDateControl` | `TextField` (type=date) | Date picker with clear button |
| `Slider` | `HookSlider` | `Slider` | Numeric slider |
| `SimpleDropdown` | `HookSimpleDropdown` | `Select` + `MenuItem` | Dropdown from string array in config |
| `MultiSelectSearch` | `HookMultiSelectSearch` | `Autocomplete` (multiple) | Searchable multi-select |
| `Textarea` | `HookPopOutEditor` | `TextField` (multiline) + `Dialog` | Multiline text with expand-to-modal |
| `DocumentLinks` | `HookDocumentLinks` | `List` + `TextField` + `IconButton` | URL link CRUD |
| `StatusDropdown` | `HookStatusDropdown` | `Select` with color dots | Dropdown with color status indicator |
| `DynamicFragment` | `HookFragment` | Hidden input | Hidden field (form state only) |

### Read-Only Fields

| Component Key | Component | MUI Component | Description |
|---------------|-----------|---------------|-------------|
| `ReadOnly` | `HookReadOnly` | `Typography` | Plain text display |
| `ReadOnlyArray` | `HookReadOnlyArray` | `Typography` | Array of strings |
| `ReadOnlyDateTime` | `HookReadOnlyDateTime` | `Typography` | Formatted date/time |
| `ReadOnlyCumulativeNumber` | `HookReadOnlyCumulativeNumber` | `Typography` | Computed sum of other fields |
| `ReadOnlyRichText` | `HookReadOnlyRichText` | `dangerouslySetInnerHTML` | Rendered HTML |
| `ReadOnlyWithButton` | `HookReadOnlyWithButton` | `Typography` + `Button` | Text with action button |

## Registry Setup

`createMuiFieldRegistry()` returns a `Dictionary<JSX.Element>` mapping all component keys to their MUI implementations. You can extend or override individual fields:

```tsx
import { createMuiFieldRegistry } from "@form-engine/mui";

const fields = {
  ...createMuiFieldRegistry(),
  Textbox: <MyCustomTextbox />, // override built-in
  RichEditor: <MyRichEditor />, // add new type
};

setInjectedFields(fields);
```

## Supporting Components

The package also exports supporting components:

- **`ReadOnlyText`** -- Read-only text display using MUI Typography
- **`StatusMessage`** -- Error/warning/saving status messages
- **`HookFormLoading`** -- Skeleton loading placeholder using MUI Skeleton

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
