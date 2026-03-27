# Architecture

## Repository Classification

- Repo type: published adapter package
- Runtime responsibility: register UI5 packages and shared runtime behavior inside KoppaJS applications
- Build-time responsibility: generate committed UI5 package loader manifests and produce library bundles and declarations
- UI presence: example fixture only, not part of the published contract
- Maturity level: `v0` stabilization

## System Shape

`@koppajs/koppajs-ui5` is intentionally narrow:

1. [`src/config.ts`](./src/config.ts) resolves a fully explicit adapter configuration.
2. [`src/module.ts`](./src/module.ts) exposes the KoppaJS module factory and install convenience function.
3. [`src/runtime.ts`](./src/runtime.ts) manages singleton runtime registration, package loading, runtime application, and one-time warnings.
4. [`src/packages.ts`](./src/packages.ts) loads requested official UI5 packages using the generated manifest map.
5. [`src/bridge/ui5-events.ts`](./src/bridge/ui5-events.ts) bridges `onUi5...` aliases to real UI5 custom events.
6. [`src/bridge/warnings.ts`](./src/bridge/warnings.ts) warns when declarative bindings target JS-only UI5 properties.
7. [`src/generated/ui5-package-manifests.ts`](./src/generated/ui5-package-manifests.ts) is a committed build artifact generated from installed UI5 package manifests.

## Control Flow

1. Consumer code calls `createKoppajsUi5Module()` or `installKoppajsUi5()`.
2. The adapter resolves config defaults and normalization in pure code.
3. Module installation registers runtime state and the KoppaJS `created` hook.
4. Runtime initialization ensures selected UI5 packages are imported before meaningful use.
5. Runtime configuration applies theme, language, RTL, content density, and optional theme root.
6. Bridge helpers attach event alias translation and unsupported-binding warnings.

## Boundary Rules

- `src/index.ts` is the only public entry point.
- `examples/` exists for validation and demonstration, not as a supported API surface.
- `dist/` is build output, not the authoring source of truth.
- `src/generated/` may be regenerated, but the generated result is committed so package loading stays reviewable and deterministic.

## Non-Goals

- No wrapper components around UI5 controls.
- No hidden auto-registration magic outside the documented module install flow.
- No generalized serialization layer for arbitrary JS-only UI5 properties.

## Packaging And Distribution

- `pnpm run build` regenerates the committed UI5 manifest map and emits the
  publishable package into `dist/`.
- `package.json` exports the root ESM, CommonJS, and declaration entrypoints
  from `dist/`, plus `./package.json` for tooling interoperability.
- `pnpm run check:package` validates that the packed payload matches the
  declared manifest fields and does not leak source or local test artifacts.
- `pnpm run test:package` installs the packed tarball into a clean temporary
  consumer and imports the published contract.

## Supporting Material

- Boundary detail: [`docs/architecture/module-boundaries.md`](./docs/architecture/module-boundaries.md)
- Architecture decisions: [`docs/adr/`](./docs/adr)
- Quality baseline: [`docs/quality/README.md`](./docs/quality/README.md)
- Meta layer: [`docs/meta/README.md`](./docs/meta/README.md)
- Feature specs: [`docs/specs/`](./docs/specs)
