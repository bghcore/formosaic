// Typechecks every workspace package against its own tsconfig.json.
// Mirrors the CI "Typecheck" step (.github/workflows/ci.yml) so local runs
// and CI agree. Core is strict; adapters intentionally compile with
// strict: false — which is why this does NOT sweep tsconfig.base.json
// over the whole repo.
import { execSync } from "node:child_process";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const packagesDir = join(process.cwd(), "packages");
let failed = false;

for (const entry of readdirSync(packagesDir)) {
  const pkgDir = join(packagesDir, entry);
  if (!existsSync(join(pkgDir, "tsconfig.json"))) continue;
  console.log(`== packages/${entry}`);
  try {
    execSync(`npx tsc -p "${pkgDir}" --noEmit`, { stdio: "inherit" });
  } catch {
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
