# Contributing

## Prerequisites

- Node.js `>=20`
- `pnpm >=10.24.0`

## Local Setup

```bash
pnpm install
pnpm run check
```

Run `pnpm run test:e2e` when changes affect the example fixture or browser integration behavior.

## Contribution Rules

- Keep changes focused and explicit.
- Preserve the root package export as the supported public surface.
- Do not add wrapper components or alternate tag aliases for UI5 controls.
- Update specs and docs in the same change when behavior moves.
- Regenerate and commit `src/generated/ui5-package-manifests.ts` when UI5 package manifests change.

## Pull Request Checklist

- The public contract is unchanged or explicitly documented.
- The smallest useful test coverage was added or updated.
- `README.md` and affected specs reflect the current behavior.
- `pnpm run format:check`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`, and `pnpm run build` pass locally.
- `pnpm run test:e2e` passes when browser behavior was affected.
