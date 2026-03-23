---
title: Adapter Architecture
---

# Adapter Architecture

This document describes the architecture of Formosaic adapter packages: how they integrate with core, what contracts they must fulfill, and the classification system.

## Package Boundary

### @formosaic/core (main export)

The main export provides the form engine, rules engine, providers, types, and all public APIs.

### @formosaic/core/adapter-utils (subpath export)

Shared utilities for field rendering:

```typescript
import {
  GetFieldDataTestId,
  FieldClassName,
  getFieldState,
  formatDateTime,
  convertBooleanToYesOrNoText,
  isNull,
} from "@formosaic/core/adapter-utils";
```

### @formosaic/core/testing (subpath export)

Contract test infrastructure:

```typescript
import {
  runAdapterContractTests,
  TIER_1_FIELDS,
  ALL_FIELD_TYPES,
} from "@formosaic/core/testing";
```

## How cloneElement Integration Works

1. `RenderField` looks up the field's `type` string in the injected field registry
2. Gets the pre-created `React.JSX.Element`
3. Calls `React.cloneElement(element, fieldProps)` to pass `IFieldProps` as props
4. The field component renders using the received props

## Registry Factory Pattern

Each adapter exports a factory function:

```typescript
export function createXxxFieldRegistry(): Dictionary<React.JSX.Element> {
  return {
    [ComponentTypes.Textbox]: React.createElement(Textbox),
    [ComponentTypes.Number]: React.createElement(NumberField),
    // ...
  };
}
```

**Naming convention:** `createXxxFieldRegistry()` where `Xxx` is the adapter name.

## Adapter Classification

| Class | Definition |
|-------|-----------|
| **Native** | All Tier 1 fields use the UI library's own components |
| **Primitives-first** | Uses UI primitive library components without styling |
| **Reference** | Pure semantic HTML canonical reference |
| **Hybrid** | Mix of native components and semantic HTML fallbacks |
| **Compatibility** | All fields use semantic HTML, named for ecosystem compatibility |

### Classification Table

| Adapter | Class | Native Fields | Production Ready |
|---------|-------|--------------|-----------------|
| fluent | Native | 13/13 | Yes |
| mui | Native | 13/13 | Yes |
| headless | Reference | 13/13 (semantic HTML) | Yes |
| antd | Native | 13/13 | Yes |
| mantine | Native | 13/13 | Yes |
| chakra | Hybrid | 7/13 | Yes |
| base-web | Hybrid | 3/13 | Conditional |
| atlaskit | Compatibility | 0/13 | Conditional |
| heroui | Compatibility | 0/13 | Conditional |
| radix | Primitives-first | 7/13 | Yes |
| react-aria | Primitives-first | 10/13 | Yes |

## Provider Wrapper Requirements

| Adapter | Wrapper Required | Provider |
|---------|-----------------|----------|
| fluent | No | -- |
| mui | No | -- |
| headless | No | -- |
| antd | No | -- |
| chakra | **Yes** | `<ChakraProvider value={defaultSystem}>` |
| mantine | **Yes** | `<MantineProvider>` + matchMedia/ResizeObserver mocks |
| atlaskit | No | -- |
| base-web | No | -- |
| heroui | No | -- |
| radix | No | -- |
| react-aria | No | -- |

## Contract Test Requirements

Every adapter should include contract tests:

```typescript
import { runAdapterContractTests } from "@formosaic/core/testing";
import { createXxxFieldRegistry } from "../registry";

runAdapterContractTests(createXxxFieldRegistry, {
  suiteName: "xxx",
});
```

The contract tests verify:
1. **Registry coverage** -- every expected type key has a valid React element
2. **Minimal rendering** -- each field renders without errors
3. **Read-only rendering** -- each field renders in read-only mode
