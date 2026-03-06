# AGENTS.md -- Form Engine

## Setup

```bash
npm install --legacy-peer-deps
npm run build          # Build all packages (core, fluent, mui, headless, designer)
npm run test           # Run 515 tests with Vitest
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
```

## Project Structure

Monorepo using npm workspaces. Six packages:

```
packages/
  core/      -- @form-engine/core (React + react-hook-form, NO UI library deps)
  fluent/    -- @form-engine/fluent (Fluent UI v9 field components)
  mui/       -- @form-engine/mui (Material UI field components)
  headless/  -- @form-engine/headless (unstyled semantic HTML field components)
  designer/  -- @form-engine/designer (visual drag-and-drop form builder)
  examples/  -- @form-engine/examples (3 example apps: login+MFA, checkout wizard, data entry)
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
e2e/                           -- Playwright E2E tests (54 tests, 7 specs)
benchmarks/                    -- Performance benchmark suite (vitest bench)
stories/                       -- Storybook stories (64 stories + MDX docs)
```

Build output per package: `dist/index.js` (CJS), `dist/index.mjs` (ESM), `dist/index.d.ts` (types). Built with tsup.

**Per-package agent docs:**
- [packages/core/AGENTS.md](./packages/core/AGENTS.md) -- Core engine architecture, constraints, key files
- [packages/fluent/AGENTS.md](./packages/fluent/AGENTS.md) -- Fluent UI adapter patterns
- [packages/mui/AGENTS.md](./packages/mui/AGENTS.md) -- MUI adapter patterns
- [packages/headless/AGENTS.md](./packages/headless/AGENTS.md) -- Headless adapter patterns
- [packages/designer/AGENTS.md](./packages/designer/AGENTS.md) -- Visual form designer architecture

## Code Style

- Core components: `FormEngine`, `FormFields`, `RenderField`, `FieldWrapper`, `WizardForm`, `FieldArray`
- Adapter field components: `Textbox`, `Dropdown`, `Toggle`, etc.
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

515 tests using Vitest across 25 test files. 54 Playwright E2E tests across 7 specs. Coverage targets met on all core helpers (80%+, many at 100%).

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

All packages should build cleanly and all 515 tests should pass.

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Single `main` branch
- Per-package tags for publishing: `core-v2.0.1`, `fluent-v2.0.1`, `mui-v2.0.1`, `headless-v1.0.0`, `designer-v1.0.0`
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
