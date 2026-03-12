---
title: shadcn/ui Integration Guide
---

# shadcn/ui Integration Guide

## Why There Is No @formosaic/shadcn Package

shadcn/ui is a **distribution model**, not an npm library. You copy components into your project and own them locally. There is no `shadcn-ui` package to depend on.

Instead, shadcn projects should use one of the approaches below.

## Approach A: Use @formosaic/radix directly (Recommended)

shadcn/ui components are built on Radix UI primitives. The `@formosaic/radix` adapter uses the same Radix primitives.

```bash
npm install @formosaic/core @formosaic/radix
```

```tsx
import { FormEngine, RulesEngineProvider, InjectedFieldProvider } from "@formosaic/core";
import { createRadixFieldRegistry } from "@formosaic/radix";

const fields = createRadixFieldRegistry();

function App() {
  return (
    <RulesEngineProvider>
      <InjectedFieldProvider fields={fields}>
        <FormEngine config={formConfig} entityData={data} />
      </InjectedFieldProvider>
    </RulesEngineProvider>
  );
}
```

Style the unstyled Radix primitives using Tailwind and the `data-field-type` / `data-field-state` attributes:

```css
[data-field-type="Toggle"] { @apply flex items-center gap-2; }
[data-field-state="error"] { @apply border-red-500; }
[data-state="checked"] { @apply bg-primary; }
```

## Approach B: Local Wrappers

Wrap your existing shadcn/ui components with the `IFieldProps` interface:

```tsx
// components/form-fields/ShadcnTextbox.tsx
import { IFieldProps } from "@formosaic/core";
import { Input } from "@/components/ui/input";

const ShadcnTextbox = (props: IFieldProps<{ placeHolder?: string }>) => {
  const { fieldName, value, readOnly, error, required, placeholder, config, setFieldValue } = props;

  if (readOnly) {
    return <span className="text-sm text-muted-foreground">{(value as string) || "-"}</span>;
  }

  return (
    <Input
      value={(value as string) ?? ""}
      onChange={(e) => setFieldValue(fieldName, e.target.value, false, 3000)}
      placeholder={placeholder ?? config?.placeHolder}
      aria-invalid={!!error}
      aria-required={required}
      className={error ? "border-destructive" : ""}
    />
  );
};
```

## Approach C: Hybrid (Radix base + selective overrides)

Start with the Radix registry and override specific fields with your shadcn wrappers:

```tsx
import { ComponentTypes } from "@formosaic/core";
import { createRadixFieldRegistry } from "@formosaic/radix";
import ShadcnTextbox from "./form-fields/ShadcnTextbox";
import ShadcnDropdown from "./form-fields/ShadcnDropdown";

function createShadcnFieldRegistry() {
  return {
    ...createRadixFieldRegistry(),
    [ComponentTypes.Textbox]: React.createElement(ShadcnTextbox),
    [ComponentTypes.Dropdown]: React.createElement(ShadcnDropdown),
  };
}
```

## Field Contract for Local Wrappers

When writing local wrappers, ensure they satisfy the `IFieldProps<T>` contract:

1. **readOnly mode**: Return a non-editable display (text span, not a disabled input)
2. **error handling**: Reflect `error` via `aria-invalid` and visual styling
3. **required indicator**: Reflect `required` via `aria-required`
4. **value serialization**: Call `setFieldValue(fieldName, value)` with the correct type
5. **debounce**: Pass `timeout` parameter to `setFieldValue` for text inputs (e.g., `3000` for Textbox)

## Tailwind Styling with Data Attributes

All Formosaic fields emit `data-field-type` and `data-field-state` attributes:

```css
@layer components {
  [data-field-type="Textbox"] input {
    @apply h-10 rounded-md border border-input bg-background px-3 py-2 text-sm;
  }

  [data-field-state="error"] {
    @apply border-destructive;
  }

  [data-field-state="readonly"] {
    @apply opacity-60 cursor-not-allowed;
  }
}
```
