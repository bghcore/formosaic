/**
 * Type environment for test files under src/__tests__.
 *
 * vitest runs with `globals: true` (see /vitest.config.ts) and the root
 * vitest.setup.ts imports "@testing-library/jest-dom/vitest" to register DOM
 * matchers at runtime. Neither is visible to a plain `tsc -p packages/core`
 * typecheck, so this file wires up the same globals and matcher augmentations
 * at the type level.
 */
/// <reference types="vitest/globals" />
import "@testing-library/jest-dom/vitest";
