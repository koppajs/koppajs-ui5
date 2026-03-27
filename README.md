<a id="readme-top"></a>

<div align="center">
  <img src="https://public-assets-1b57ca06-687a-4142-a525-0635f7649a5c.s3.eu-central-1.amazonaws.com/koppajs/koppajs-logo-text-900x226.png" width="500" alt="KoppaJS Logo">
</div>

<br>

<div align="center">
  <a href="https://www.npmjs.com/package/@koppajs/koppajs-ui5"><img src="https://img.shields.io/npm/v/@koppajs/koppajs-ui5?style=flat-square" alt="npm version"></a>
  <a href="https://github.com/koppajs/koppajs-ui5/actions"><img src="https://img.shields.io/github/actions/workflow/status/koppajs/koppajs-ui5/ci.yml?branch=main&style=flat-square" alt="CI Status"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square" alt="License"></a>
</div>

<br>

<div align="center">
  <h1 align="center">@koppajs/koppajs-ui5</h1>
  <h3 align="center">Official KoppaJS adapter for UI5 Web Components</h3>
  <p align="center">
    <i>Keep native `ui5-*` tags, load official UI5 packages, and bridge explicit custom events without wrapper sprawl.</i>
  </p>
</div>

<br>

<div align="center">
  <p align="center">
    <a href="https://github.com/koppajs/koppajs-documentation">Documentation</a>
    &middot;
    <a href="https://github.com/koppajs/koppajs-core">KoppaJS Core</a>
    &middot;
    <a href="https://github.com/koppajs/koppajs-vite-plugin">Vite Plugin</a>
    &middot;
    <a href="https://github.com/koppajs/koppajs-components">Components</a>
    &middot;
    <a href="https://github.com/koppajs/koppajs-ui5/issues">Issues</a>
  </p>
</div>

<br>

<details>
<summary>Table of Contents</summary>
  <ol>
    <li><a href="#purpose">Purpose</a></li>
    <li><a href="#ownership-boundaries">Ownership Boundaries</a></li>
    <li><a href="#repository-classification">Repository Classification</a></li>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#public-contract">Public Contract</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#runtime-defaults">Runtime Defaults</a></li>
    <li><a href="#behavior-and-constraints">Behavior And Constraints</a></li>
    <li><a href="#build-and-distribution">Build And Distribution</a></li>
    <li><a href="#ecosystem-fit">Ecosystem Fit</a></li>
    <li><a href="#quality-baseline">Quality Baseline</a></li>
    <li><a href="#additional-references">Additional References</a></li>
    <li><a href="#architecture-governance">Architecture & Governance</a></li>
    <li><a href="#community-contribution">Community & Contribution</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

---

## Purpose

This package exists to solve the integration gap between KoppaJS and UI5 Web Components without creating a second UI component API.

It owns:

- UI5 package loading for the selected package set
- Shared runtime configuration for theme, language, RTL, content density, and theme root
- Declarative UI5 custom-event bridging through the explicit `onUi5...` convention
- Warnings for unsupported declarative bindings that require imperative refs

It does not own:

- A wrapper library around every UI5 control
- Alternate component names such as `k-ui5-button`
- A fork of UI5 Web Components
- Generic declarative support for arbitrary JS-only UI5 property shapes

---

## Ownership Boundaries

- Supported public entry point: the root package export only
- Supported runtime target in `v0`: browser-based KoppaJS applications
- Example application: [`examples/basic-koppajs-app`](./examples/basic-koppajs-app), used for validation and demonstration, not as a published API

Internal files under `src/bridge/`, `src/runtime.ts`, `src/packages.ts`, and `src/generated/` are implementation details.

---

## Repository Classification

- Repo type: adapter package
- Runtime responsibility: browser runtime registration and UI5 bridge behavior
- Build-time responsibility: deterministic generation of committed UI5 package manifests plus library bundling
- UI surface: example fixture only, not part of the published contract
- Maturity level: `v0` stabilization

---

## Installation

```bash
pnpm add @koppajs/koppajs-core @koppajs/koppajs-ui5
pnpm add -D @koppajs/koppajs-vite-plugin
```

