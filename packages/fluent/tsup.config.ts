import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "react-hook-form",
    "@fluentui/react-components",
    "@fluentui/react-icons",
    "@bghcore/dynamic-forms-core",
  ],
  jsx: "automatic",
});
