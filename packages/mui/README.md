# @formosaic/mui

Material UI (MUI) field components for [`@formosaic/core`](https://www.npmjs.com/package/@formosaic/core). Provides 22 editable and 6 read-only field types that plug into the core form engine.

## Install

```bash
npm install @formosaic/core @formosaic/mui @mui/material @emotion/react @emotion/styled
```

Peer dependencies: `react`, `react-dom`, `react-hook-form`, `@mui/material`, `@formosaic/core`

## Quick Start

```tsx
import {
  RulesEngineProvider,
  InjectedFieldProvider,
  UseInjectedFieldContext,
  Formosaic,
} from "@formosaic/core";
import { createMuiFieldRegistry } from "@formosaic/mui";
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
            <Formosaic
              configName="myForm"
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
| `MultiSelectSearch` | `HookMultiSelectSearch` | `Autocomplete` (multiple) | Searchable multi-select |
| `Textarea` | `HookPopOutEditor` | `TextField` (multiline) + `Dialog` | Multiline text with expand-to-modal |
| `DocumentLinks` | `HookDocumentLinks` | `List` + `TextField` + `IconButton` | URL link CRUD |
| `StatusDropdown` | `HookStatusDropdown` | `Select` with color dots | Dropdown with color status indicator |
| `DynamicFragment` | `HookFragment` | Hidden input | Hidden field (form state only) |
| `RadioGroup` | `HookRadioGroup` | `RadioGroup` + `FormControlLabel` | Single-select radio button group |
| `CheckboxGroup` | `HookCheckboxGroup` | `FormGroup` + `Checkbox` | Multi-select checkbox group (value: `string[]`) |
| `Rating` | `HookRating` | `Rating` | Star rating input (value: `number`; configurable `max`, `allowHalf`) |
| `ColorPicker` | `HookColorPicker` | `<input type="color">` | Native color picker returning hex string |
| `Autocomplete` | `HookAutocomplete` | `Autocomplete` | Searchable single-select with type-ahead |
| `FileUpload` | `HookFileUpload` | `<input type="file">` + drag zone | File picker (single or multiple); validates size via `config.maxSizeMb` |
| `DateRange` | `HookDateRange` | Two `TextField` (type=date) | Two date inputs (From / To); value: `{ start, end }` ISO strings |
| `DateTime` | `HookDateTime` | `TextField` (type=datetime-local) | Combined date+time input; value: ISO datetime-local string |
| `PhoneInput` | `HookPhoneInput` | `TextField` with mask | Phone input with inline masking (`us`, `international`, `raw` formats) |

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
import { createMuiFieldRegistry } from "@formosaic/mui";

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

When paired with `@formosaic/core` v1.3.0+, you automatically get:

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
