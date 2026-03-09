# Test Architecture Note: Parity Tests in Core

## Current State

`@form-eng/core` includes all 9 adapter packages as `devDependencies` for cross-adapter parity testing. The parity tests, edge-case tests, and business-form round-trip tests all live in `packages/core/src/__tests__/parity/`.

## Benefits of Current Approach

1. **Single test command** — `npm run test` runs all parity tests alongside unit tests. No separate package to build/run.
2. **Fixture reuse** — Parity tests share fixtures with unit tests (fieldConfigs.ts, businessForms.ts, parityFixtures.ts).
3. **Harness co-location** — The parity harness (`parityHarness.tsx`) is exported from `@form-eng/core/testing`, keeping test infrastructure and its consumers in the same package.
4. **Simple CI** — No extra build step or workspace link configuration needed.
5. **Discovery** — New contributors find all tests in one place.

## Downsides of Current Approach

1. **DevDependency bloat** — Core's devDependencies include 9 adapter packages plus their transitive deps (antd, @chakra-ui/react, @mantine/core, baseui, dayjs, etc.). This inflates `npm install` time and `node_modules` size for anyone working on core.
2. **Circular-ish coupling** — Core devDepends on adapters, and adapters peerDepend on core. This is not a true circular dependency (devDeps are not resolved transitively), but it looks odd in the dependency graph.
3. **Build order sensitivity** — Adapter packages must be built before core's parity tests can run. The current `npm run build` script handles this, but it's a constraint.
4. **Test isolation** — A bug in one adapter's contract can break core's test suite, even though core itself is fine.

## When to Move Parity Tests to a Separate Package

Consider creating a `packages/test-suite` or `packages/parity` workspace package when:
- **Adapter count exceeds ~12** — More adapters means more devDeps in core and longer install times.
- **Parity tests become slow** — If parity tests exceed ~30s, isolating them lets core tests stay fast.
- **CI wants selective testing** — A separate package enables "only run parity tests when an adapter changes" in CI matrix.
- **External adapters appear** — If third-party adapters need parity testing, a separate package provides a clean integration point.

## Recommendation

**Keep parity tests in core for now.**

At 9 adapters and ~3600 tests completing in ~40s, the current approach is practical. The benefits of simplicity and discovery outweigh the downsides. The devDependency bloat is real but tolerable in a workspace monorepo where `node_modules` hoisting mitigates most of the cost.

**Revisit this decision when:**
- Total test count exceeds ~5000 (likely during Tier 2 expansion)
- A third-party adapter needs parity testing
- CI run time for `npm test` exceeds 90 seconds

**If/when migration happens:**
1. Create `packages/test-suite` with its own package.json
2. Move `parityHarness.tsx` and `parityFixtures.ts` to the new package (or keep them exported from core/testing and import them)
3. Move all `__tests__/parity/*.test.ts` files
4. Remove adapter devDeps from core's package.json
5. Add the new package to CI
