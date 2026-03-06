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
    "@form-eng/core",
  ],
  jsx: "automatic",
});
