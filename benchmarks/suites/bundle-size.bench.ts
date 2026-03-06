import { describe, bench, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const PACKAGES_DIR = path.resolve(__dirname, "../../packages");
const PACKAGES = ["core", "fluent", "mui"];

interface BundleInfo {
  name: string;
  cjsBytes: number;
  esmBytes: number;
  dtsBytes: number;
  cjsKB: string;
  esmKB: string;
  dtsKB: string;
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

function getBundleInfo(packageName: string): BundleInfo {
  const distDir = path.join(PACKAGES_DIR, packageName, "dist");
  const cjsBytes = getFileSize(path.join(distDir, "index.js"));
  const esmBytes = getFileSize(path.join(distDir, "index.mjs"));
  const dtsBytes = getFileSize(path.join(distDir, "index.d.ts"));

  return {
    name: `@form-eng/${packageName}`,
    cjsBytes,
    esmBytes,
    dtsBytes,
    cjsKB: formatKB(cjsBytes),
    esmKB: formatKB(esmBytes),
    dtsKB: formatKB(dtsBytes),
  };
}

/**
 * Bundle size benchmarks read dist/ file sizes.
 * These are not timing benchmarks but serve as a regression check
 * that can be tracked alongside performance benchmarks.
 *
 * Run `npm run build` before running these benchmarks.
 */
describe("bundle sizes", () => {
  const bundles: BundleInfo[] = [];

  for (const pkg of PACKAGES) {
    bench(`measure ${pkg} bundle sizes`, () => {
      const info = getBundleInfo(pkg);
      bundles.push(info);
      // The bench iteration itself is trivial; the value is in the report
    });
  }

  // Print a summary after all benchmarks in this suite
  bench("report summary", () => {
    const allBundles = PACKAGES.map(getBundleInfo);
    console.log("\n--- Bundle Size Report ---");
    console.log(
      "| Package | CJS | ESM | DTS |"
    );
    console.log("| --- | --- | --- | --- |");
    for (const b of allBundles) {
      console.log(`| ${b.name} | ${b.cjsKB} | ${b.esmKB} | ${b.dtsKB} |`);
    }
    const totalCJS = allBundles.reduce((s, b) => s + b.cjsBytes, 0);
    const totalESM = allBundles.reduce((s, b) => s + b.esmBytes, 0);
    const totalDTS = allBundles.reduce((s, b) => s + b.dtsBytes, 0);
    console.log(
      `| **Total** | **${formatKB(totalCJS)}** | **${formatKB(totalESM)}** | **${formatKB(totalDTS)}** |`
    );
    console.log("---\n");
  });
});

// --- Budget assertions ---

describe("bundle size budgets", () => {
  // Core should stay under 150KB CJS, 130KB ESM, 70KB DTS
  bench("core CJS < 150 KB", () => {
    const info = getBundleInfo("core");
    if (info.cjsBytes > 150 * 1024) {
      throw new Error(`Core CJS ${info.cjsKB} exceeds 150 KB budget`);
    }
  });

  bench("core ESM < 130 KB", () => {
    const info = getBundleInfo("core");
    if (info.esmBytes > 130 * 1024) {
      throw new Error(`Core ESM ${info.esmKB} exceeds 130 KB budget`);
    }
  });

  bench("core DTS < 70 KB", () => {
    const info = getBundleInfo("core");
    if (info.dtsBytes > 70 * 1024) {
      throw new Error(`Core DTS ${info.dtsKB} exceeds 70 KB budget`);
    }
  });
});
