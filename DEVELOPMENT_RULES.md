# Development Rules

## Tooling Baseline

- Use `pnpm` with the versions declared in [`package.json`](./package.json).
- Keep the current toolchain unless it fails a concrete repository need.
- Regenerate UI5 package manifests with `pnpm run generate:ui5-manifests` whenever UI5 package versions change.

## Change Rules

- Prefer minimal edits over broad refactors.
- Keep exported names, package exports, and documented defaults stable unless a change is explicitly intentional and documented.
- Do not add wrapper components or alternate template tags for UI5 controls.
- Do not extend runtime behavior through hidden side effects; make behavior visible in types, config, and docs.
- Keep generated files deterministic and committed when they affect runtime behavior.

## Documentation Sync

- Update [`README.md`](./README.md) when the package purpose, usage, or public contract changes.
- Update [`docs/specs/`](./docs/specs) when behavior, constraints, or acceptance criteria change.
- Update [`ARCHITECTURE.md`](./ARCHITECTURE.md) or ADRs when module boundaries or design rules change.

## Validation Rules

- Run `pnpm run format:check` after touching generated output or docs-heavy changes.
- Run `pnpm run lint` after TypeScript, script, or config changes.
- Run `pnpm run typecheck` after source edits.
- Run `pnpm run test` for behavior changes.
- Run `pnpm run test:e2e` when the example fixture, runtime integration, or event bridge behavior changes.
- Run `pnpm run build` before release-oriented changes are considered complete.
