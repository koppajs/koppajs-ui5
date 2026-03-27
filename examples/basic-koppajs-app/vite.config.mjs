import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import koppaPlugin from "@koppajs/koppajs-vite-plugin";
import { defineConfig } from "vite";

const currentDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(currentDir, "../..");

function normalizeKpaModuleExport() {
  return {
    name: "normalize-kpa-module-export",
    enforce: "post",
    transform(code, id) {
      const cleanId = id.split("?")[0];

      if (!cleanId.endsWith(".kpa")) {
        return null;
      }

      const trimmed = code.trim();
      if (!trimmed.startsWith("{") || trimmed.startsWith("export default")) {
        return null;
      }

      return {
        code: `export default ${trimmed};`,
        map: null,
      };
    },
  };
}

export default defineConfig({
  root: currentDir,
  plugins: [
    koppaPlugin({
      tsconfigFile: resolve(currentDir, "./tsconfig.json"),
    }),
    normalizeKpaModuleExport(),
  ],
  resolve: {
    alias: {
      "@koppajs/koppajs-ui5": resolve(repoRoot, "./src/index.ts"),
    },
  },
});
