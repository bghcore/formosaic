# Contributing to Formosaic

Thank you for your interest in contributing to Formosaic. This guide covers everything you need to get started, from setting up your local environment to submitting a pull request.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Running Storybook](#running-storybook)
- [Code Style and Conventions](#code-style-and-conventions)
- [How the Adapter System Works](#how-the-adapter-system-works)
- [Adding a New Field Type](#adding-a-new-field-type)
- [Commit Message Conventions](#commit-message-conventions)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)
- [Security Issues](#security-issues)
- [Getting Help](#getting-help)

## Code of Conduct

This project follows a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold it. Please report unacceptable behavior through the channels described there.

## Prerequisites

- **Node.js 20 or later** -- [nodejs.org](https://nodejs.org/)
- **npm** (ships with Node.js) -- the monorepo uses npm workspaces, not yarn or pnpm
- **Git** -- [git-scm.com](https://git-scm.com/)

Optional, for end-to-end testing:

- **Playwright browsers** -- installed automatically by `npx playwright install` (see [Running Tests](#running-tests))

## Local Development Setup

1. **Fork the repository** on GitHub: [bghcore/formosaic](https://github.com/bghcore/formosaic)

2. **Clone your fork:**

   ```bash
   git clone https://github.com/<your-username>/formosaic.git
   cd formosaic
   ```

3. **Install dependencies:**

   ```bash
   npm install --legacy-peer-deps
   ```

   The `--legacy-peer-deps` flag is required because the monorepo supports multiple UI framework adapters with overlapping peer dependency ranges.

4. **Build all packages:**

   ```bash
   npm run build
   ```

   Core must build first (adapter packages depend on it). The build script handles ordering automatically.

5. **Verify everything works:**

   ```bash
   npm run test
   ```

   You should see all 6,145 tests pass.

You can also build individual packages during development:

```bash
npm run build:core       # Build core only
npm run build:fluent     # Build Fluent UI adapter only
npm run build:mui        # Build MUI adapter only
npm run build:headless   # Build headless adapter only
npm run build:antd       # Build Ant Design adapter only
npm run build:chakra     # Build Chakra UI adapter only
npm run build:mantine    # Build Mantine adapter only
npm run build:atlaskit   # Build Atlaskit adapter only
npm run build:base-web   # Build Base Web adapter only
npm run build:heroui     # Build HeroUI adapter only
npm run build:radix      # Build Radix adapter only
npm run build:react-aria # Build React Aria adapter only
```

## Project Structure

```
packages/
  core/        @formosaic/core       -- Rules engine, form orchestration, validation (no UI dependency)
  fluent/      @formosaic/fluent     -- Fluent UI v9 adapter (27 field types)
  mui/         @formosaic/mui        -- Material UI adapter (27 field types)
  headless/    @formosaic/headless   -- Semantic HTML adapter (27 field types)
  antd/        @formosaic/antd       -- Ant Design v5 adapter (27 field types)
  chakra/      @formosaic/chakra     -- Chakra UI v3 adapter (27 field types)
  mantine/     @formosaic/mantine    -- Mantine v7 adapter (27 field types)
  atlaskit/    @formosaic/atlaskit   -- Atlassian Design System adapter (27 field types)
  base-web/    @formosaic/base-web   -- Uber Base Web adapter (27 field types)
  heroui/      @formosaic/heroui     -- HeroUI adapter (27 field types)
  radix/       @formosaic/radix      -- Radix UI primitives adapter (27 field types)
  react-aria/  @formosaic/react-aria -- React Aria Components adapter (27 field types)
  examples/    @formosaic/examples   -- 6 example apps (login+MFA, checkout wizard, data entry, patient-intake, job-application, expense-report)
e2e/           Playwright end-to-end tests
benchmarks/    Vitest benchmarks for rules engine performance
stories/       Storybook stories for visual documentation
docs/          MDX documentation (published at https://formosaic.com) plus internal planning notes (tier1-baseline-report, tier1-patterns, tier2-handoff)
```

Each adapter package follows the same internal structure:

```
src/
  index.ts         -- Public exports
  registry.ts      -- createXxxFieldRegistry() function
  helpers.ts       -- Adapter-specific utilities
  fields/          -- Editable field components (Textbox, Dropdown, etc.)
  fields/readonly/ -- Read-only field components
  components/      -- Shared components (ReadOnlyText, StatusMessage, FormLoading)
  __tests__/       -- Contract tests
```

## Running Tests

### Unit and Integration Tests

```bash
# Run all tests (vitest, 6,145 tests across 65 files)
npm run test

# Watch mode -- re-runs on file changes
npm run test:watch

# With coverage report
npm run test:coverage
```

To run tests for a single package:

```bash
npx vitest run --project core
npx vitest run --project fluent
npx vitest run --project mui
```

### End-to-End Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests (66 tests across 7 specs)
npm run test:e2e
```

### Performance Benchmarks

```bash
npm run bench
```

### Contract Tests

Every adapter package has a `__tests__/contract.test.ts` file that verifies the adapter meets the core field contract. If you modify an adapter, make sure its contract tests pass.

## Running Storybook

Storybook provides visual documentation for all field components across adapters:

```bash
# Start Storybook dev server on port 6006
npm run storybook

# Build a static Storybook site
npm run build-storybook
```

The deployed Storybook is available at [formosaic.com/storybook/](https://formosaic.com/storybook/).

## Code Style and Conventions

### TypeScript

- **Strict mode is enabled.** All code must pass `strict: true` TypeScript compilation.
- Interface names use the `I` prefix: `IFieldConfig`, `IRuntimeFieldState`, `IOption`.
- Use `type` for unions and intersections, `interface` for object shapes.

### Field Component Props

All field components receive `IFieldProps<T>` via `React.cloneElement`. This is the standard contract between core and adapter packages. See the [canonical field contracts](https://formosaic.com/adapters/field-contracts) for the full specification.

### Naming Conventions

- Field components use plain names: `Textbox`, `Dropdown`, `Toggle` (no `Hook` prefix).
- Read-only variants live in `fields/readonly/` and are named `ReadOnly`, `ReadOnlyArray`, etc.
- Options use `{ value, label }` (not `{ key, text }`).
- Field config uses `type` (not `component`), `options` (not `dropdownOptions`), `config` (not `meta`), `validate` (not `validations`).

### General Principles

- Keep changes focused. A bug fix should fix the bug, not refactor surrounding code.
- Do not add unrelated formatting, comment, or import changes to a PR.
- All user-facing strings must go through `LocaleRegistry` for i18n support.
- Providers and context values must be memoized (`useMemo` / `useReducer`).
- Each field is wrapped in `FormErrorBoundary` for crash isolation -- do not remove these.

## How the Adapter System Works

Formosaic separates form logic (the core package) from UI rendering (adapter packages). The core handles form state via react-hook-form, evaluates declarative rules, and delegates rendering to field components registered through a component injection system.

The rendering pipeline:

```
IFormConfig
  -> Formosaic (form state, auto-save)
    -> evaluateAllRules() -> IRuntimeFormState
    -> FormFields (ordered field list)
      -> RenderField (per field, looks up injectedFields[type])
        -> Controller (react-hook-form integration)
          -> FieldWrapper (label, error, status)
            -> React.cloneElement(YourFieldComponent, IFieldProps)
```

An adapter package provides a registry -- a `Record<string, JSX.Element>` mapping field type keys (like `"Textbox"`, `"Dropdown"`) to JSX elements. Consumers pass this registry to `InjectedFieldProvider`, and `RenderField` looks up the correct component at render time.

To create a new adapter, see the [creating an adapter guide](https://formosaic.com/adapters/creating). For implementation patterns to follow, see [docs/tier1-patterns.md](./docs/tier1-patterns.md).

## Adding a New Field Type

If you want to add a new field type (not a new adapter, but a new kind of field across existing adapters):

1. **Define the component type key** in `packages/core/src/constants.ts` (e.g., `"MyNewField"`).

2. **Define the field contract** -- document the value type, empty semantics, serialization, readOnly behavior, and config shape. Follow the format in the [canonical field contracts](https://formosaic.com/adapters/field-contracts).

3. **Implement in at least one adapter** -- start with `headless` since it has no UI framework dependency. The component must accept `IFieldProps<T>` and handle:
   - Editable mode (renders an interactive control)
   - ReadOnly mode (renders a static display)
   - Null/undefined/empty value coercion

4. **Add contract tests** -- update the adapter's `__tests__/contract.test.ts` to cover the new field type.

5. **Register the field** -- add the component to the adapter's `registry.ts` under the new type key.

6. **Add a Storybook story** -- create a story in `stories/` demonstrating the field.

7. **Implement in remaining adapters** -- all 11 adapters should support the field type. Adapters that lack a native equivalent should fall back to semantic HTML.

## Commit Message Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Every commit message should follow this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | When to Use |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only changes |
| `style` | Formatting, missing semicolons, etc. (no code change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `build` | Changes to the build system or dependencies |
| `ci` | Changes to CI configuration |
| `chore` | Other changes that don't modify src or test files |

### Scopes

Use the package name as the scope when the change is specific to one package:

```
feat(core): add new condition operator "between"
fix(mui): correct Dropdown readOnly label lookup
docs(headless): update README with styling examples
test(antd): add contract tests for Rating field
```

For changes that span multiple packages, omit the scope or use a general scope:

```
feat: add DateRange field to all adapters
chore: bump version to 1.1.0
```

### Examples

```
feat(core): add arrayContains condition operator

Add support for arrayContains, arrayNotContains, arrayLengthEquals,
arrayLengthGreaterThan, and arrayLengthLessThan operators in the
condition evaluator for array-valued fields.

fix(fluent): prevent Textarea from losing focus on auto-save

docs: add SSR / Next.js integration guide
```

## Pull Request Process

1. **Create a feature branch** from `main`:

   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make your changes.** Keep the scope focused -- one logical change per PR.

3. **Run tests before pushing:**

   ```bash
   npm run test
   ```

   If you changed an adapter, also run its contract tests and verify the build:

   ```bash
   npm run build
   ```

4. **Push your branch and open a PR** against `main` at [bghcore/formosaic](https://github.com/bghcore/formosaic/pulls).

5. **PR description** should include:
   - What changed and why
   - How to test the change
   - Screenshots or Storybook links for visual changes
   - Whether the change is breaking

6. **CI must pass.** The GitHub Actions CI workflow runs the full test suite, build, and linting on every PR.

7. **Respond to review feedback.** Maintainers may request changes. Push additional commits to the same branch -- do not force-push during review.

### What Makes a Good PR

- **Small and focused.** One feature, one bug fix, or one refactor. Not all three.
- **Tested.** New features need tests. Bug fixes need regression tests.
- **Documented.** If the change affects the public API, update the relevant MDX files under `docs/`.
- **Backward compatible.** Breaking changes require discussion in an issue first.

## Reporting Issues

When opening an issue, please include:

- **Which package** is affected (e.g., `@formosaic/core`, `@formosaic/mui`)
- **Version** of the affected package
- **Steps to reproduce** the issue
- **Expected behavior** vs. actual behavior
- **Environment** -- Node version, browser, OS
- A **minimal reproduction** (code snippet, StackBlitz, or failing test) if possible

Search [existing issues](https://github.com/bghcore/formosaic/issues) before opening a new one to avoid duplicates.

## Security Issues

Do **not** report security vulnerabilities through public GitHub issues. Instead, use [GitHub Security Advisories](https://github.com/bghcore/formosaic/security/advisories/new) for responsible disclosure. See [SECURITY.md](./SECURITY.md) for full details.

## Getting Help

- Read the [documentation](https://formosaic.com/) -- it covers architecture, API reference, and guides
- Browse the [Storybook](https://formosaic.com/storybook/) to see components in action
- Check the [examples](./packages/examples) for real-world usage patterns
- Open a [discussion](https://github.com/bghcore/formosaic/discussions) for questions that are not bug reports

## License

By contributing to Formosaic, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
