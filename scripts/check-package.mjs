import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = join(packageRoot, "dist");

if (!existsSync(distRoot)) {
  throw new Error(
    "Missing dist output. Run `pnpm run build` before `pnpm run check:package`.",
  );
}

const packageJson = JSON.parse(
  readFileSync(join(packageRoot, "package.json"), "utf8"),
);

const collectFiles = (directory) => {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectFiles(absolutePath));
      continue;
    }

    files.push(relative(packageRoot, absolutePath));
  }

  return files.sort();
};

const collectExportPaths = (value) => {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectExportPaths);
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectExportPaths);
  }

  return [];
};

const normalizePath = (filePath) => filePath.replace(/^\.\//, "");

const packOutput = execFileSync(
  "npm",
  ["pack", "--ignore-scripts", "--json", "--dry-run"],
  {
    cwd: packageRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  },
).trim();

const jsonStart = packOutput.indexOf("[");
const jsonEnd = packOutput.lastIndexOf("]");

if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
  throw new Error("Unable to locate npm pack JSON output.");
}

const [packResult] = JSON.parse(packOutput.slice(jsonStart, jsonEnd + 1));

if (!packResult || !Array.isArray(packResult.files)) {
  throw new Error("Unable to read npm pack dry-run output.");
}

const packedPaths = new Set(packResult.files.map((entry) => entry.path));
const declaredEntrypoints = [
  ...new Set(
    [
      normalizePath(packageJson.main),
      normalizePath(packageJson.module),
      normalizePath(packageJson.types),
      ...collectExportPaths(packageJson.exports).map(normalizePath),
    ].filter(Boolean),
  ),
];
const sourceEntrypoints = declaredEntrypoints.filter((filePath) =>
  filePath.startsWith("src/"),
);

if (sourceEntrypoints.length > 0) {
  console.error("Package metadata still points at source entrypoints:");

  for (const filePath of sourceEntrypoints) {
    console.error(`- ${filePath}`);
  }

  process.exit(1);
}

const requiredPaths = new Set([
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "package.json",
  ...collectFiles(distRoot),
  ...declaredEntrypoints,
]);

const missingPaths = [...requiredPaths].filter(
  (filePath) => !packedPaths.has(filePath),
);

if (missingPaths.length > 0) {
  console.error("Package dry-run is missing required files:");

  for (const filePath of missingPaths) {
    console.error(`- ${filePath}`);
  }

  process.exit(1);
}

const leakedSourceFiles = [...packedPaths].filter((filePath) =>
  filePath.startsWith("src/"),
);

if (leakedSourceFiles.length > 0) {
  console.error("Package dry-run still includes source files:");

  for (const filePath of leakedSourceFiles) {
    console.error(`- ${filePath}`);
  }

  process.exit(1);
}

const forbiddenPrefixes = [
  "coverage/",
  "playwright-report/",
  "test-results/",
  ".tmp-ui5",
];
const leakedArtifacts = [...packedPaths].filter((filePath) =>
  forbiddenPrefixes.some((prefix) => filePath.startsWith(prefix)),
);

if (leakedArtifacts.length > 0) {
  console.error("Package dry-run includes local verification artifacts:");

  for (const filePath of leakedArtifacts) {
    console.error(`- ${filePath}`);
  }

  process.exit(1);
}

console.log(
  `Package dry-run verified ${requiredPaths.size} required files across dist/ and declared exports.`,
);
