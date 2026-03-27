import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const distEntryPath = resolve(repoRoot, "dist/index.js");
const distTypesPath = resolve(repoRoot, "dist/index.d.ts");
const packageJson = JSON.parse(
  readFileSync(join(repoRoot, "package.json"), "utf8"),
);
const corePeerRange =
  packageJson.peerDependencies?.["@koppajs/koppajs-core"] ?? "^3.0.0";

if (!existsSync(distEntryPath) || !existsSync(distTypesPath)) {
  throw new Error(
    "Missing dist output. Run `pnpm run build` before `pnpm run test:package`.",
  );
}

const tempRoot = mkdtempSync(join(tmpdir(), "koppajs-ui5-package-smoke-"));
const cacheDir = join(tempRoot, "npm-cache");
const packDir = join(tempRoot, "pack");
const consumerDir = join(tempRoot, "consumer");

mkdirSync(cacheDir, { recursive: true });
mkdirSync(packDir, { recursive: true });
mkdirSync(consumerDir, { recursive: true });

const runCommand = (command, args, cwd) => {
  const result = spawnSync(command, args, {
    cwd,
    env: {
      ...process.env,
      HUSKY: "0",
    },
    encoding: "utf8",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const details = [
      `Command failed: ${command} ${args.join(" ")}`,
      result.stdout.trim() !== "" ? `stdout:\n${result.stdout.trim()}` : "",
      result.stderr.trim() !== "" ? `stderr:\n${result.stderr.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    throw new Error(details);
  }

  return result.stdout;
};

const parsePackOutput = (output) => {
  const jsonMatch = output.match(/(^[[{][\s\S]*$)/m);

  if (!jsonMatch) {
    throw new Error(
      `npm pack did not return JSON output.\n\nstdout:\n${output.trim()}`,
    );
  }

  return JSON.parse(jsonMatch[1]);
};

const writeConsumerSmokeFile = () => {
  writeFileSync(
    join(consumerDir, "package.json"),
    `${JSON.stringify(
      {
        name: "package-smoke-consumer",
        private: true,
        type: "module",
      },
      null,
      2,
    )}\n`,
  );

  writeFileSync(
    join(consumerDir, "smoke.mjs"),
    `import {
  createKoppajsUi5Module,
  installKoppajsUi5,
  resolveKoppajsUi5Config,
} from "@koppajs/koppajs-ui5";

const resolvedConfig = resolveKoppajsUi5Config({
  packages: ["main", "fiori", "main"],
  runtime: {
    theme: "sap_horizon_dark",
    language: "de",
    rtl: true,
    contentDensity: "compact",
  },
  assets: {
    baseUrl: "https://cdn.example.invalid/ui5/",
  },
  bridge: {
    ui5CustomEvents: false,
    warnOnUnsupportedBindings: false,
  },
});

if (resolvedConfig.packages.join(",") !== "main,fiori") {
  throw new Error(\`Unexpected package normalization: \${resolvedConfig.packages.join(",")}\`);
}

if (resolvedConfig.runtime.theme !== "sap_horizon_dark") {
  throw new Error("resolveKoppajsUi5Config() did not preserve the published theme contract.");
}

if (resolvedConfig.bridge.ui5CustomEvents !== false) {
  throw new Error("resolveKoppajsUi5Config() did not preserve bridge settings.");
}

const module = createKoppajsUi5Module({
  packages: ["main"],
  bridge: {
    ui5CustomEvents: false,
  },
});

if (module.name !== "koppajsUi5") {
  throw new Error(\`Unexpected module name: \${module.name}\`);
}

if (typeof module.install !== "function" || typeof module.attach !== "function") {
  throw new Error("Published module contract is incomplete.");
}

installKoppajsUi5({
  packages: ["main"],
  bridge: {
    ui5CustomEvents: false,
  },
});

console.log("Package consumer smoke check passed.");
`,
  );
};

try {
  const packOutput = runCommand(
    npmCommand,
    [
      "pack",
      "--json",
      "--silent",
      "--ignore-scripts",
      "--pack-destination",
      packDir,
      "--cache",
      cacheDir,
    ],
    repoRoot,
  );
  const parsedPackOutput = parsePackOutput(packOutput);

  if (!Array.isArray(parsedPackOutput)) {
    const summary =
      typeof parsedPackOutput?.error?.summary === "string"
        ? parsedPackOutput.error.summary
        : "Unknown npm pack error.";
    throw new Error(`npm pack did not return a tarball list.\n\n${summary}`);
  }

  const [packResult] = parsedPackOutput;

  if (!packResult || typeof packResult.filename !== "string") {
    throw new Error("npm pack did not return a tarball filename.");
  }

  const tarballPath = join(packDir, packResult.filename);

  writeConsumerSmokeFile();

  runCommand(
    npmCommand,
    [
      "install",
      "--silent",
      "--ignore-scripts",
      "--no-package-lock",
      "--no-audit",
      "--no-fund",
      "--cache",
      cacheDir,
      tarballPath,
      `@koppajs/koppajs-core@${corePeerRange}`,
    ],
    consumerDir,
  );

  const smokeResult = runCommand(process.execPath, ["smoke.mjs"], consumerDir);
  process.stdout.write(smokeResult);
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
