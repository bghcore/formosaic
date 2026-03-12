# Contributing a New UI Adapter Package

This guide walks through creating a new adapter package for `@formosaic/core`. An adapter maps the core form engine's field model to a specific UI library's components.

## Quick Start

1. Copy an existing adapter (headless is simplest) as a template
2. Replace UI components with your library's equivalents
3. Register all fields in `registry.ts`
4. Build and verify with `npm run build`

## Package Structure

```
packages/{your-lib}/
  package.json
  tsup.config.ts
  tsconfig.json
  src/
    index.ts          # Barrel exports
    registry.ts       # createXxxFieldRegistry()
    helpers.ts        # Re-exports from @formosaic/core
    components/
      ReadOnlyText.tsx
      StatusMessage.tsx
      FormLoading.tsx
    fields/
      Textbox.tsx
      Number.tsx
      Toggle.tsx
      Dropdown.tsx
      MultiSelect.tsx
      DateControl.tsx
      Slider.tsx
      RadioGroup.tsx
      CheckboxGroup.tsx
      Textarea.tsx
      DynamicFragment.tsx
    fields/readonly/
      ReadOnly.tsx
```

## The Adapter Contract

Every field component must:

1. **Accept `IFieldProps<TConfig>`** — The standard prop interface injected via `React.cloneElement()`
2. **Read `value` from props** — Never manage local state for the field value
3. **Call `setFieldValue(fieldName, newValue)`** — To update values in react-hook-form
4. **Handle `readOnly` mode** — Render `<ReadOnlyText>` when `readOnly` is true
5. **Set ARIA attributes** — `aria-invalid={!!error}`, `aria-required={required}`
6. **Set `data-testid`** — Via `GetFieldDataTestId(fieldName, testId?)`
7. **Export as `default`** — Each field file must have a default export

### What NOT to do

- Do NOT use the UI library's form wrapper (Ant Design `Form.Item`, Mantine `useForm`, etc.)
- Do NOT render labels or error messages — `FieldWrapper` from core handles this
- Do NOT manage field state locally — core + react-hook-form own all state

## Key Types

```typescript
// IFieldProps<T> — injected into every field component
interface IFieldProps<T = Record<string, unknown>> {
  fieldName?: string;
  testId?: string;
  readOnly?: boolean;
  required?: boolean;
  error?: FieldError;
  value?: unknown;
  config?: T;
  options?: IOption[];      // { value, label, disabled?, group? }
  label?: string;
  placeholder?: string;
  setFieldValue?: (fieldName: string, fieldValue: unknown) => void;
}
```

## Shared Utilities

Import shared helpers from `@formosaic/core` rather than reimplementing:

```typescript
// In your helpers.ts
export {
  FieldClassName,       // className + " error" when error present
  GetFieldDataTestId,   // data-testid generation
  formatDateTime,       // Date string formatting
  DocumentLinksStrings, // i18n strings for DocumentLinks
} from "@formosaic/core";
```

Shared config interfaces (import directly in field files):

```typescript
import {
  IRatingConfig,
  IDateRangeConfig,
  IDateRangeValue,
  IDateTimeConfig,
  IFileUploadConfig,
  IPhoneInputConfig,
  formatDateRange,
  formatDateTimeValue,
  getFileNames,
  extractDigits,
  formatPhone,
  MAX_FILE_SIZE_MB_DEFAULT,
} from "@formosaic/core";
```

## Registry Pattern

```typescript
import { ComponentTypes, Dictionary } from "@formosaic/core";
import React from "react";

export function createYourLibFieldRegistry(): Dictionary<React.JSX.Element> {
  return {
    [ComponentTypes.Textbox]: React.createElement(Textbox),
    [ComponentTypes.Number]: React.createElement(NumberField),
    // ... register all field components
  };
}
```

## Field Implementation Tiers

### Tier 1 (Required for launch — 12 types)
Textbox, Number, Toggle, Dropdown, MultiSelect, DateControl, Slider, RadioGroup, CheckboxGroup, Textarea, ReadOnly, DynamicFragment

### Tier 2 (Follow-up)
Autocomplete, FileUpload, Rating, ColorPicker, PhoneInput, DateRange, DateTime

### Tier 3 (Nice to have)
DocumentLinks, StatusDropdown, MultiSelectSearch, ReadOnlyArray, ReadOnlyDateTime, ReadOnlyCumulativeNumber, ReadOnlyRichText, ReadOnlyWithButton

## Build Configuration

Use the same tsup config pattern:

```typescript
// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "react", "react-dom", "react-hook-form",
    "@formosaic/core",
    "your-ui-library",  // Add your UI library as external
  ],
  jsx: "automatic",
});
```

## Checklist

- [ ] All Tier 1 fields implemented
- [ ] `createXxxFieldRegistry()` registers all fields
- [ ] `index.ts` exports all fields + components + registry + helpers
- [ ] `package.json` lists UI library as `peerDependency`
- [ ] Package builds successfully (`npm run build`)
- [ ] Added to root `package.json` build script
- [ ] Added to `.github/workflows/publish.yml`
