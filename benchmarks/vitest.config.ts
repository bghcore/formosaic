import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    benchmark: {
      include: ["benchmarks/suites/**/*.bench.ts"],
    },
  },
});
