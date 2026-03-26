# Quality Baseline

## Repository Checks

- `pnpm run format:check`
  Verifies repository formatting, including generated artifacts.
- `pnpm run lint`
  Verifies static code quality for TypeScript and support scripts.
- `pnpm run typecheck`
  Verifies authoring-time TypeScript correctness.
- `pnpm run test`
  Verifies unit and integration behavior.
- `pnpm run test:e2e`
  Verifies browser behavior through the example fixture.
- `pnpm run build`
  Regenerates manifests, builds the library bundles, and emits declarations.

## Quality Rules

- Generated files must be deterministic and committed when they affect runtime behavior.
- Ignore files should cover only reproducible outputs and local caches.
- Tooling should stay small and justified by a concrete repository need.