The adapter currently supports these official UI5 packages:

- `main` -> `@ui5/webcomponents`
- `fiori` -> `@ui5/webcomponents-fiori`
- `compatibility` -> `@ui5/webcomponents-compat`
- `ai` -> `@ui5/webcomponents-ai`

Local repository requirements:

- Node.js >= 20
- pnpm >= 10.24.0

---

## Public Contract

Supported exports:

```ts
export type KoppajsUi5Package = "main" | "fiori" | "compatibility" | "ai";

export type KoppajsUi5ContentDensity = "cozy" | "compact";

export type KoppajsUi5RuntimeConfig = {
  theme?: string;
  language?: string;
  rtl?: boolean;
  contentDensity?: KoppajsUi5ContentDensity;
};

export type KoppajsUi5AssetsConfig = {
  baseUrl?: string;
};

export type KoppajsUi5BridgeConfig = {
  ui5CustomEvents?: boolean;
  warnOnUnsupportedBindings?: boolean;
};

export type KoppajsUi5ConfigInput = {
  packages?: KoppajsUi5Package[];
  runtime?: KoppajsUi5RuntimeConfig;
  assets?: KoppajsUi5AssetsConfig;
  bridge?: KoppajsUi5BridgeConfig;
};

export type KoppajsUi5ResolvedConfig = {
  packages: KoppajsUi5Package[];
  runtime: Required<KoppajsUi5RuntimeConfig>;
  assets: KoppajsUi5AssetsConfig;
  bridge: Required<KoppajsUi5BridgeConfig>;
};

export type KoppajsUi5Module = {
  readonly name: "koppajsUi5";
  readonly config: KoppajsUi5ResolvedConfig;
  install(ctx: unknown): void;
  attach(): { config: KoppajsUi5ResolvedConfig };
};

export function resolveKoppajsUi5Config(
  input?: KoppajsUi5ConfigInput,
): KoppajsUi5ResolvedConfig;

export function createKoppajsUi5Module(
  input?: KoppajsUi5ConfigInput,
): KoppajsUi5Module;

export function installKoppajsUi5(input?: KoppajsUi5ConfigInput): void;
```

Only the root export is part of the supported contract.
Imports from internal source files are outside the package boundary.

---

## Usage

Canonical registration:

```ts
import { Core } from "@koppajs/koppajs-core";
import { createKoppajsUi5Module } from "@koppajs/koppajs-ui5";

Core.take(
  createKoppajsUi5Module({
    packages: ["main", "fiori"],
    runtime: {
      theme: "sap_horizon",
      language: "de",
      rtl: false,
      contentDensity: "cozy",
    },
    bridge: {
      ui5CustomEvents: true,
      warnOnUnsupportedBindings: true,
    },
  }),
);

Core();
```

Convenience registration:

```ts
import { installKoppajsUi5 } from "@koppajs/koppajs-ui5";

installKoppajsUi5({
  packages: ["main", "fiori"],
});
```

Template usage stays on the original `ui5-*` API:

```kpa
[template]
  <ui5-button design="Emphasized" :disabled="isSaving">Save</ui5-button>
  <ui5-input :value="email"></ui5-input>
  <ui5-dialog header-text="Notice"></ui5-dialog>
[/template]
```

---

## Runtime Defaults

- `packages`: `["main", "fiori"]`
- `runtime.theme`: `"sap_horizon"`
- `runtime.language`: derived from `document`, then `navigator`, else `"en"`
- `runtime.rtl`: derived from the document direction, else `false`
- `runtime.contentDensity`: `"cozy"`
- `bridge.ui5CustomEvents`: `true`
- `bridge.warnOnUnsupportedBindings`: `true`

---

## Behavior And Constraints

Event bridge:

- Native DOM events such as `onClick`, `onInput`, and `onChange` are unchanged.
- UI5 custom events use the explicit `onUi5<EventName>` convention.
- `onUi5SelectionChange` resolves to the real `selection-change` event type.

Runtime behavior:

