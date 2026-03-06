# @form-eng/designer

Visual form builder for `@form-eng/core`. Drag-and-drop fields, configure properties, build rules, and export valid `IFormConfig` v2 JSON.

## Installation

```bash
npm install @form-eng/designer @form-eng/core react react-dom
```

## Usage

```tsx
import { DesignerProvider, FormDesigner } from "@form-eng/designer";
import "@form-eng/designer/dist/styles.css"; // or import in your CSS

function App() {
  return (
    <DesignerProvider>
      <FormDesigner style={{ height: "100vh" }} />
    </DesignerProvider>
  );
}
```

## Features

- **Field Palette** -- drag field types (Textbox, Dropdown, Toggle, etc.) onto the canvas
- **Form Canvas** -- reorder fields via drag-and-drop, select to edit, delete or duplicate
- **Field Config Panel** -- edit label, type, required/hidden/readOnly, default value, options, validation rules, and arbitrary config
- **Rule Builder** -- create declarative rules with the full v2 condition system (15 operators + AND/OR/NOT)
- **Wizard Configurator** -- organize fields into wizard steps with options for linear navigation and validation
- **Config Preview** -- live JSON preview of the current `IFormConfig` with copy button
- **Import / Export** -- paste or upload JSON to import, download as file to export
- **Undo / Redo** -- full undo/redo support for all changes

## Using the exported config

The designer produces a standard `IFormConfig` v2 object:

```tsx
import { useDesigner } from "@form-eng/designer";

function SaveButton() {
  const { exportConfig } = useDesigner();

  const handleSave = () => {
    const config = exportConfig();
    // config is a valid IFormConfig v2 object
    // Send to your API, save to localStorage, etc.
    console.log(JSON.stringify(config, null, 2));
  };

  return <button onClick={handleSave}>Save Form</button>;
}
```

## Customization

All styles use CSS custom properties prefixed with `--designer-`. Override them to match your theme:

```css
:root {
  --designer-primary: #0078d4;
  --designer-bg: #f5f5f5;
  --designer-surface: #ffffff;
  --designer-font-family: "Segoe UI", sans-serif;
}
```

## Components

| Component | Description |
|-----------|-------------|
| `DesignerProvider` | Context provider (wrap your app) |
| `FormDesigner` | Main layout with all tabs |
| `FieldPalette` | Draggable field type grid |
| `FormCanvas` | Drop zone with field cards |
| `FieldConfigPanel` | Property editor for selected field |
| `RuleBuilder` | Rule condition + effect editor |
| `ConfigPreview` | Read-only JSON preview |
| `WizardConfigurator` | Wizard step manager |
| `ImportExport` | JSON import/export |

## Hooks

| Hook | Description |
|------|-------------|
| `useDesigner()` | Access designer state and all action helpers |
