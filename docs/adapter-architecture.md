# Adapter Architecture

This document describes the architecture of form-engine adapter packages: how they integrate with core, what contracts they must fulfill, and how to create a new adapter.

## Package Boundary

### @form-eng/core (main export)

The main `@form-eng/core` export provides the form engine, rules engine, providers, types, and all public APIs:

```typescript
import {
  // Components
  FormEngine, FormFields, RenderField, FieldWrapper, WizardForm, FieldArray,
  ConfirmInputsModal, FormErrorBoundary, FormDevTools,

  // Providers
  RulesEngineProvider, UseRulesEngineContext,
  InjectedFieldProvider, UseInjectedFieldContext,

  // Rules Engine
  evaluateAllRules, evaluateAffectedFields, buildDependencyGraph,
  evaluateCondition, topologicalSort,

  // Validation
  registerValidators, getValidator, runValidations, runSyncValidations,

  // Value Functions
  registerValueFunctions, executeValueFunction,

  // Locale
  registerLocale, getLocaleString, resetLocale,

  // Hooks
  useDraftPersistence, useBeforeUnload, useFormAnalytics,

  // Types
  IFormConfig, IFieldConfig, IFieldProps, IRule, ICondition, IOption,
  IRuntimeFieldState, IRuntimeFormState, IWizardConfig,

  // Constants
  ComponentTypes, FormConstants,
} from "@form-eng/core";
```

### @form-eng/core/adapter-utils (subpath export)

Shared utilities that adapter packages import for field rendering. This subpath exists to give adapters a focused import surface without pulling in the entire core:

```typescript
import {
  // Field rendering utilities
  GetFieldDataTestId,   // Generates data-testid attributes
  FieldClassName,       // Appends "error" class on validation error
  getFieldState,        // Returns data-state string (error/required/readonly/disabled)

  // Date/time formatting
  formatDateTime,       // ISO string -> localized display string
  formatDateTimeValue,  // Safe formatDateTime with fallback to String()
  formatDateRange,      // IDateRangeValue -> "start -- end" display string

  // Other formatting
  getFileNames,         // File/File[] -> comma-separated name string
  extractDigits,        // Strip non-digits from string
  formatPhone,          // Digit string -> formatted phone number
  ellipsifyText,        // Truncate with "..."

  // Constants
  MAX_FILE_SIZE_MB_DEFAULT,  // 10 (default file upload limit)
  DocumentLinksStrings,      // Shared strings for DocumentLinks component

  // Config interfaces
  IRatingConfig,        // { max?, allowHalf? }
  IDateRangeConfig,     // { minDate?, maxDate? }
  IDateRangeValue,      // { start, end }
  IDateTimeConfig,      // { minDateTime?, maxDateTime? }
  IFileUploadConfig,    // { multiple?, accept?, maxSizeMb? }
  IPhoneInputConfig,    // { format?: "us" | "international" | "raw" }

  // Utility functions
  convertBooleanToYesOrNoText,  // boolean -> "Yes" / "No"
  isNull,                        // null/undefined check
} from "@form-eng/core/adapter-utils";
```

### @form-eng/core/testing (subpath export)

Contract test infrastructure for validating adapter registries:

```typescript
import {
  runAdapterContractTests,  // Generates vitest suite for a registry
  TIER_1_FIELDS,            // string[] of 13 Tier 1 ComponentTypes values
  ALL_FIELD_TYPES,          // string[] of all 37 ComponentTypes values
} from "@form-eng/core/testing";
```

## Field Component Pattern

### IFieldProps<T> Contract

Every field component receives `IFieldProps<T>` props via `React.cloneElement()`. The generic parameter `T` types the `config` property for field-specific metadata.

```typescript
interface IFieldProps<T = Record<string, unknown>> {
  fieldName?: string;          // Unique field identifier
  entityId?: string;           // Entity ID
  entityType?: string;         // Entity type
  programName?: string;        // Program name
  parentEntityId?: string;     // Parent entity ID
  parentEntityType?: string;   // Parent entity type
  readOnly?: boolean;          // Read-only mode
  required?: boolean;          // Required flag
  error?: FieldError;          // Current validation error
  errorCount?: number;         // Total error count
  saving?: boolean;            // Currently saving
  savePending?: boolean;       // Save pending due to errors
  value?: unknown;             // Current field value
  config?: T;                  // Field-specific config metadata
  options?: IOption[];         // Dropdown/select options
  optionsLoading?: boolean;    // Async options loading
  label?: string;              // Field label
  type?: string;               // Component type string
  description?: string;        // Description text
  placeholder?: string;        // Placeholder text
  helpText?: string;           // Help text
  setFieldValue?: (           // Value setter callback
    fieldName: string,
    fieldValue: unknown,
    skipSave?: boolean,
    timeout?: number
  ) => void;
}
```

