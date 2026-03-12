# @formosaic/headless

Headless (unstyled) semantic HTML field components for [@formosaic/core](https://www.npmjs.com/package/@formosaic/core).

This package renders all 27 field types using **only native HTML elements** -- no UI framework required. Every field outputs semantic HTML with `data-field-type` and `data-field-state` attributes for CSS targeting, ARIA attributes for accessibility, and CSS class names for styling.

## Installation

```bash
npm install @formosaic/headless @formosaic/core react react-dom react-hook-form
```

## Quick Start

```tsx
import { Formosaic, RulesEngineProvider, InjectedFieldProvider } from "@formosaic/core";
import { createHeadlessFieldRegistry } from "@formosaic/headless";

// Optional: import the minimal default styles
import "@formosaic/headless/styles.css";

const fields = createHeadlessFieldRegistry();

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

### Editable Fields (22)

| Component | HTML Elements | Type Key |
|---|---|---|
| `HookTextbox` | `<input type="text">` | `Textbox` |
| `HookNumber` | `<input type="number">` | `Number` |
| `HookToggle` | `<input type="checkbox" role="switch">` | `Toggle` |
| `HookDropdown` | `<select>` + `<option>` | `Dropdown` |
| `HookMultiSelect` | `<select multiple>` | `Multiselect` |
| `HookDateControl` | `<input type="date">` + clear button | `DateControl` |
| `HookSlider` | `<input type="range">` + `<output>` | `Slider` |
| `HookMultiSelectSearch` | `<input type="search">` + checkbox list | `MultiSelectSearch` |
| `HookTextarea` | `<textarea>` + expand `<dialog>` | `Textarea` |
| `HookDocumentLinks` | URL list with add/remove | `DocumentLinks` |
| `HookStatusDropdown` | `<select>` with status indicator | `StatusDropdown` |
| `HookDynamicFragment` | `<input type="hidden">` | `DynamicFragment` |
| `HookRadioGroup` | `<fieldset>` + `<input type="radio">` list | `RadioGroup` |
| `HookCheckboxGroup` | `<fieldset>` + `<input type="checkbox">` list | `CheckboxGroup` |
| `HookRating` | `<fieldset>` + radio inputs styled as stars | `Rating` |
| `HookColorPicker` | `<input type="color">` | `ColorPicker` |
| `HookAutocomplete` | `<input>` + `<datalist>` | `Autocomplete` |
| `HookFileUpload` | `<input type="file">` + drag-drop zone | `FileUpload` |
| `HookDateRange` | Two `<input type="date">` (From / To) | `DateRange` |
| `HookDateTime` | `<input type="datetime-local">` | `DateTime` |
| `HookPhoneInput` | `<input type="tel">` with mask | `PhoneInput` |

### Read-Only Fields (6)

| Component | HTML Elements | Type Key |
|---|---|---|
| `HookReadOnly` | `<span>` | `ReadOnly` |
| `HookReadOnlyArray` | `<ul>` / `<li>` | `ReadOnlyArray` |
| `HookReadOnlyDateTime` | `<time>` | `ReadOnlyDateTime` |
| `HookReadOnlyCumulativeNumber` | `<span>` | `ReadOnlyCumulativeNumber` |
| `HookReadOnlyRichText` | `<div dangerouslySetInnerHTML>` | `ReadOnlyRichText` |
| `HookReadOnlyWithButton` | `<span>` + `<button>` | `ReadOnlyWithButton` |

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

## Styling with Tailwind CSS

Since all fields render native HTML elements, integrating with Tailwind CSS is straightforward. Override the CSS custom properties or apply utility classes:

### Option 1: Override CSS custom properties

```css
/* globals.css */
:root {
  --df-font-family: theme("fontFamily.sans");
  --df-color-primary: theme("colors.blue.600");
  --df-color-error: theme("colors.red.600");
  --df-color-border: theme("colors.gray.300");
  --df-color-border-focus: theme("colors.blue.500");
  --df-border-radius: theme("borderRadius.md");
  --df-spacing-sm: theme("spacing.2");
  --df-spacing-md: theme("spacing.3");
}
```

### Option 2: Use Tailwind's `@apply` with data attributes

```css
[data-field-type="Textbox"],
[data-field-type="Number"] {
  @apply w-full rounded-md border border-gray-300 px-3 py-2 text-sm
         focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200;
}

[data-field-state="error"] input,
[data-field-state="error"] select,
[data-field-state="error"] textarea {
  @apply border-red-500;
}
```

### Option 3: Skip the default CSS entirely

The components are fully functional without any CSS. Import nothing, then style entirely with your own classes using the data attributes as selectors.

## Custom Fields

You can extend or replace any field in the registry:

```tsx
import { createHeadlessFieldRegistry } from "@formosaic/headless";

const fields = createHeadlessFieldRegistry();

// Replace the textbox with your own component
fields["Textbox"] = <MyCustomTextbox />;

// Add a brand new field type
fields["PhoneNumber"] = <MyPhoneInput />;
```

## Compared to Other Adapters

| Feature | `headless` | `fluent` | `mui` |
|---|---|---|---|
| UI framework | None | Fluent UI v9 | Material UI v5/v6 |
| Bundle size | Minimal | Includes Fluent | Includes MUI |
| Styling | Your choice | Fluent tokens | MUI theme |
| Accessibility | Native ARIA | Fluent ARIA | MUI ARIA |

## License

MIT
