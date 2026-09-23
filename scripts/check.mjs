/**
 * Runs every *.check.ts / *.check.tsx under src/ and fails if any of them fail.
 *
 * Why a script and not `tsx src/**\/*.check.ts` straight in package.json:
 * `**` is NOT recursive in Git Bash (or sh) unless globstar is set, so that
 * line silently expands to the 2 checks that sit one level down and exits 0 —
 * a green run that proved almost nothing. node:fs globSync does the matching
 * itself, identically on every shell and OS.
 *
 * ponytail: no test framework. Each check is already a standalone program that
 * throws on failure, so running it and reading the exit code IS the harness.
 */
import { globSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const files = globSync("src/**/*.check.{ts,tsx}").sort();

// A suite that matches nothing must never look like a suite that passed.
if (files.length === 0) {
  console.error("FAIL: no *.check.ts(x) files matched — the glob is broken.");
  process.exit(1);
}

// Resolve tsx's own entry rather than the .bin shim: spawning the shim needs
// node_modules/.bin on PATH (true under npm, not for a bare `node scripts/...`)
// and on Windows it is a .cmd that would need shell:true. Running the JS entry
// with the current node binary sidesteps both.
const tsxCli = createRequire(import.meta.url).resolve("tsx/cli");
const failed = [];

for (const file of files) {
  const { status } = spawnSync(process.execPath, [tsxCli, file], {
    stdio: "inherit",
    shell: false,
  });
  if (status !== 0) failed.push(file);
}

console.log(`\n${files.length - failed.length}/${files.length} checks passed`);

if (failed.length > 0) {
  console.error(`FAILED:\n${failed.map((f) => `  ${f}`).join("\n")}`);
  process.exit(1);
}
