---
title: Getting Started
---

# Getting Started

Formosaic is a React library for rendering complex, configuration-driven forms with a built-in rules engine. Define your forms as a single `IFormConfig` JSON object and the library handles rendering, validation, auto-save, and field interactions automatically.

## Installation

Install the core package plus one UI adapter:

```bash
# With Fluent UI
npm install @formosaic/core @formosaic/fluent

# Or with MUI
npm install @formosaic/core @formosaic/mui @mui/material @emotion/react @emotion/styled

# Or headless (no UI framework)
npm install @formosaic/core @formosaic/headless

# Or with Ant Design
npm install @formosaic/core @formosaic/antd antd dayjs

# Or with Mantine
npm install @formosaic/core @formosaic/mantine @mantine/core @mantine/hooks

# Or with Chakra UI
npm install @formosaic/core @formosaic/chakra @chakra-ui/react

# Or with Radix UI (unstyled primitives, great for Tailwind/shadcn)
npm install @formosaic/core @formosaic/radix @radix-ui/react-checkbox @radix-ui/react-radio-group @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-switch

# Or with React Aria (accessibility-first)
npm install @formosaic/core @formosaic/react-aria react-aria-components
```

## Basic Example

```tsx
import {
  RulesEngineProvider,
  InjectedFieldProvider,
  Formosaic,
} from "@formosaic/core";
import { createFluentFieldRegistry } from "@formosaic/fluent";
// Or: import { createMuiFieldRegistry } from "@formosaic/mui";
// Or: import { createHeadlessFieldRegistry } from "@formosaic/headless";

const formConfig = {
  version: 2 as const,
  fields: {
    name: { type: "Textbox", label: "Name", required: true },
    status: {
      type: "Dropdown",
      label: "Status",
      options: [
        { value: "Active", label: "Active" },
        { value: "Inactive", label: "Inactive" },
      ],
    },
    notes: { type: "Textarea", label: "Notes" },
  },
  fieldOrder: ["name", "status", "notes"],
};

function App() {
  return (
    <RulesEngineProvider>
      <InjectedFieldProvider injectedFields={createFluentFieldRegistry()}>
        <Formosaic
          configName="myForm"
          formConfig={formConfig}
          defaultValues={{ name: "", status: "Active", notes: "" }}
          saveData={async (data) => {
            console.log("Saving:", data);
            return data;
          }}
        />
      </InjectedFieldProvider>
    </RulesEngineProvider>
  );
}
```

## Adding Business Rules

Rules are declarative -- defined as `IRule[]` on each field config. When a field value changes, the engine re-evaluates affected fields and applies effects automatically:

```tsx
const formConfig = {
  version: 2 as const,
  fields: {
    type: {
      type: "Dropdown",
      label: "Type",
      options: [
        { value: "bug", label: "Bug" },
        { value: "feature", label: "Feature" },
      ],
      rules: [
        {
          when: { field: "type", operator: "equals", value: "bug" },
          then: { severity: { required: true, hidden: false } },
          else: { severity: { hidden: true } },
          priority: 1,
        },
      ],
    },
    severity: {
      type: "Dropdown",
      label: "Severity",
      hidden: true,
      options: [
        { value: "low", label: "Low" },
        { value: "high", label: "High" },
      ],
    },
  },
  fieldOrder: ["type", "severity"],
};
```

When the user selects "Bug", the severity field appears and becomes required. When they select "Feature", it hides.

## Swapping UI Libraries

Change your entire form's appearance by swapping one import:

```tsx
// Fluent UI
import { createFluentFieldRegistry } from "@formosaic/fluent";

// Material UI
import { createMuiFieldRegistry } from "@formosaic/mui";

// Headless (semantic HTML, BYO styling)
import { createHeadlessFieldRegistry } from "@formosaic/headless";

// Ant Design
import { createAntdFieldRegistry } from "@formosaic/antd";

// Mantine
import { createMantineFieldRegistry } from "@formosaic/mantine";

// Radix (unstyled primitives)
import { createRadixFieldRegistry } from "@formosaic/radix";

// React Aria (accessibility-first)
import { createReactAriaFieldRegistry } from "@formosaic/react-aria";
```

Pass the registry to `InjectedFieldProvider` and all form fields render with that library's components.

## Next Steps

- [Rules Engine](/guide/rules-engine) -- Learn how declarative rules work
- [Condition Operators](/guide/condition-operators) -- All 20 condition operators
- [Field Types](/guide/field-types) -- Complete field type reference
- [Choosing an Adapter](/adapters/choosing) -- Pick the right UI adapter
- [Validation](/guide/validation) -- Built-in and custom validators
- [Comparison](/guide/comparison) -- How Formosaic compares to alternatives
