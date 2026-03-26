# Testing Strategy

## Scope

The repository validates behavior at three levels:

- Unit tests cover pure config resolution and module registration shape.
- Integration tests cover runtime registration, real UI5 package loading, runtime application, warnings, and event alias behavior in `jsdom`.
- End-to-end tests cover the example KoppaJS application in a browser through Playwright.

## Principles

- Test documented behavior, not implementation trivia.
- Prefer the narrowest level that can prove the contract.
- Do not add placeholder tests or snapshot noise.
- Keep the example fixture focused on integration behaviors that cannot be proven reliably in `jsdom`.

## Required Coverage by Change Type

- Config defaults or normalization changes: unit tests and any affected integration tests.
- Runtime registration, package loading, or bridge changes: integration tests.
- Example application, browser behavior, or rerender stability changes: Playwright coverage.
- Tooling-only changes: validate with the affected scripts; add tests only if tooling behavior becomes part of the contract.

## Standard Validation Commands

- `pnpm run format:check`
- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run test`
- `pnpm run test:e2e`
- `pnpm run build`
