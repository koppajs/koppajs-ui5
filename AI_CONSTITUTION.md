# AI Constitution

## Scope

This repository publishes `@koppajs/koppajs-ui5`, the official KoppaJS adapter for UI5 Web Components.
It is an integration package, not a wrapper library and not a UI component fork.

## Binding Rules

- Keep the public surface explicit and small. The published entry point is [`src/index.ts`](./src/index.ts) through the root package export only.
- Preserve native `ui5-*` tags as the template API. Do not introduce alias components, wrapper components, or a parallel KoppaJS-specific UI5 component set.
- Prefer explicit warnings and documented escape hatches over implicit coercion or silent fallbacks.
- Runtime behavior must stay deterministic. Repeated registration may merge package loading, but conflicting runtime settings must keep first-writer-wins behavior and warn once.
- Treat the browser runtime as the supported target in `v0`. Do not claim SSR support without implementation, specs, and tests.
- Use committed generated artifacts for UI5 package loading. Generation must be reproducible and should not introduce timestamp-only diffs.
- Update documentation, specs, and tests in the same change whenever public behavior or documented constraints move.
- Respect existing boundaries: `config` resolves inputs, `module` exposes the adapter contract, `runtime` applies shared state, `packages` loads UI5 packages, and `bridge/*` handles integration edges.

## Non-Goals

- No wrapper API for every UI5 control.
- No speculative abstraction for future frameworks or renderers.
- No silent public API changes.
- No tooling expansion without a concrete repository problem.

## Change Standard

- Prefer the smallest change that restores consistency.
- If code and docs disagree, fix the incorrect side and record the decision in specs or ADRs when the choice affects future work.
- Any change to adapter behavior must be backed by meaningful tests at the narrowest useful scope.
