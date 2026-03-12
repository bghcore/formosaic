# @formosaic/react-aria

React Aria Components adapter for `@formosaic/core`. Provides 28 accessible field components using [React Aria Components](https://react-spectrum.adobe.com/react-aria/) for best-in-class ARIA patterns. Includes 11 native React Aria components and 17 semantic HTML fallbacks.

## Installation

```bash
npm install @formosaic/react-aria @formosaic/core react react-dom react-hook-form react-aria-components
```

## Quick Start

```tsx
import { Formosaic, RulesEngineProvider, InjectedFieldProvider } from "@formosaic/core";
import { createReactAriaFieldRegistry } from "@formosaic/react-aria";

const fields = createReactAriaFieldRegistry();

function App() {
  return (
    <RulesEngineProvider>
      <InjectedFieldProvider fields={fields}>
        <Formosaic config={formConfig} />
      </InjectedFieldProvider>
    </RulesEngineProvider>
  );
}
```

## Field Implementations

| Field | Implementation |
|-------|---------------|
| Textbox | React Aria `TextField` + `Input` |
| Number | React Aria `NumberField` + `Input` |
| Toggle | React Aria `Switch` |
| Dropdown | React Aria `Select` + `ListBox` + `Popover` |
| SimpleDropdown | React Aria `Select` + `ListBox` + `Popover` |
| MultiSelect | `<select multiple>` (semantic HTML) |
| DateControl | `<input type="date">` (semantic HTML) |
| Slider | React Aria `Slider` + `SliderTrack` + `SliderThumb` |
| RadioGroup | React Aria `RadioGroup` + `Radio` |
| CheckboxGroup | React Aria `CheckboxGroup` + `Checkbox` |
| Textarea | React Aria `TextField` + `TextArea` (inline) + native `<dialog>` (modal) |
| DynamicFragment | `<input type="hidden">` |
| ReadOnly | `<span>` |

## Styling

This adapter ships with **no styles**. React Aria Components expose `data-*` render props and CSS class names for custom styling. All fields emit `data-field-type` and `data-field-state` attributes:

```css
[data-field-type="Toggle"] { /* ... */ }
[data-field-state="error"] { /* ... */ }
```

## Accessibility

React Aria Components provide built-in accessibility features including keyboard navigation, focus management, and ARIA attributes. This adapter has the highest native Tier 1 coverage (10/13 fields use React Aria components natively).

## License

MIT
