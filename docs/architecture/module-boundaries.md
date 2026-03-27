# Module Boundaries

## Source Modules

- `src/config.ts`
  Resolves and normalizes consumer configuration. No side effects.
- `src/module.ts`
  Exposes the KoppaJS module factory and install convenience wrapper. No package loading logic.
- `src/runtime.ts`
  Owns singleton runtime state, repeated registration behavior, UI5 runtime application, and hook registration.
- `src/packages.ts`
  Loads selected UI5 packages through the generated manifest map. No KoppaJS logic.
- `src/bridge/ui5-events.ts`
  Resolves `onUi5...` aliases, patches event listener registration once, and observes host attributes.
- `src/bridge/warnings.ts`
  Warns once when declarative attribute bindings target unstable JS-only UI5 properties.
- `src/bridge/ui5-metadata.ts`
  Provides small metadata helpers used by bridge modules.
- `src/generated/ui5-package-manifests.ts`
  Contains committed import lists generated from installed UI5 package manifests. Do not hand-edit.

## Repository Boundaries

- `examples/`
  Example fixture for manual and Playwright validation. Not part of the published package.
- `tests/`
  Contract verification only.
- `scripts/`
  Build-support scripts. These may generate committed artifacts but should not change runtime semantics implicitly.
