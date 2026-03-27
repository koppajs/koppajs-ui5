# Maintenance Checklist

Use this checklist when a change affects more than one repository layer.

## Change Triggers

- Public adapter behavior changed:
  update `README.md`, affected files in `docs/specs/`, relevant tests, and
  `ARCHITECTURE.md` when boundaries move.
- Module split or runtime flow changed:
  update `ARCHITECTURE.md`, `docs/architecture/`, and any affected ADRs.
- Package metadata, exports, or publish payload changed:
  update `README.md`, `RELEASE.md`, `docs/quality/README.md`,
  `package.json`, and package-verification scripts.
- CI, hook, or contributor workflow changed:
  update `CONTRIBUTING.md`, `DEVELOPMENT_RULES.md`,
  `docs/quality/README.md`, and this file.
- Governance structure or documentation entry points changed:
  update `docs/README.md`, `docs/meta/README.md`,
  `DECISION_HIERARCHY.md`, and the affected root docs.

## Final Check

Before merging a structural change, confirm that:

- the highest-priority document was updated first
- lower-priority docs still match it
- the relevant local commands were rerun
- the latest repository audit still describes the actual state
