# @formosaic/base-web

Base Web (Uber) field components for [@formosaic/core](https://www.npmjs.com/package/@formosaic/core).

This package provides 27 field types using **Base Web (baseui)** components. Includes 9 native baseui components and 18 semantic HTML fallbacks. All fields integrate with `@formosaic/core`'s rules engine and form orchestration.

## Installation

```bash
npm install @formosaic/base-web @formosaic/core baseui styletron-engine-monolithic styletron-react react react-dom react-hook-form
```

## Quick Start

```tsx
import { Formosaic, RulesEngineProvider, InjectedFieldProvider } from "@formosaic/core";
import { createBaseWebFieldRegistry } from "@formosaic/base-web";
import { Client as Styletron } from "styletron-engine-monolithic";
import { Provider as StyletronProvider } from "styletron-react";
import { LightTheme, BaseProvider } from "baseui";

const engine = new Styletron();
const fields = createBaseWebFieldRegistry();

function App() {
  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <RulesEngineProvider>
          <InjectedFieldProvider fields={fields}>
            <Formosaic
              formConfig={myFormConfig}
              onSave={handleSave}
            />
          </InjectedFieldProvider>
        </RulesEngineProvider>
      </BaseProvider>
    </StyletronProvider>
  );
}
```

## Field Components

### Editable Fields (12)

| Component | baseui Component | Type Key |
|---|---|---|
| `Textbox` | `Input` (baseui/input) | `Textbox` |
| `Number` | `Input` (baseui/input, type="number") | `Number` |
| `Toggle` | `Checkbox` (baseui/checkbox, toggle mode) | `Toggle` |
| `Dropdown` | `Select` (baseui/select) | `Dropdown` |
| `MultiSelect` | `Select` (baseui/select, multi) | `Multiselect` |
| `DateControl` | `<input type="date">` (native fallback) | `DateControl` |
| `Slider` | `Slider` (baseui/slider) | `Slider` |
| `RadioGroup` | `RadioGroup` + `Radio` (baseui/radio) | `RadioGroup` |
| `CheckboxGroup` | `Checkbox` (baseui/checkbox) | `CheckboxGroup` |
| `Textarea` | `Textarea` (baseui/textarea) | `Textarea` |
| `DynamicFragment` | `<input type="hidden">` | `DynamicFragment` |

### Read-Only Fields (1)

| Component | Renders | Type Key |
|---|---|---|
| `ReadOnly` | `ReadOnlyText` | `ReadOnly` |

## Styling

Base Web components are styled via Styletron. You must wrap your application in a `StyletronProvider` and optionally a `BaseProvider` for theming. See [Base Web documentation](https://baseweb.design/) for theming details.

## Custom Fields

You can extend or replace any field in the registry:

```tsx
import { createBaseWebFieldRegistry } from "@formosaic/base-web";

const fields = createBaseWebFieldRegistry();

// Replace the textbox with your own component
fields["Textbox"] = <MyCustomTextbox />;

// Add a brand new field type
fields["PhoneNumber"] = <MyPhoneInput />;
```

## Compared to Other Adapters

| Feature | `base-web` | `fluent` | `mui` | `headless` | `antd` | `chakra` | `mantine` |
|---|---|---|---|---|---|---|---|
| UI framework | Base Web v14 | Fluent UI v9 | Material UI v5/v6 | None | Ant Design v5 | Chakra UI v3 | Mantine v7 |
| Styling engine | Styletron | Griffel | Emotion | Your choice | antd tokens | Chakra tokens | Mantine theme |
| Date library | Native | - | - | Native | dayjs | Native | Native |
| Bundle size | Includes baseui | Includes Fluent | Includes MUI | Minimal | Includes antd | Includes Chakra | Includes Mantine |

## License

MIT
