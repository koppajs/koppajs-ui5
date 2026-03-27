# Repository Audit Snapshot

- Audit date: 2026-03-27
- Scope: repository standard alignment for `@koppajs/koppajs-ui5`

## Current State

- Documentation is organized under `docs/{adr,architecture,meta,quality,specs}`.
- Release automation is defined through `RELEASE.md` and
  `.github/workflows/release.yml`.
- Release automation now rejects tags whose version, changelog entry, or branch
  ancestry does not match the documented flow.
- The local quality gate includes payload verification through
  `pnpm run check:package` and tarball smoke coverage through
  `pnpm run test:package`.
- Commit-time safeguards run through Husky, `lint-staged`, and `commitlint`.
- The UI5 bridge behavior is covered for declarative rebinding edge cases.

## Remaining Intentional Gaps

- Version-compatibility policy with future `@koppajs/koppajs-core` releases is
  still documented only at a high level in `README.md` and `ROADMAP.md`.
- The repository remains in `v0` stabilization, so standards should favor
  explicitness and reviewability over convenience features.
