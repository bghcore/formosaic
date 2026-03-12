# @formosaic/heroui

HeroUI field components for [@formosaic/core](https://www.npmjs.com/package/@formosaic/core).

This package provides 27 field types using **HeroUI**-styled semantic HTML components. All fields integrate with `@formosaic/core`'s rules engine and form orchestration.

> **Implementation note:** Field components use semantic HTML elements with appropriate ARIA attributes rather than `@heroui/react` components directly. This ensures compatibility across all environments including SSR and test runners (jsdom). In production, you can wrap the form in a `HeroUIProvider` for theme integration.

## Installation

```bash
npm install @formosaic/heroui @formosaic/core @heroui/react @internationalized/date react react-dom react-hook-form
```

## Quick Start

```tsx
import { Formosaic, RulesEngineProvider, InjectedFieldProvider } from "@formosaic/core";
import { createHeroUIFieldRegistry } from "@formosaic/heroui";

const fields = createHeroUIFieldRegistry();

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

| Component | HTML Element | Type Key |
|---|---|---|
| `Textbox` | `<input type="text">` | `Textbox` |
| `Number` | `<input type="number">` | `Number` |
| `Toggle` | `<input type="checkbox" role="switch">` | `Toggle` |
| `Dropdown` | `<select>` | `Dropdown` |
| `MultiSelect` | `<select multiple>` | `Multiselect` |
| `DateControl` | `<input type="date">` | `DateControl` |
| `Slider` | `<input type="range">` | `Slider` |
| `RadioGroup` | `<input type="radio">` (group) | `RadioGroup` |
| `CheckboxGroup` | `<input type="checkbox">` (group) | `CheckboxGroup` |
| `Textarea` | `<textarea>` | `Textarea` |
| `DynamicFragment` | `<input type="hidden">` | `DynamicFragment` |

### Read-Only Fields (1)

| Component | Renders | Type Key |
|---|---|---|
| `ReadOnly` | `ReadOnlyText` | `ReadOnly` |

## Custom Fields

You can extend or replace any field in the registry:

```tsx
import { createHeroUIFieldRegistry } from "@formosaic/heroui";

const fields = createHeroUIFieldRegistry();

// Replace the textbox with your own component
fields["Textbox"] = <MyCustomTextbox />;

// Add a brand new field type
fields["PhoneNumber"] = <MyPhoneInput />;
```

## Compared to Other Adapters

| Feature | `heroui` | `fluent` | `mui` | `headless` | `antd` | `chakra` | `mantine` |
|---|---|---|---|---|---|---|---|
| UI framework | HeroUI v2 | Fluent UI v9 | Material UI v5/v6 | None | Ant Design v5 | Chakra UI v3 | Mantine v7 |
| Date library | Native | - | - | Native | dayjs | Native | Native |
| Bundle size | Minimal | Includes Fluent | Includes MUI | Minimal | Includes antd | Includes Chakra | Includes Mantine |
| Styling | Your choice | Fluent tokens | MUI theme | Your choice | antd tokens | Chakra tokens | Mantine theme |

## License

MIT
