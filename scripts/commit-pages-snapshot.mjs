// Keep the existing main/root Pages source equal to the tested production build.
// Only generated paths from our manifest are staged; pushes are never forced.
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
function git(args, allowExitOne = false) {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0 && !(allowExitOne && result.status === 1)) {
    throw new Error(result.stderr || "Git failed: " + args[0]);
  }
  return { status: result.status, output: result.stdout.trim() };
}
const paths = JSON.parse(await readFile(".pages-output.json", "utf8"));
const reserved = new Set(["src", "site", "public", "scripts", "tests", "docs",
  "README.md", "package.json", "package-lock.json", "site.config.json", ".git", ".github"]);
if (!Array.isArray(paths) || paths.some(p =>
  typeof p !== "string" || !/^[A-Za-z0-9_.-]+$/.test(p) || p.includes("/") || p.includes("..") || reserved.has(p))) {
  throw new Error("Invalid generated output manifest");
}
const before = git(["rev-parse", "HEAD"]).output;
git(["add", "--all", "--", ".pages-output.json", ...paths]);
if (git(["diff", "--cached", "--quiet"], true).status === 0) {
  console.log("Generated Pages snapshot already matches the production build.");
} else {
  git(["config", "user.name", "github-actions[bot]"]);
  git(["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
  git(["commit", "-m", "chore: synchronize generated Pages snapshot [skip ci]"]);
  // A concurrent change on main rejects this ordinary fast-forward push.
  git(["push", "origin", "HEAD:main"]);
  console.log("Synchronized generated snapshot from " + before + " at " + git(["rev-parse", "HEAD"]).output);
}
