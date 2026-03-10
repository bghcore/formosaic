# AGENTS.md -- Form Engine

## Setup

```bash
npm install --legacy-peer-deps
npm run build          # Build all packages
npm run test           # Run 4774 tests with Vitest
npm run test:coverage  # Run tests with coverage report
npm run test:e2e       # Run 54 Playwright E2E tests
npm run bench          # Run performance benchmarks
npm run storybook      # Start Storybook dev server
npm run build-storybook # Build static Storybook
npm run clean          # Remove all dist/ directories
```

Build individual packages:

```bash
npm run build:core     # packages/core only
npm run build:fluent   # packages/fluent only
npm run build:mui      # packages/mui only
npm run build:headless # packages/headless only
npm run build:antd     # packages/antd only
npm run build:chakra   # packages/chakra only
npm run build:mantine  # packages/mantine only
npm run build:atlaskit # packages/atlaskit only
npm run build:base-web # packages/base-web only
npm run build:heroui   # packages/heroui only
npm run build:radix    # packages/radix only
npm run build:react-aria # packages/react-aria only
```

## Project Structure

Monorepo using npm workspaces. Fourteen packages:

```
packages/
  core/      -- @form-eng/core (React + react-hook-form, NO UI library deps)
  fluent/    -- @form-eng/fluent (Fluent UI v9 field components, 28 types)
  mui/       -- @form-eng/mui (Material UI field components, 28 types)
  headless/  -- @form-eng/headless (unstyled semantic HTML, 28 types)
  antd/      -- @form-eng/antd (Ant Design v5 field components, 13 Tier 1 types)
  chakra/    -- @form-eng/chakra (Chakra UI v3 field components, 13 Tier 1 types)
  mantine/   -- @form-eng/mantine (Mantine v7 field components, 13 Tier 1 types)
  atlaskit/  -- @form-eng/atlaskit (Atlassian Design System, 13 Tier 1 types)
  base-web/  -- @form-eng/base-web (Uber Base Web, 13 Tier 1 types)
  heroui/    -- @form-eng/heroui (HeroUI, 13 Tier 1 types)
  radix/     -- @form-eng/radix (Radix UI primitives, 13 Tier 1 types, unstyled)
  react-aria/ -- @form-eng/react-aria (React Aria Components, 13 Tier 1 types)
  designer/  -- @form-eng/designer (visual drag-and-drop form builder)
  examples/  -- @form-eng/examples (3 example apps)
docs/
  creating-an-adapter.md      -- Guide for building custom UI library adapters
  ACCESSIBILITY.md            -- Accessibility guide (ARIA, keyboard, screen readers)
  ssr-guide.md                -- Server-side rendering guide
  analytics-telemetry.md      -- Analytics and telemetry integration guide
  performance-debugging.md    -- Performance debugging with DevTools
  field-config-reference.md   -- IFieldConfig v2 reference
  expression-syntax.md        -- $values, $fn, $parent expression syntax
  validators-reference.md     -- Built-in and custom validators
  value-functions-reference.md -- Value function registry reference
  i18n-reference.md           -- Internationalization guide
  debugging-rules.md          -- Rules engine debugging guide
  condition-operators.md      -- Condition operator reference
  new-field-types.md          -- New field type guide
  rules-engine.md             -- Rules engine architecture
  adapter-architecture.md     -- Adapter classification and architecture
  canonical-field-contracts.md -- Canonical field behavior contracts
  field-capability-matrix.md  -- Per-field, per-adapter parity matrix
  api-stability.md            -- Public API stability classification
  pre-expansion-summary.md    -- Pre-Tier-2 expansion readiness assessment
  divergence-register.md      -- Cross-adapter divergence register (12 entries)
  choosing-an-adapter.md      -- Adapter recommendation guide
  tier2-feasibility-matrix.md -- Tier 2 field feasibility matrix
  tier2-handoff.md            -- Pre-Tier-2 handoff document
  shadcn-integration.md       -- shadcn/ui integration guide
  date-policy.md              -- Date handling and serialization policy
e2e/                           -- Playwright E2E tests (54 tests, 7 specs)
benchmarks/                    -- Performance benchmark suite (vitest bench)
stories/                       -- Storybook stories (67+ stories + MDX docs)
```

Build output per package: `dist/index.js` (CJS), `dist/index.mjs` (ESM), `dist/index.d.ts` (types). Built with tsup.

