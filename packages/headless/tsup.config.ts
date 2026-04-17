import { defineConfig } from "tsup";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

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
    "@formosaic/core",
  ],
  jsx: "automatic",
  onSuccess: async () => {
    copyFileSync(
      resolve(__dirname, "src/styles.css"),
      resolve(__dirname, "dist/styles.css"),
    );
  },
});
