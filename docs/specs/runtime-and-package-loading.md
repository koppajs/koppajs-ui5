# Runtime And Package Loading

## description

Load the selected official UI5 packages and apply shared UI5 runtime configuration exactly once per effective configuration state.

## inputs

- `CoreCtx`
- `KoppajsUi5ResolvedConfig`
- Generated loader definitions from `src/generated/ui5-package-manifests.ts`

## outputs

- Registered KoppaJS `created` hook
- Loaded UI5 custom elements for the requested packages
- Applied UI5 runtime state for theme, language, RTL, content density, and optional theme root

## behavior

- Keeps singleton runtime state for the current adapter process.
- Registers the `created` hook once.
- Loads requested packages lazily through generated import lists.
- Applies document hints and UI5 runtime settings from the resolved config.
- Merges repeated registrations by unioning package sets while preserving the first runtime and assets settings.
- Warns once when later registrations conflict with already-active runtime settings or `assets.baseUrl`.

## constraints

- Package loading depends on the committed generated manifest map.
- Runtime conflicts are resolved by first-writer-wins behavior, not by silent last-write overrides.
- Runtime configuration targets browser environments and uses public UI5 runtime configuration entry points already adopted by the package.

## edge_cases

- Repeated registration with the same effective config is idempotent.
- Package load failures clear the cached load promise for that package so retries remain possible.
- Non-browser environments skip document-specific application steps where browser globals are absent.

## acceptance_criteria

- Requested UI5 custom elements become registered after runtime readiness completes.
- Theme, language, RTL, and content-density hints match the effective resolved config.
- Repeated registration does not duplicate hook registration.
- Conflicting runtime overrides warn and preserve the first active runtime settings.

## evolution_phase

`v0` stabilization

## completeness_level

Implemented and covered by integration tests for package loading, runtime application, and repeated registration semantics.

## known_gaps

- `assets.baseUrl` is intentionally conservative and currently maps through the public UI5 theme-root API only.
- SSR is not a supported runtime contract.

## deferred_complexity

- More granular runtime reconciliation beyond first-writer-wins behavior
- Broader asset remapping if UI5 exposes a stable public API for it

## technical_debt_items

- Add explicit automated coverage for package-load rejection behavior when the repository starts exercising failure injection as part of maintenance.
