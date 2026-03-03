# @bghcore/dynamic-forms-mui

Material UI (MUI) field components for [`@bghcore/dynamic-forms-core`](https://www.npmjs.com/package/@bghcore/dynamic-forms-core). Provides 13 editable and 6 read-only field types that plug into the core form engine.

## Install

```bash
npm install @bghcore/dynamic-forms-core @bghcore/dynamic-forms-mui @mui/material @emotion/react @emotion/styled
```

Peer dependencies: `react`, `react-dom`, `react-hook-form`, `@mui/material`, `@bghcore/dynamic-forms-core`

## Quick Start

```tsx
import {
  BusinessRulesProvider,
  InjectedHookFieldProvider,
  UseInjectedHookFieldContext,
  HookInlineForm,
} from "@bghcore/dynamic-forms-core";
import { createMuiFieldRegistry } from "@bghcore/dynamic-forms-mui";
import { ThemeProvider, createTheme } from "@mui/material";
import { useEffect } from "react";

const theme = createTheme();

function FieldRegistrar({ children }: { children: React.ReactNode }) {
  const { setInjectedFields } = UseInjectedHookFieldContext();
  useEffect(() => {
    setInjectedFields(createMuiFieldRegistry());
  }, []);
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BusinessRulesProvider>
        <InjectedHookFieldProvider>
          <FieldRegistrar>
            <HookInlineForm
              configName="myForm"
              programName="myApp"
              fieldConfigs={{
                name: { component: "Textbox", label: "Name", required: true },
                status: {
                  component: "Dropdown",
                  label: "Status",
                  dropdownOptions: [
                    { key: "Active", text: "Active" },
                    { key: "Inactive", text: "Inactive" },
                  ],
                },
              }}
              defaultValues={{ name: "", status: "Active" }}
              saveData={async (data) => data}
            />
          </FieldRegistrar>
        </InjectedHookFieldProvider>
      </BusinessRulesProvider>
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
| `SimpleDropdown` | `HookSimpleDropdown` | `Select` + `MenuItem` | Dropdown from string array in meta |
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
import { createMuiFieldRegistry } from "@bghcore/dynamic-forms-mui";

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

## License

MIT
