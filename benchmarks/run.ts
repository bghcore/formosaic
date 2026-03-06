/**
 * Benchmark runner script.
 *
 * Runs all benchmark suites via vitest bench and outputs a summary.
 * Usage: npx tsx benchmarks/run.ts
 */
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

const BENCHMARKS_DIR = path.resolve(__dirname);
const ROOT_DIR = path.resolve(__dirname, "..");

const suites = [
  "suites/rule-engine.bench.ts",
  "suites/condition-evaluator.bench.ts",
  "suites/validation.bench.ts",
  "suites/expression-engine.bench.ts",
  "suites/bundle-size.bench.ts",
];

function runBenchmarks(): void {
  console.log("=".repeat(70));
  console.log("  Dynamic Forms Performance Benchmark Suite");
  console.log("  " + new Date().toISOString());
  console.log("=".repeat(70));
  console.log();

  for (const suite of suites) {
    const suiteName = path.basename(suite, ".bench.ts");
    console.log(`--- Running: ${suiteName} ---`);
    console.log();

    try {
      const output = execSync(
        `npx vitest bench --config="${path.join(BENCHMARKS_DIR, "vitest.config.ts")}" "${path.join(BENCHMARKS_DIR, suite)}"`,
        {
          cwd: ROOT_DIR,
          encoding: "utf-8",
          stdio: ["pipe", "pipe", "pipe"],
          timeout: 300_000, // 5 min per suite
        }
      );
      console.log(output);
    } catch (err: unknown) {
      const error = err as { stdout?: string; stderr?: string; message?: string };
      // vitest bench exits with non-zero on some platforms even on success
      if (error.stdout) {
        console.log(error.stdout);
      }
      if (error.stderr) {
        console.error(error.stderr);
      }
      if (!error.stdout && !error.stderr) {
        console.error(`Failed to run ${suite}: ${error.message}`);
      }
    }
    console.log();
  }

  // Print bundle size report
  printBundleSizeReport();

  console.log("=".repeat(70));
  console.log("  Benchmark run complete.");
  console.log("=".repeat(70));
}

function printBundleSizeReport(): void {
  const packages = ["core", "fluent", "mui"];
  const rows: string[] = [];

  console.log("--- Bundle Size Summary ---");
  console.log();
  console.log("| Package | CJS | ESM | DTS |");
  console.log("| --- | ---: | ---: | ---: |");

  let totalCJS = 0;
  let totalESM = 0;
  let totalDTS = 0;

  for (const pkg of packages) {
    const distDir = path.join(ROOT_DIR, "packages", pkg, "dist");
    const cjs = getFileSize(path.join(distDir, "index.js"));
    const esm = getFileSize(path.join(distDir, "index.mjs"));
    const dts = getFileSize(path.join(distDir, "index.d.ts"));

    totalCJS += cjs;
    totalESM += esm;
    totalDTS += dts;

    console.log(
      `| @form-eng/${pkg} | ${formatKB(cjs)} | ${formatKB(esm)} | ${formatKB(dts)} |`
    );
  }

  console.log(
    `| **Total** | **${formatKB(totalCJS)}** | **${formatKB(totalESM)}** | **${formatKB(totalDTS)}** |`
  );
  console.log();
}

function getFileSize(filePath: string): number {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

function formatKB(bytes: number): string {
  return (bytes / 1024).toFixed(1) + " KB";
}

runBenchmarks();