### How cloneElement Integration Works

The rendering pipeline in core's `RenderField` component:

1. Looks up the field's `type` string in the injected field registry
2. Gets the pre-created `React.JSX.Element` (e.g., `React.createElement(Textbox)`)
3. Calls `React.cloneElement(element, fieldProps)` to pass `IFieldProps` as props
4. The field component renders using the received props

This means field components are created with no props in the registry and receive all props at render time via cloneElement.

## Registry Factory Pattern

Each adapter exports a factory function that returns a `Record<string, React.JSX.Element>` mapping `ComponentTypes` keys to pre-created field elements:

```typescript
import { ComponentTypes, Dictionary } from "@form-eng/core";
import React from "react";
import Textbox from "./fields/Textbox";
import NumberField from "./fields/Number";
// ... other imports

export function createXxxFieldRegistry(): Dictionary<React.JSX.Element> {
  return {
    [ComponentTypes.Textbox]: React.createElement(Textbox),
    [ComponentTypes.Number]: React.createElement(NumberField),
    [ComponentTypes.Toggle]: React.createElement(Toggle),
    [ComponentTypes.Dropdown]: React.createElement(Dropdown),
    [ComponentTypes.SimpleDropdown]: React.createElement(SimpleDropdown),
    [ComponentTypes.MultiSelect]: React.createElement(MultiSelect),
    [ComponentTypes.DateControl]: React.createElement(DateControl),
    [ComponentTypes.Slider]: React.createElement(Slider),
    [ComponentTypes.RadioGroup]: React.createElement(RadioGroup),
    [ComponentTypes.CheckboxGroup]: React.createElement(CheckboxGroup),
    [ComponentTypes.Textarea]: React.createElement(Textarea),
    [ComponentTypes.Fragment]: React.createElement(DynamicFragment),
    [ComponentTypes.ReadOnly]: React.createElement(ReadOnly),
  };
}
```

**Naming convention:** `createXxxFieldRegistry()` where `Xxx` is the adapter name (e.g., `createAntdFieldRegistry`, `createChakraFieldRegistry`, `createMantineFieldRegistry`).

**Return type:** `Dictionary<React.JSX.Element>` (alias for `Record<string, React.JSX.Element>`).

**Usage by consumers:**

```tsx
import { FormEngine, RulesEngineProvider, InjectedFieldProvider } from "@form-eng/core";
import { createXxxFieldRegistry } from "@form-eng/xxx";

const fields = createXxxFieldRegistry();

function App() {
  return (
    <RulesEngineProvider>
      <InjectedFieldProvider fields={fields}>
        <FormEngine formConfig={config} entityData={data} onSave={save} />
      </InjectedFieldProvider>
    </RulesEngineProvider>
  );
}
```

## Contract Test Requirements

Every adapter package should include contract tests that validate registry completeness and basic rendering. Use the shared test infrastructure from `@form-eng/core/testing`:

```typescript
// packages/xxx/src/__tests__/adapter-contract.test.tsx
import { runAdapterContractTests, TIER_1_FIELDS } from "@form-eng/core/testing";
import { createXxxFieldRegistry } from "../registry";

runAdapterContractTests(createXxxFieldRegistry, {
  suiteName: "xxx",
  onlyTypes: [...TIER_1_FIELDS],  // For Tier 1 adapters
  // Or omit onlyTypes for full adapters (fluent, mui, headless)
});
```

The contract tests verify:

1. **Registry coverage** -- every expected type key has a valid React element
2. **Minimal rendering** -- each field renders without errors given minimal props
3. **Read-only rendering** -- each field renders in read-only mode without errors

## Adapter Classification

| Adapter | Classification | Description |
|---------|---------------|-------------|
| fluent | Native | All fields use Fluent UI v9 components. Full Tier 1 + Tier 2 support. |
| mui | Native | All fields use MUI v5/v6 components. Full Tier 1 + Tier 2 support. |
| headless | Reference | Semantic HTML -- canonical reference implementation. Full Tier 1 + Tier 2 support. |
| antd | Native | All Tier 1 fields use Ant Design v5 components. DateControl uses dayjs. |
| mantine | Native | All Tier 1 fields use Mantine v7 components. Number field has null divergence. |
| chakra | Hybrid | Some Chakra UI v3 native, some semantic HTML fallbacks (Ark UI DTS issues). |
| base-web | Hybrid | Select/Slider/Checkbox use baseui components, rest is semantic HTML. |
| atlaskit | Compatibility | Semantic HTML structured for Atlassian Design System ecosystem. |
| heroui | Compatibility | Semantic HTML structured for HeroUI (NextUI) ecosystem. DateControl uses native HTML. |

