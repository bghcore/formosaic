# @form-eng/chakra

Chakra UI v3 field components for [@form-eng/core](https://www.npmjs.com/package/@form-eng/core).

This package provides 13 field types using **Chakra UI v3** components. Some fields use semantic HTML fallbacks where Chakra v3's compound components have TypeScript DTS compatibility issues with Ark UI's `Assign` type.

## Installation

```bash
npm install @form-eng/chakra @form-eng/core @chakra-ui/react react react-dom react-hook-form
```

## Quick Start

```tsx
import { FormEngine, RulesEngineProvider, InjectedFieldProvider } from "@form-eng/core";
import { createChakraFieldRegistry } from "@form-eng/chakra";

const fields = createChakraFieldRegistry();

function App() {
  return (
    <RulesEngineProvider>
      <InjectedFieldProvider fields={fields}>
        <FormEngine
          formConfig={myFormConfig}
          entityData={myEntityData}
          onSave={handleSave}
        />
      </InjectedFieldProvider>
    </RulesEngineProvider>
  );
}
```

## Field Components

### Editable Fields (12)

| Component | Implementation | Type Key |
|---|---|---|
| `Textbox` | Chakra `Input` | `Textbox` |
| `Number` | Chakra `Input` (`type="number"`) | `Number` |
| `Toggle` | Semantic `<input type="checkbox" role="switch">` * | `Toggle` |
| `Dropdown` | Chakra `NativeSelect` | `Dropdown` |
| `SimpleDropdown` | Chakra `NativeSelect` | `SimpleDropdown` |
| `MultiSelect` | Semantic `<select multiple>` * | `Multiselect` |
| `DateControl` | Chakra `Input` (`type="date"`) | `DateControl` |
| `Slider` | Semantic `<input type="range">` * | `Slider` |
| `RadioGroup` | Semantic `<fieldset>` + `<input type="radio">` * | `RadioGroup` |
| `CheckboxGroup` | Semantic `<fieldset>` + `<input type="checkbox">` * | `CheckboxGroup` |
| `Textarea` | Chakra `Textarea` | `Textarea` |
| `DynamicFragment` | `<input type="hidden">` | `DynamicFragment` |

\* Uses semantic HTML fallback due to Chakra v3 compound component DTS issues with Ark UI's `Assign` type. Styled with Chakra CSS variables for visual consistency.

### Read-Only Fields (1)

| Component | Renders | Type Key |
|---|---|---|
| `ReadOnly` | `ReadOnlyText` | `ReadOnly` |

## Custom Fields

You can extend or replace any field in the registry:

```tsx
import { createChakraFieldRegistry } from "@form-eng/chakra";

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
