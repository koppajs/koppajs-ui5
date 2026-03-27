# Quality Guide

This directory captures the repository's practical quality gates.

## Verification Matrix

- Script-based checks remain the authoritative local quality gate.
- `.github/workflows/ci.yml` runs `pnpm run check` on Node 22 and 24, then runs
  `pnpm run test:e2e` on the same matrix.
- `.github/workflows/release.yml` verifies tag/package/changelog/`origin/main`
  alignment and reruns `pnpm run validate` on the maintainer default from
  `.nvmrc` before npm publish.
- Documentation contract:
  `pnpm run check:docs`
- Formatting:
  `pnpm run format:check`
- Static analysis:
  `pnpm run lint`
- Type safety:
  `pnpm run typecheck`
- Vitest unit and integration coverage:
  `pnpm run test:ci`
- Browser fixture coverage:
  `pnpm run test:e2e`
- Publishable build output:
  `pnpm run build`
- Packed payload verification:
  `pnpm run check:package`
- Tarball consumer smoke test:
  `pnpm run test:package`
- Full repository gate:
  `pnpm run check`
- Full release validation gate:
  `pnpm run validate`

## Tooling Decisions

- Husky, `lint-staged`, and `commitlint` provide lightweight commit-time
  safeguards.
- Playwright stays in this repository because the example fixture is part of
  the adapter's observable browser validation surface.
- The publish payload is verified through `npm pack --dry-run` plus a clean
  consumer install instead of relying on `files` and `exports` by inspection
  alone.
- Tagged releases are guarded against out-of-band publishes by checking the tag
  version, release notes, and branch ancestry before npm publish.
- No Stylelint: the repository does not own a standalone CSS asset surface
  that justifies an additional lint layer.

## Quality Priorities

- behavior stability over speculative adapter features
- deterministic generated manifests and reviewable publish output
- explicit package boundaries and release rules
- documentation that stays in sync with implementation and workflow

## Review Checklist

- Does the change preserve the adapter-not-wrapper boundary?
- Does it keep package loading and runtime behavior explicit?
- Does it keep `package.json`, `dist/`, and the packed payload in sync?
- Does it update the relevant specs, architecture docs, and release docs when
  the contract changes?
- Does it keep the required commands passing?
