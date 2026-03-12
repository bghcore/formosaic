# @formosaic/antd

Ant Design v5 field components for [@formosaic/core](https://www.npmjs.com/package/@formosaic/core).

This package provides 27 field types using **Ant Design v5** components, with `dayjs` for date handling. Includes 18 native antd components and 9 semantic HTML fallbacks. All fields integrate with `@formosaic/core`'s rules engine and form orchestration.

## Installation

```bash
npm install @formosaic/antd @formosaic/core antd dayjs react react-dom react-hook-form
```

## Quick Start

```tsx
import { Formosaic, RulesEngineProvider, InjectedFieldProvider } from "@formosaic/core";
import { createAntdFieldRegistry } from "@formosaic/antd";

const fields = createAntdFieldRegistry();

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

| Component | antd Component | Type Key |
|---|---|---|
| `Textbox` | `Input` | `Textbox` |
| `Number` | `InputNumber` | `Number` |
| `Toggle` | `Switch` | `Toggle` |
| `Dropdown` | `Select` | `Dropdown` |
| `MultiSelect` | `Select` (`mode="multiple"`) | `Multiselect` |
| `DateControl` | `DatePicker` (dayjs) | `DateControl` |
| `Slider` | `Slider` | `Slider` |
| `RadioGroup` | `Radio.Group` | `RadioGroup` |
| `CheckboxGroup` | `Checkbox.Group` | `CheckboxGroup` |
| `Textarea` | `Input.TextArea` | `Textarea` |
| `DynamicFragment` | `<input type="hidden">` | `DynamicFragment` |

### Read-Only Fields (1)

| Component | Renders | Type Key |
|---|---|---|
| `ReadOnly` | `ReadOnlyText` | `ReadOnly` |

## Custom Fields

You can extend or replace any field in the registry:

```tsx
import { createAntdFieldRegistry } from "@formosaic/antd";

const fields = createAntdFieldRegistry();

// Replace the textbox with your own component
fields["Textbox"] = <MyCustomTextbox />;

// Add a brand new field type
fields["PhoneNumber"] = <MyPhoneInput />;
```

## Compared to Other Adapters

| Feature | `antd` | `fluent` | `mui` | `headless` | `chakra` | `mantine` |
|---|---|---|---|---|---|---|
| UI framework | Ant Design v5 | Fluent UI v9 | Material UI v5/v6 | None | Chakra UI v3 | Mantine v7 |
| Date library | dayjs | - | - | Native | Native | Native |
| Bundle size | Includes antd | Includes Fluent | Includes MUI | Minimal | Includes Chakra | Includes Mantine |
| Styling | antd tokens | Fluent tokens | MUI theme | Your choice | Chakra tokens | Mantine theme |

## License

MIT
