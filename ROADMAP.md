# Roadmap

## Current State

The repository is in `v0` stabilization.
The core adapter contract is implemented, documented, and validated for browser-focused KoppaJS applications using official UI5 Web Components.

## Near-Term Work

- Keep the public contract narrow and stable while real adoption feedback accumulates.
- Strengthen coverage around package-loading failure paths and asset-root conflict behavior when those cases become active maintenance issues.
- Document version compatibility policy with `@koppajs/koppajs-core` and the supported UI5 package set more explicitly as release cadence becomes clearer.
- Make the SSR position explicit through either implementation plus tests or a maintained non-support statement.

## Deferred Until Proven Necessary

- Generic declarative support for arbitrary object, array, or function-valued UI5 properties
- Alternate component naming schemes or wrapper APIs
- Additional tooling layers beyond the current build, lint, test, and example-fixture workflow

## Planning Rule

New roadmap items should come from confirmed product usage, maintenance pain, or release requirements.
Speculative architecture work does not qualify on its own.
