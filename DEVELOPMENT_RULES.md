# Development Rules

## Tooling Baseline

- Use `pnpm` with the versions declared in [`package.json`](./package.json).
- Keep the current toolchain unless it fails a concrete repository need.
- Regenerate UI5 package manifests with `pnpm run generate:ui5-manifests` whenever UI5 package versions change.
- Treat package payload checks, consumer smoke checks, and release automation as part of the maintained repository baseline.

## Change Rules

- Prefer minimal edits over broad refactors.
- Keep exported names, package exports, and documented defaults stable unless a change is explicitly intentional and documented.
- Do not add wrapper components or alternate template tags for UI5 controls.
- Do not extend runtime behavior through hidden side effects; make behavior visible in types, config, and docs.
- Keep generated files deterministic and committed when they affect runtime behavior.

## Documentation Sync

- Update [`README.md`](./README.md) when the package purpose, usage, or public contract changes.
- Update [`docs/specs/`](./docs/specs) when behavior, constraints, or acceptance criteria change.
- Update [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`docs/architecture/`](./docs/architecture/), or [`docs/adr/`](./docs/adr/) when module boundaries or design rules change.
- Update [`docs/quality/README.md`](./docs/quality/README.md) and [`RELEASE.md`](./RELEASE.md) when package exports, publish payload, or repository workflows change.
- Update [`docs/meta/maintenance-checklist.md`](./docs/meta/maintenance-checklist.md) when change triggers or governance entry points move.

## Validation Rules

- Run `pnpm run format:check` after touching generated output or docs-heavy changes.
- Run `pnpm run lint` after TypeScript, script, or config changes.
- Run `pnpm run typecheck` after source edits.
- Run `pnpm run test:ci` for behavior changes.
- Run `pnpm run test:e2e` when the example fixture, runtime integration, or event bridge behavior changes.
- Run `pnpm run build` before release-oriented changes are considered complete.
- Run `pnpm run check:package` and `pnpm run test:package` after package metadata, exports, publish payload, or release workflow changes.

## Documentation Contract Rules

- `README.md`, `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, and `CONTRIBUTING.md` are governed by [docs/specs/repository-documentation-contract.md](./docs/specs/repository-documentation-contract.md).
- If one of those files changes shape, update the spec and `scripts/check-doc-contract.mjs` in the same change.
- Keep official KoppaJS branding, logo usage, and closing governance sections consistent across the governed root documents.
