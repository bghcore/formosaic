# @formosaic/chakra

Chakra UI v3 field components for [@formosaic/core](https://www.npmjs.com/package/@formosaic/core).

This package provides 28 field types using **Chakra UI v3** components. Includes 7 native Chakra components and 21 semantic HTML fallbacks (due to Ark UI DTS compatibility issues with compound components).

## Installation

```bash
npm install @formosaic/chakra @formosaic/core @chakra-ui/react react react-dom react-hook-form
```

## Quick Start

```tsx
import { Formosaic, RulesEngineProvider, InjectedFieldProvider } from "@formosaic/core";
import { createChakraFieldRegistry } from "@formosaic/chakra";

const fields = createChakraFieldRegistry();

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

| Component | Implementation | Type Key | Status |
|---|---|---|---|
| `Textbox` | Chakra `Input` | `Textbox` | Native Chakra |
| `Number` | Chakra `Input` (`type="number"`) | `Number` | Native Chakra |
| `Toggle` | Semantic `<input type="checkbox" role="switch">` | `Toggle` | Temporary - awaiting Chakra v3 DTS fix |
| `Dropdown` | Chakra `NativeSelect` | `Dropdown` | Native Chakra |
| `SimpleDropdown` | Chakra `NativeSelect` | `SimpleDropdown` | Native Chakra |
| `MultiSelect` | Semantic `<select multiple>` | `Multiselect` | Temporary - awaiting Chakra v3 DTS fix |
| `DateControl` | Chakra `Input` (`type="date"`) | `DateControl` | Native Chakra |
| `Slider` | Semantic `<input type="range">` | `Slider` | Temporary - awaiting Chakra v3 DTS fix |
| `RadioGroup` | Semantic `<fieldset>` + `<input type="radio">` | `RadioGroup` | Temporary - awaiting Chakra v3 DTS fix |
| `CheckboxGroup` | Semantic `<fieldset>` + `<input type="checkbox">` | `CheckboxGroup` | Temporary - awaiting Chakra v3 DTS fix |
| `Textarea` | Chakra `Textarea` | `Textarea` | Native Chakra |
| `DynamicFragment` | `<input type="hidden">` | `DynamicFragment` | Expected - native HTML |

Fields with "Temporary" status use semantic HTML fallbacks due to Chakra v3 compound component DTS issues with Ark UI's `Assign` type. They are styled with Chakra CSS variables for visual consistency and will be replaced with native Chakra components when the issue is resolved.

### Read-Only Fields (1)

| Component | Renders | Type Key | Status |
|---|---|---|---|
| `ReadOnly` | `ReadOnlyText` | `ReadOnly` | Expected - native HTML |

## Custom Fields

You can extend or replace any field in the registry:

```tsx
import { createChakraFieldRegistry } from "@formosaic/chakra";

const fields = createChakraFieldRegistry();

// Replace the textbox with your own component
fields["Textbox"] = <MyCustomTextbox />;

// Add a brand new field type
fields["PhoneNumber"] = <MyPhoneInput />;
```

## Compared to Other Adapters

| Feature | `chakra` | `fluent` | `mui` | `headless` | `antd` | `mantine` |
|---|---|---|---|---|---|---|
| UI framework | Chakra UI v3 | Fluent UI v9 | Material UI v5/v6 | None | Ant Design v5 | Mantine v7 |
| Date library | Native | - | - | Native | dayjs | Native |
| Bundle size | Includes Chakra | Includes Fluent | Includes MUI | Minimal | Includes antd | Includes Mantine |
| Styling | Chakra tokens | Fluent tokens | MUI theme | Your choice | antd tokens | Mantine theme |

## License

MIT
