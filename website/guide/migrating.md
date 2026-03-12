---
title: Migrating from @form-eng
---

# Migrating to Formosaic

The library previously published as `@form-eng/*` has been rebranded to **Formosaic** (`@formosaic/*`). This guide covers how to update your project.

## Why the rename?

The old name "form-engine" was generic and conflicted with [FormEngine.io](https://formengine.io/), an unrelated commercial product. **Formosaic** is a distinctive name that avoids confusion and better represents the library's composable, adapter-based architecture.

## What changed

- **npm scope**: `@form-eng/*` -> `@formosaic/*`
- **GitHub repo**: `bghcore/form-engine` -> `bghcore/formosaic`
- **Product name**: "Form Engine" / "form-engine" -> "Formosaic"

No APIs, types, components, or behavior changed. This is a name-only migration.

## Package mapping

| Old package | New package |
|-------------|-------------|
| `@form-eng/core` | `@formosaic/core` |
| `@form-eng/fluent` | `@formosaic/fluent` |
| `@form-eng/mui` | `@formosaic/mui` |
| `@form-eng/headless` | `@formosaic/headless` |
| `@form-eng/antd` | `@formosaic/antd` |
| `@form-eng/chakra` | `@formosaic/chakra` |
| `@form-eng/mantine` | `@formosaic/mantine` |
| `@form-eng/atlaskit` | `@formosaic/atlaskit` |
| `@form-eng/base-web` | `@formosaic/base-web` |
| `@form-eng/heroui` | `@formosaic/heroui` |
| `@form-eng/radix` | `@formosaic/radix` |
| `@form-eng/react-aria` | `@formosaic/react-aria` |


Subpath exports are unchanged:
- `@formosaic/core/adapter-utils`
- `@formosaic/core/testing`

## How to upgrade

### 1. Update package.json

Replace the old scope with the new scope in your `dependencies` or `devDependencies`:

```diff
- "@form-eng/core": "^1.0.0",
- "@form-eng/mui": "^1.0.0"
+ "@formosaic/core": "^1.0.0",
+ "@formosaic/mui": "^1.0.0"
```

Then run `npm install`.

### 2. Update imports

Find and replace across your codebase:

```diff
- import { FormEngine, RulesEngineProvider } from "@form-eng/core";
- import { createMuiFieldRegistry } from "@form-eng/mui";
+ import { Formosaic, RulesEngineProvider } from "@formosaic/core";
+ import { createMuiFieldRegistry } from "@formosaic/mui";
```

A simple find-and-replace of `@form-eng/` with `@formosaic/` handles all cases.

### 3. Update subpath imports

```diff
- import { runAdapterContractTests } from "@form-eng/core/testing";
- import { GetFieldDataTestId } from "@form-eng/core/adapter-utils";
+ import { runAdapterContractTests } from "@formosaic/core/testing";
+ import { GetFieldDataTestId } from "@formosaic/core/adapter-utils";
```

### What did NOT change (in 1.0.0)

- All component names (`Formosaic`, `RulesEngineProvider`, `InjectedFieldProvider`, etc.)
- All type names (`IFormConfig`, `IFieldConfig`, `IFieldProps`, etc.)
- All function names (`createFluentFieldRegistry`, `evaluateAllRules`, etc.)
- All CSS class prefixes (`fe-`, `df-`, `ak-`)
- All data attributes (`data-field-type`, `data-field-state`)
- All behavior, validation, rules, and rendering logic
- Version number (1.0.0)

::: tip Note
In v1.1.0, the main form component was renamed from `FormEngine` to `Formosaic` to match the product name. If you are migrating from `@form-eng/*` directly to v1.1.0+, replace `FormEngine` with `Formosaic` in your imports and JSX.
:::

## Old packages

The `@form-eng/*` packages will not receive further updates. Use `@formosaic/*` for all new development.
