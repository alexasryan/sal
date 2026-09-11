// Keep a reviewed, generated snapshot at the existing main/root Pages source.
// Never remove files that this script did not previously generate.
import { readFile, writeFile, readdir, cp, rm } from "node:fs/promises";
import path from "node:path";
const entries = await readdir("dist");
const reserved = new Set([
  "src",
  "site",
  "public",
  "scripts",
  "tests",
  "README.md",
  "package.json",
  "package-lock.json",
  "site.config.json",
  ".git",
  ".github",
]);
if (entries.some((e) => reserved.has(e)))
  throw new Error("Unexpected build output would overwrite source");
let previous = [];
try {
  previous = JSON.parse(await readFile(".pages-output.json", "utf8"));
} catch {}
for (const old of previous)
  if (
    !entries.includes(old) &&
    !reserved.has(old) &&
    path.basename(old) === old
  )
    await rm(old, { force: true, recursive: true });
for (const name of entries)
  await cp(path.join("dist", name), name, { recursive: true, force: true });
await writeFile(".pages-output.json", JSON.stringify(entries, null, 2) + "\n");
console.log("Synchronized generated Pages snapshot in repository root.");