**Per-package agent docs:**
- [packages/core/AGENTS.md](./packages/core/AGENTS.md) -- Core engine architecture, constraints, key files
- [packages/fluent/AGENTS.md](./packages/fluent/AGENTS.md) -- Fluent UI adapter patterns
- [packages/mui/AGENTS.md](./packages/mui/AGENTS.md) -- MUI adapter patterns
- [packages/headless/AGENTS.md](./packages/headless/AGENTS.md) -- Headless adapter patterns
- [packages/antd/AGENTS.md](./packages/antd/AGENTS.md) -- Ant Design adapter patterns
- [packages/chakra/AGENTS.md](./packages/chakra/AGENTS.md) -- Chakra UI adapter patterns
- [packages/mantine/AGENTS.md](./packages/mantine/AGENTS.md) -- Mantine adapter patterns
- [packages/atlaskit/AGENTS.md](./packages/atlaskit/AGENTS.md) -- Atlassian adapter patterns
- [packages/base-web/AGENTS.md](./packages/base-web/AGENTS.md) -- Base Web adapter patterns
- [packages/heroui/AGENTS.md](./packages/heroui/AGENTS.md) -- HeroUI adapter patterns
- [packages/radix/AGENTS.md](./packages/radix/AGENTS.md) -- Radix UI adapter patterns
- [packages/react-aria/AGENTS.md](./packages/react-aria/AGENTS.md) -- React Aria adapter patterns
- [packages/designer/AGENTS.md](./packages/designer/AGENTS.md) -- Visual form designer architecture

## Code Style

- Core components: `FormEngine`, `FormFields`, `RenderField`, `FieldWrapper`, `WizardForm`, `FieldArray`
- Adapter field components: `Textbox`, `Dropdown`, `Toggle`, etc. (no `Hook*` prefix)
- Read-only variants in `fields/readonly/`: `ReadOnly`, `ReadOnlyArray`, etc.
- Interfaces use `I` prefix: `IFieldConfig`, `IRuntimeFieldState`, `IFieldProps`
- Providers export both the component and a `Use*Context` hook
- Use `React.JSX.Element` not bare `JSX.Element`
- camelCase for variables/functions, PascalCase for components/types
- Field components receive `IFieldProps<T>` via `React.cloneElement`
- Rules engine actions follow Redux action pattern (type enum + payload)
- No lodash -- use local utilities from `utils/index.ts`
- Use `structuredClone` for deep copies (not `JSON.parse(JSON.stringify(...))`)
- All user-facing strings resolve through `LocaleRegistry` for i18n support
- Options use `{ value, label }` (not `{ key, text }`)
- Field config uses `type` (not `component`), `options` (not `dropdownOptions`), `config` (not `meta`), `validate` (not `validations`)

## Testing

4774 tests using Vitest across 55 test files. 54 Playwright E2E tests across 7 specs. 67+ Storybook stories.

```bash
npm run test             # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # E2E tests (Playwright)
npm run bench            # Performance benchmarks
```

Test files live in `packages/core/src/__tests__/` with shared fixtures in `__fixtures__/`.

## Build Verification

After any code change, verify:

```bash
npm run build && npm run test
```

All packages should build cleanly and all 4774 tests should pass.

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Single `main` branch
- Per-package tags for publishing: `core-v1.5.2`, `fluent-v1.5.2`, `mui-v1.5.2`, `headless-v1.5.2`, `antd-v1.5.2`, `chakra-v1.5.2`, `mantine-v1.5.2`, `atlaskit-v1.5.2`, `base-web-v1.5.2`, `heroui-v1.5.2`, `radix-v1.5.2`, `react-aria-v1.5.2`, `designer-v1.5.2`
- Unified tag for all packages: `v1.5.2`
- Run `npm run build && npm run test` before committing

## Boundaries

### Always OK

- Reading any file in the repo
- Running `npm run build`, `npm run test`, `npm run clean`
- Editing source files in `packages/*/src/`
- Creating or editing tests
- Updating documentation

### Ask First

- Adding new npm dependencies
- Changing `tsconfig` or `tsup.config.ts` settings
- Modifying `package.json` exports, peerDependencies, or version numbers
- Renaming or removing public API exports
- Structural changes (new packages, moving files between packages)
- Running `npm publish` or creating release tags

### Never

- Running `rm -rf` on anything outside `dist/` directories
- Force-pushing to `main`
- Committing `.env` files or secrets
- Adding UI library dependencies (`@fluentui/*`, `@mui/*`) to the core package
