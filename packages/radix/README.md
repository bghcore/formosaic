# @formosaic/radix

Radix UI primitives adapter for `@formosaic/core`. Provides 28 accessible, unstyled field components using [Radix UI](https://www.radix-ui.com/) primitives (6 native) and semantic HTML (22 fallbacks). Ideal for Tailwind CSS and shadcn/ui projects.

## Installation

```bash
npm install @formosaic/radix @formosaic/core react react-dom react-hook-form \
  @radix-ui/react-checkbox @radix-ui/react-radio-group @radix-ui/react-select \
  @radix-ui/react-slider @radix-ui/react-switch
```

## Quick Start

```tsx
import { Formosaic, RulesEngineProvider, InjectedFieldProvider } from "@formosaic/core";
import { createRadixFieldRegistry } from "@formosaic/radix";

const fields = createRadixFieldRegistry();

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
| Textbox | `<input type="text">` (semantic HTML) |
| Number | `<input type="number">` (semantic HTML) |
| Toggle | `@radix-ui/react-switch` |
| Dropdown | `@radix-ui/react-select` |
| MultiSelect | `<select multiple>` (semantic HTML) |
| DateControl | `<input type="date">` (semantic HTML) |
| Slider | `@radix-ui/react-slider` |
| RadioGroup | `@radix-ui/react-radio-group` |
| CheckboxGroup | `@radix-ui/react-checkbox` |
| Textarea | `<textarea>` (semantic HTML) |
| DynamicFragment | `<input type="hidden">` |
| ReadOnly | `<span>` |

## Styling

This adapter ships with **no styles**. Radix primitives expose `data-state` attributes and CSS class names for custom styling. Use Tailwind CSS, CSS modules, or plain CSS to style components.

All fields emit `data-field-type` and `data-field-state` attributes for targeted styling:

```css
[data-field-type="Toggle"] { /* ... */ }
[data-field-state="error"] { /* ... */ }
```

## shadcn/ui Integration

This adapter is the recommended base for shadcn/ui projects. See the [shadcn integration guide](https://bghcore.github.io/formosaic/adapters/shadcn) for details.

## License

MIT