## Package Structure Template

For creating a new adapter package:

```
packages/xxx/
  package.json
  tsup.config.ts
  README.md
  src/
    index.ts              -- Barrel exports (fields, registry, helpers, components)
    registry.ts           -- createXxxFieldRegistry() factory
    helpers.ts            -- Re-exports from @form-eng/core/adapter-utils
    components/
      ReadOnlyText.tsx    -- Shared read-only text display
      StatusMessage.tsx   -- Save/error status indicator
      FormLoading.tsx     -- Loading skeleton/shimmer
    fields/
      Textbox.tsx
      Number.tsx
      Toggle.tsx
      Dropdown.tsx
      SimpleDropdown.tsx
      MultiSelect.tsx
      DateControl.tsx
      Slider.tsx
      RadioGroup.tsx
      CheckboxGroup.tsx
      Textarea.tsx
      DynamicFragment.tsx
      readonly/
        ReadOnly.tsx
    __tests__/
      adapter-contract.test.tsx
```

### package.json Template

```json
{
  "name": "@form-eng/xxx",
  "version": "1.0.0",
  "description": "Xxx UI field components for @form-eng/core",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "files": ["dist", "README.md"],
  "license": "MIT",
  "sideEffects": false,
  "scripts": {
    "build": "tsup",
    "clean": "rimraf dist"
  },
  "peerDependencies": {
    "@form-eng/core": "^1.0.0",
    "react": "^18.0.0 || ^19.0.0",
    "react-hook-form": "^7.0.0",
    "xxx-ui-library": "^X.0.0"
  },
  "devDependencies": {
    "@form-eng/core": "workspace:*",
    "@types/react": "^19.0.0",
    "react": "^19.0.0",
    "react-hook-form": "^7.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

### tsup.config.ts Template

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  clean: true,
  external: ["react", "react-dom", "react-hook-form", "@form-eng/core"],
});
```

### helpers.ts Template

Re-export utilities from core so that field components import from a local path:

```typescript
// Re-export shared field utilities from core
export {
  GetFieldDataTestId,
  FieldClassName,
  getFieldState,
  formatDateTime,
  DocumentLinksStrings,
} from "@form-eng/core/adapter-utils";
```

### index.ts Template

```typescript
// Field components
export { default as Textbox } from "./fields/Textbox";
export { default as Number } from "./fields/Number";
export { default as Toggle } from "./fields/Toggle";
export { default as Dropdown } from "./fields/Dropdown";
export { default as SimpleDropdown } from "./fields/SimpleDropdown";
export { default as MultiSelect } from "./fields/MultiSelect";
export { default as DateControl } from "./fields/DateControl";
export { default as Slider } from "./fields/Slider";
export { default as RadioGroup } from "./fields/RadioGroup";
export { default as CheckboxGroup } from "./fields/CheckboxGroup";
export { default as Textarea } from "./fields/Textarea";
export { default as DynamicFragment } from "./fields/DynamicFragment";

// Read-only fields
export { default as ReadOnly } from "./fields/readonly/ReadOnly";

// Supporting components
export { ReadOnlyText } from "./components/ReadOnlyText";
export type { IReadOnlyFieldProps } from "./components/ReadOnlyText";
export { StatusMessage } from "./components/StatusMessage";
export { FormLoading } from "./components/FormLoading";

// Registry
export { createXxxFieldRegistry } from "./registry";

// Helpers
export { GetFieldDataTestId, FieldClassName, getFieldState, formatDateTime, DocumentLinksStrings } from "./helpers";
```

## Adapter Helpers Pattern

Adapter `helpers.ts` files re-export utilities from `@form-eng/core/adapter-utils` (or from `@form-eng/core` directly for packages that predate the subpath export). This provides:

1. **Single import source** for field components within the adapter
2. **No utility duplication** across adapter packages
3. **Consistent API** regardless of which adapter is used

Field components within an adapter import from the local `../helpers`:

```typescript
// Inside packages/xxx/src/fields/Textbox.tsx
import { GetFieldDataTestId, getFieldState } from "../helpers";
```

This indirection allows the adapter to add adapter-specific helpers alongside the core re-exports if needed.