- Repeated installation is allowed.
- Requested package sets are merged.
- Conflicting runtime settings keep the first active runtime configuration and warn once.

Binding limits in `v0`:

- Primitive and stringifiable declarative bindings are supported.
- Complex JS-only UI5 properties should be set imperatively through refs.
- `assets.baseUrl` is intentionally narrow and currently maps through the UI5 theme-root API.
- SSR is not part of the documented support surface.

Imperative escape hatch:

```kpa
[template]
  <ui5-button ref="saveButton">Save</ui5-button>
[/template]

[ts]
  return {
    methods: {
      updateButton() {
        $refs.saveButton.accessibilityAttributes = {
          expanded: "true",
          controls: "details-panel",
        };
      },
    },
  };
[/ts]
```

---

## Build And Distribution

- source lives in `src/`
- `pnpm run build` regenerates committed UI5 package manifests, emits library bundles, and writes declarations to `dist/`
- the published manifest exports `dist/index.js`, `dist/index.cjs`, and `dist/index.d.ts`
- `pnpm run check:package` verifies that `files`, `exports`, and the packed payload stay aligned
- `pnpm run test:package` installs the packed tarball into a clean temporary consumer and imports the published contract

Local verification commands:

```bash
pnpm install
pnpm run typecheck
pnpm run lint
pnpm run test:ci
pnpm run build
pnpm run check:package
pnpm run test:package
pnpm run test:e2e
pnpm run check
pnpm run validate
```

---

## Ecosystem Fit

`@koppajs/koppajs-ui5` is not a replacement for `@koppajs/koppajs-components`.

- `@koppajs/koppajs-components` is a KoppaJS-native component library.
- `@koppajs/koppajs-ui5` is an integration adapter for the original UI5 Web Components ecosystem.

The package is intentionally small so upstream UI5 documentation remains useful and the adapter contract stays reviewable.

---

## Quality Baseline

- `pnpm run check` is the main local quality gate for docs, formatting, linting, type safety, tests, build output, and publish payload validation.
- `.github/workflows/ci.yml` mirrors that gate on Node 20 and 22.
- `pnpm run validate` adds browser verification through Playwright.
- `.github/workflows/release.yml` reruns `pnpm run validate` before GitHub release creation and npm publish.

---

## Additional References

- Architecture boundaries: [`docs/architecture/module-boundaries.md`](./docs/architecture/module-boundaries.md)
- ADRs: [`docs/adr/README.md`](./docs/adr/README.md)
- Quality baseline: [`docs/quality/README.md`](./docs/quality/README.md)
- Meta layer: [`docs/meta/README.md`](./docs/meta/README.md)
- Feature specs: [`docs/specs/`](./docs/specs)

---

## Architecture & Governance

Project intent, contributor rules, and documentation contracts live in the local repo meta layer:

- [AI_CONSTITUTION.md](./AI_CONSTITUTION.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DECISION_HIERARCHY.md](./DECISION_HIERARCHY.md)
- [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)
- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md)
- [RELEASE.md](./RELEASE.md)
- [ROADMAP.md](./ROADMAP.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- [docs/README.md](./docs/README.md)
- [docs/architecture/README.md](./docs/architecture/README.md)
- [docs/adr/README.md](./docs/adr/README.md)
- [docs/quality/README.md](./docs/quality/README.md)
- [docs/meta/README.md](./docs/meta/README.md)
- [docs/specs/README.md](./docs/specs/README.md)
- [docs/specs/repository-documentation-contract.md](./docs/specs/repository-documentation-contract.md)

The file-shape contract for `README.md`, `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, and `CONTRIBUTING.md` is defined in [docs/specs/repository-documentation-contract.md](./docs/specs/repository-documentation-contract.md).

Run the local document guard before committing:

```bash
pnpm run check:docs
```

---

## Community & Contribution

Issues and pull requests are welcome:

https://github.com/koppajs/koppajs-ui5/issues

Contributor workflow details live in [CONTRIBUTING.md](./CONTRIBUTING.md).

Community expectations live in [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

---

## License

Apache License 2.0 — © 2026 KoppaJS, Bastian Bensch
