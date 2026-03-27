# Meta Layer Guide

`docs/meta/` holds supporting material for maintaining the repository's meta
layer.

Key files in this directory:

- `README.md` for the meta-layer support overview
- `maintenance-checklist.md` for update triggers
- `repository-audit.md` for the latest audit snapshot

## Current Repository Snapshot

- The package is a published TypeScript adapter with one public root entry
  point in `src/index.ts`.
- Tests cover config resolution, runtime registration, UI5 bridge behavior, and
  a browser-backed example fixture.
- GitHub Actions mirror the local quality gate and tagged release flow.
- Package distribution is protected by dry-run payload verification and a clean
  consumer smoke test.
- Tagged releases are also guarded against version/changelog/main-branch drift
  before publish.
- The repository standard aligns with other current KoppaJS package repos under
  `docs/{adr,architecture,meta,quality,specs}`.

## Why The Meta Layer Exists

- to keep architecture memory close to a fast-moving package
- to make public behavior and release rules explicit before future growth
- to help AI and human contributors converge on the same local rules
- to ensure workflow and governance evolve with the real code instead of
  becoming an afterthought

## Maintenance Rule

Whenever this repository gains a new subsystem, architectural pattern, public
contract, package rule, or quality gate, update the relevant meta documents in
the same change.
