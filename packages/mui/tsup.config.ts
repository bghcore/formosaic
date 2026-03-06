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
    "@mui/material",
    "@emotion/react",
    "@emotion/styled",
    "@form-eng/core",
  ],
  jsx: "automatic",
});
