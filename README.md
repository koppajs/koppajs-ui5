# @koppajs/koppajs-ui5

`@koppajs/koppajs-ui5` is the official KoppaJS adapter for [UI5 Web Components](https://ui5.github.io/webcomponents/).
It keeps native `ui5-*` tags intact, loads the selected official UI5 packages, applies shared runtime configuration, and bridges explicit `onUi5...` custom-event bindings.

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

## Ownership Boundaries

- Supported public entry point: the root package export only
- Supported runtime target in `v0`: browser-based KoppaJS applications
- Example application: [`examples/basic-koppajs-app`](./examples/basic-koppajs-app), used for validation and demonstration, not as a published API

Internal files under `src/bridge/`, `src/runtime.ts`, `src/packages.ts`, and `src/generated/` are implementation details.

## Repository Classification

- Repo type: adapter package
- Runtime responsibility: browser runtime registration and UI5 bridge behavior
- Build-time responsibility: deterministic generation of committed UI5 package manifests plus library bundling
- Maturity: `v0` stabilization

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

## Runtime Defaults

- `packages`: `["main", "fiori"]`
- `runtime.theme`: `"sap_horizon"`
- `runtime.language`: derived from `document`, then `navigator`, else `"en"`
- `runtime.rtl`: derived from the document direction, else `false`
- `runtime.contentDensity`: `"cozy"`
- `bridge.ui5CustomEvents`: `true`
- `bridge.warnOnUnsupportedBindings`: `true`

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

## Ecosystem Fit

`@koppajs/koppajs-ui5` is not a replacement for `@koppajs/koppajs-components`.

- `@koppajs/koppajs-components` is a KoppaJS-native component library.
- `@koppajs/koppajs-ui5` is an integration adapter for the original UI5 Web Components ecosystem.

The package is intentionally small so upstream UI5 documentation remains useful and the adapter contract stays reviewable.

## Quality Baseline

Primary repository commands:

- `pnpm run format:check`
- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run test`
- `pnpm run test:e2e`
- `pnpm run build`

## Governance

Repository doctrine and maintenance rules live in:

- [`AI_CONSTITUTION.md`](./AI_CONSTITUTION.md)
- [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- [`DEVELOPMENT_RULES.md`](./DEVELOPMENT_RULES.md)
- [`TESTING_STRATEGY.md`](./TESTING_STRATEGY.md)
- [`DECISION_HIERARCHY.md`](./DECISION_HIERARCHY.md)
- [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- [`ROADMAP.md`](./ROADMAP.md)
- [`docs/`](./docs)

## Additional References

- Architecture boundaries: [`architecture/module-boundaries.md`](./architecture/module-boundaries.md)
- ADRs: [`adr/`](./adr)
- Feature specs: [`docs/specs/`](./docs/specs)
- Quality baseline: [`quality/README.md`](./quality/README.md)
