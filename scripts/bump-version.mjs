#!/usr/bin/env node
// Bumps version across root package.json and all workspace packages.
// Usage: node scripts/bump-version.mjs <new-version>
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const newVersion = process.argv[2];
if (!newVersion || !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(newVersion)) {
  console.error("Usage: node scripts/bump-version.mjs <semver>");
  console.error("  e.g. node scripts/bump-version.mjs 1.5.0");
  process.exit(1);
}

const writePkg = (path) => {
  const raw = readFileSync(path, "utf8");
  const trailingNewline = raw.endsWith("\n") ? "\n" : "";
  const pkg = JSON.parse(raw);
  const prev = pkg.version;
  pkg.version = newVersion;
  writeFileSync(path, JSON.stringify(pkg, null, 2) + trailingNewline);
  console.log(`  ${pkg.name ?? "(root)"}: ${prev} -> ${newVersion}`);
};

console.log(`Bumping to ${newVersion}...`);
writePkg(resolve(repoRoot, "package.json"));

const pkgsDir = resolve(repoRoot, "packages");
for (const name of readdirSync(pkgsDir)) {
  const pkgPath = resolve(pkgsDir, name, "package.json");
  try {
    if (statSync(pkgPath).isFile()) writePkg(pkgPath);
  } catch {
    // missing package.json — skip
  }
}
console.log("Done.");
