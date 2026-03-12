# @formosaic/mantine

Mantine v7 field components for [@formosaic/core](https://www.npmjs.com/package/@formosaic/core).

This package provides 28 field types using **Mantine v7** components. Includes 18 native Mantine components (Rating, Autocomplete, DateTimePicker, FileInput, ColorInput for Tier 2) and 10 semantic HTML fallbacks.

## Installation

```bash
npm install @formosaic/mantine @formosaic/core @mantine/core @mantine/dates react react-dom react-hook-form
```

## Quick Start

```tsx
import { Formosaic, RulesEngineProvider, InjectedFieldProvider } from "@formosaic/core";
import { createMantineFieldRegistry } from "@formosaic/mantine";

// Required: import Mantine's core styles
import "@mantine/core/styles.css";

const fields = createMantineFieldRegistry();

function App() {
  return (
    <RulesEngineProvider>
      <InjectedFieldProvider fields={fields}>
        <Formosaic
          formConfig={myFormConfig}
          onSave={handleSave}
        />
      </InjectedFieldProvider>
    </RulesEngineProvider>
  );
}
```

## Field Components

### Editable Fields (12)

| Component | Mantine Component | Type Key |
|---|---|---|
| `Textbox` | `TextInput` | `Textbox` |
| `Number` | `NumberInput` | `Number` |
| `Toggle` | `Switch` | `Toggle` |
| `Dropdown` | `Select` | `Dropdown` |
| `SimpleDropdown` | `Select` | `SimpleDropdown` |
| `MultiSelect` | `MultiSelect` | `Multiselect` |
| `DateControl` | Native `<input type="date">` | `DateControl` |
| `Slider` | `Slider` | `Slider` |
| `RadioGroup` | `Radio.Group` + `Radio` | `RadioGroup` |
| `CheckboxGroup` | `Checkbox.Group` + `Checkbox` | `CheckboxGroup` |
| `Textarea` | `Textarea` | `Textarea` |
| `DynamicFragment` | `<input type="hidden">` | `DynamicFragment` |

### Read-Only Fields (1)

| Component | Renders | Type Key |
|---|---|---|
| `ReadOnly` | `ReadOnlyText` | `ReadOnly` |

## Custom Fields

You can extend or replace any field in the registry:

```tsx
import { createMantineFieldRegistry } from "@formosaic/mantine";

const fields = createMantineFieldRegistry();

// Replace the textbox with your own component
fields["Textbox"] = <MyCustomTextbox />;

// Add a brand new field type
fields["PhoneNumber"] = <MyPhoneInput />;
```

## Compared to Other Adapters

| Feature | `mantine` | `fluent` | `mui` | `headless` | `antd` | `chakra` |
|---|---|---|---|---|---|---|
| UI framework | Mantine v7 | Fluent UI v9 | Material UI v5/v6 | None | Ant Design v5 | Chakra UI v3 |
| Date library | Native | - | - | Native | dayjs | Native |
| Bundle size | Includes Mantine | Includes Fluent | Includes MUI | Minimal | Includes antd | Includes Chakra |
| Styling | Mantine theme | Fluent tokens | MUI theme | Your choice | antd tokens | Chakra tokens |

## License

MIT
