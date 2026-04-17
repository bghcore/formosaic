# AGENTS.md -- Formosaic

## Setup

```bash
npm install --legacy-peer-deps
npm run build          # Build all packages
npm run test           # Run 6,766 tests with Vitest
npm run test:coverage  # Run tests with coverage report
npm run test:e2e       # Run 66 Playwright E2E tests
npm run bench          # Run performance benchmarks
npm run storybook      # Start Storybook dev server
npm run build-storybook # Build static Storybook
npm run clean          # Remove all dist/ directories
```

The MDX documentation under `docs/` is published to https://formosaic.com from a separate deployment pipeline; there is no in-repo docs dev server script.

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

Monorepo using npm workspaces. Thirteen packages:

```
packages/
  core/      -- @formosaic/core (React + react-hook-form, NO UI library deps)
  fluent/    -- @formosaic/fluent (Fluent UI v9 field components, 27 types)
  mui/       -- @formosaic/mui (Material UI field components, 27 types)
  headless/  -- @formosaic/headless (unstyled semantic HTML, 27 types)
  antd/      -- @formosaic/antd (Ant Design v5 field components, 27 types)
  chakra/    -- @formosaic/chakra (Chakra UI v3 field components, 27 types)
  mantine/   -- @formosaic/mantine (Mantine v7 field components, 27 types)
  atlaskit/  -- @formosaic/atlaskit (Atlassian Design System, 27 types)
  base-web/  -- @formosaic/base-web (Uber Base Web, 27 types)
  heroui/    -- @formosaic/heroui (HeroUI, 27 types)
  radix/     -- @formosaic/radix (Radix UI primitives, 27 types, unstyled)
  react-aria/ -- @formosaic/react-aria (React Aria Components, 27 types)
  examples/  -- @formosaic/examples (6 example apps)
docs/                          -- MDX documentation + internal planning notes
  tier1-baseline-report.md    -- Tier 1 stabilization assessment
  tier1-patterns.md           -- Implementation patterns for Tier 2
  tier2-handoff.md            -- Tier 2 planning (feasibility, waves, go/no-go)
  guide/
    getting-started.mdx       -- Quick start and setup
    comparison.mdx            -- Comparison vs RJSF, TanStack Form, Formik, etc.
    migrating.mdx             -- Migration from @form-eng/* to @formosaic/*
    rules-engine.mdx          -- Rules engine architecture and lifecycle
    condition-operators.mdx   -- All 20 condition operators
    expression-syntax.mdx     -- $values, $fn, $parent expressions
    validation.mdx            -- Built-in and custom validators
    value-functions.mdx       -- Value function registry
    field-types.mdx           -- All 27 field types
    field-config.mdx          -- IFieldConfig v2 reference
    analytics.mdx             -- Analytics and telemetry integration
    i18n.mdx                  -- Internationalization guide
    ssr.mdx                   -- SSR / Next.js guide
    debugging-rules.mdx       -- Rules engine debugging
    performance.mdx           -- Performance debugging with DevTools
    accessibility.mdx         -- WCAG 2.1 AA, ARIA, keyboard
    date-policy.mdx           -- ISO 8601 date handling policy
  adapters/
    choosing.mdx              -- Adapter recommendation guide
    creating.mdx              -- Building custom UI adapters
    architecture.mdx          -- Adapter classification and architecture
    parity-matrix.mdx         -- Field implementation matrix across all adapters
    field-contracts.mdx       -- Canonical field behavior contracts
    divergence-register.mdx   -- Cross-adapter divergence register (12 entries)
    shadcn.mdx                -- shadcn/ui integration guide
  api/
    field-config.mdx          -- Field config API reference
    stability.mdx             -- Public API stability classification
e2e/                           -- Playwright E2E tests (66 tests, 7 specs)
benchmarks/                    -- Performance benchmark suite (vitest bench)
stories/                       -- Storybook stories (151 story exports across 49 files; currently Fluent UI only)
```

The published documentation site at https://formosaic.com is built from the MDX files under `docs/` by a separate deployment pipeline (not wired to this repo's package.json).

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

## Code Style

- Core components: `Formosaic`, `FormFields`, `RenderField`, `FieldWrapper`, `WizardForm`, `FieldArray`
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

6,766 tests using Vitest across 68 test files. 66 Playwright E2E tests across 7 specs. 151 Storybook story exports across 49 files (Fluent UI adapter only today).

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

All packages should build cleanly and all 6,766 tests should pass.

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Single `main` branch
- Per-package tags for publishing: `core-v1.0.0`, `fluent-v1.0.0`, `mui-v1.0.0`, `headless-v1.0.0`, `antd-v1.0.0`, `chakra-v1.0.0`, `mantine-v1.0.0`, `atlaskit-v1.0.0`, `base-web-v1.0.0`, `heroui-v1.0.0`, `radix-v1.0.0`, `react-aria-v1.0.0`
- Unified tag for all packages: `v1.0.0`
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
