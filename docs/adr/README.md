# Architecture Decision Records

This directory holds package-local ADRs for decisions that are specific to
`@koppajs/koppajs-ui5`.

## When To Write A Local ADR

Write an ADR when a change materially affects:

- public API compatibility strategy
- architectural boundaries or source layout
- runtime dependencies or supported environments
- packaging, release, or generated-artifact rules
- the adapter lifecycle, bridge model, or UI5 ownership boundary

Do not duplicate broader ecosystem decisions unnecessarily. Add a local ADR
when this package has package-specific consequences that must stay visible.

## Required ADR Structure

Every ADR must contain these sections:

- Status
- Context
- Decision
- Consequences

## Naming

- Use zero-padded numeric prefixes such as `0001-short-title.md`.
- Keep titles short and decision-focused.
- Update repository docs that reference ADRs when new decisions are added.
