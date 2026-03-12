# @formosaic/atlaskit

Atlassian Design System compatible field components for [@formosaic/core](https://www.npmjs.com/package/@formosaic/core).

This package provides 28 field types using **semantic HTML elements** with Atlassian Design System compatible CSS class names (prefixed `ak-`). All fields integrate with `@formosaic/core`'s rules engine and form orchestration. No `@atlaskit/*` packages are required -- fields render native HTML with `data-field-type` and `data-field-state` attributes for CSS targeting and ARIA attributes for accessibility.

## Installation

```bash
npm install @formosaic/atlaskit @formosaic/core react react-dom react-hook-form
```

## Quick Start

```tsx
import { Formosaic, RulesEngineProvider, InjectedFieldProvider } from "@formosaic/core";
import { createAtlaskitFieldRegistry } from "@formosaic/atlaskit";

const fields = createAtlaskitFieldRegistry();

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

| Component | HTML Elements | Type Key |
|---|---|---|
| `Textbox` | `<input type="text">` | `Textbox` |
| `Number` | `<input type="number">` | `Number` |
| `Toggle` | `<input type="checkbox" role="switch">` | `Toggle` |
| `Dropdown` | `<select>` + `<option>` | `Dropdown` |
| `SimpleDropdown` | `<select>` for string arrays | `SimpleDropdown` |
| `MultiSelect` | `<select multiple>` | `Multiselect` |
| `DateControl` | `<input type="date">` + clear button | `DateControl` |
| `Slider` | `<input type="range">` + `<output>` | `Slider` |
| `RadioGroup` | `<div role="radiogroup">` + `<input type="radio">` | `RadioGroup` |
| `CheckboxGroup` | `<div>` + `<input type="checkbox">` | `CheckboxGroup` |
| `Textarea` | `<textarea>` + expand `<dialog>` | `Textarea` |
| `DynamicFragment` | `<input type="hidden">` | `DynamicFragment` |

### Read-Only Fields (1)

| Component | Renders | Type Key |
|---|---|---|
| `ReadOnly` | `ReadOnlyText` (`<span>`) | `ReadOnly` |

## Data Attributes

Every field renders `data-field-type` and `data-field-state` attributes for CSS targeting:

```css
/* Target all textboxes */
[data-field-type="Textbox"] { /* ... */ }

/* Target fields in error state */
[data-field-state="error"] { /* ... */ }

/* Target required fields */
[data-field-state="required"] { /* ... */ }

/* Target read-only fields */
[data-field-state="readonly"] { /* ... */ }
```

## Styling

All CSS class names use the `ak-` prefix for Atlassian Design System compatibility. You can style fields using Atlassian design tokens or any CSS approach:

```css
.ak-textbox {
  font-family: var(--ds-font-family-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
  border: 2px solid var(--ds-border-input, #DFE1E6);
  border-radius: var(--ds-border-radius, 3px);
  padding: var(--ds-space-075, 6px) var(--ds-space-075, 6px);
}

.ak-textbox:focus {
  border-color: var(--ds-border-focused, #4C9AFF);
}
```

## Custom Fields

You can extend or replace any field in the registry:

```tsx
import { createAtlaskitFieldRegistry } from "@formosaic/atlaskit";

const fields = createAtlaskitFieldRegistry();

// Replace the textbox with your own component
fields["Textbox"] = <MyCustomTextbox />;

// Add a brand new field type
fields["PhoneNumber"] = <MyPhoneInput />;
```

## Compared to Other Adapters

| Feature | `atlaskit` | `fluent` | `mui` | `headless` | `antd` | `chakra` | `mantine` |
|---|---|---|---|---|---|---|---|
| UI framework | Semantic HTML | Fluent UI v9 | Material UI v5/v6 | Semantic HTML | Ant Design v5 | Chakra UI v3 | Mantine v7 |
| CSS prefix | `ak-` | `fe-` | `fe-` | `df-` | `fe-` | `fe-` | `fe-` |
| Bundle size | Minimal | Includes Fluent | Includes MUI | Minimal | Includes antd | Includes Chakra | Includes Mantine |
| Styling | Your choice / Atlassian tokens | Fluent tokens | MUI theme | Your choice | antd tokens | Chakra tokens | Mantine theme |

## License

MIT
