import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/adapter-utils.ts", "src/testing.ts", "src/devtools.ts", "src/rjsf.ts", "src/zod.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "react-hook-form", "vitest", "@testing-library/react"],
  jsx: "automatic",
});
