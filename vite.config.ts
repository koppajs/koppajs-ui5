import { builtinModules } from "node:module";
import { defineConfig } from "vite";

import pkg from "./package.json";

const external = new Set([
  ...builtinModules,
  ...builtinModules.map((moduleName) => `node:${moduleName}`),
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
]);

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "KoppajsUi5",
      fileName: (format) => (format === "cjs" ? "index.cjs" : "index.js"),
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: (id) =>
        external.has(id) ||
        [...external].some((value) => id.startsWith(`${value}/`)),
    },
    sourcemap: true,
    target: "es2022",
  },
});
