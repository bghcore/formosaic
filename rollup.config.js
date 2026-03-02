import typescript from "rollup-plugin-typescript2";
import { dts } from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
    output: [
      { file: "dist/index.cjs.js", format: "cjs" },
      { file: "dist/index.esm.js", format: "esm" },
    ],
    plugins: [typescript({ tsconfig: "./tsconfig.json" })],
    external: ["react", "react-dom"],
  },
  {
    input: "src/index.ts",
    output: { file: "dist/index.d.ts", format: "es" },
    plugins: [dts()],
  },
];
