# ADR 0002: Commit Deterministic UI5 Package Manifests

## Status

Accepted

## Context

The adapter must load the requested official UI5 packages before meaningful use.
Deriving the import list at runtime would hide behavior and make published output depend on the consumer environment.

## Decision

The repository generates `src/generated/ui5-package-manifests.ts` from installed UI5 package manifests and commits the result.
The generator output must be deterministic and formatter-safe so repository validation stays stable and diffs remain reviewable.

## Consequences

- Package loading behavior is visible in source control.
- UI5 dependency upgrades require a deliberate regeneration step.
- Generated output is part of the repository contract even though it is not hand-authored.
