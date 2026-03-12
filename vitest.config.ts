import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["e2e/**", "benchmarks/**", "node_modules/**", "packages/examples/**", "examples/**", "storybook-static/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["packages/*/src/**/*.{ts,tsx}"],
      exclude: [
        "packages/*/src/**/*.test.{ts,tsx}",
        "packages/*/src/**/__tests__/**",
        "packages/*/src/**/__fixtures__/**",
        "packages/*/src/**/index.ts",
        "packages/*/src/**/types/**",
      ],
    },
  },
});
