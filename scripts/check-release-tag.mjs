import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const expectedPackageName = "@koppajs/koppajs-ui5";

const runGit = (args) =>
  execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  }).trim();

const tryRunGit = (args) => {
  try {
    return runGit(args);
  } catch {
    return null;
  }
};

const inputArgs = process.argv.slice(2);
const normalizedArgs = inputArgs[0] === "--" ? inputArgs.slice(1) : inputArgs;
const [inputTagName, inputCommit] = normalizedArgs;
const tagName = inputTagName ?? process.env.GITHUB_REF_NAME;

if (!tagName) {
  throw new Error(
    "Missing release tag name. Pass `vX.Y.Z` as the first argument or set GITHUB_REF_NAME.",
  );
}

if (!/^v\d+\.\d+\.\d+$/.test(tagName)) {
  throw new Error(
    `Invalid release tag \`${tagName}\`. Expected the format \`vX.Y.Z\`.`,
  );
}

const releaseVersion = tagName.slice(1);
const packageJson = JSON.parse(
  readFileSync(join(repoRoot, "package.json"), "utf8"),
);
const changelog = readFileSync(join(repoRoot, "CHANGELOG.md"), "utf8");

if (packageJson.name !== expectedPackageName) {
  throw new Error(
    `Unexpected package name \`${packageJson.name}\`. Expected \`${expectedPackageName}\`.`,
  );
}

if (packageJson.version !== releaseVersion) {
  throw new Error(
    `Version mismatch: tag \`${releaseVersion}\` does not match package.json \`${packageJson.version}\`.`,
  );
}

const changelogSectionPattern = new RegExp(
  `^## \\[${releaseVersion.replace(/[.*+?^${}()|[\]\\\\]/g, "\\$&")}\\]`,
  "m",
);

if (!changelogSectionPattern.test(changelog)) {
  throw new Error(
    `CHANGELOG.md is missing a release section for \`${releaseVersion}\`.`,
  );
}

const tagCommit =
  inputCommit ??
  process.env.GITHUB_SHA ??
  tryRunGit(["rev-parse", "--verify", `${tagName}^{commit}`]) ??
  runGit(["rev-parse", "HEAD"]);

runGit(["fetch", "--no-tags", "origin", "main:refs/remotes/origin/main"]);

try {
  runGit(["merge-base", "--is-ancestor", tagCommit, "origin/main"]);
} catch {
  throw new Error(
    `Release commit \`${tagCommit}\` is not contained in \`origin/main\`. Push \`main\` before pushing the tag.`,
  );
}

console.log(
  `Release tag ${tagName} verified against package metadata, CHANGELOG.md, and origin/main.`,
);
