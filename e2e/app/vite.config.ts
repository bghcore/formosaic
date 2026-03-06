import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@form-eng/core": path.resolve(__dirname, "../../packages/core/src"),
      "@form-eng/fluent": path.resolve(__dirname, "../../packages/fluent/src"),
    },
  },
  server: {
    port: 3100,
    strictPort: true,
  },
});
