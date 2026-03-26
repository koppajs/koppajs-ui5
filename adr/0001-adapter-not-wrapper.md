# ADR 0001: Keep the Package as an Adapter, Not a Wrapper Library

## Status

Accepted

## Context

UI5 Web Components already define the component contracts, design system behavior, theming, and events.
KoppaJS needs integration support for package loading, runtime configuration, and declarative event bridging, but it does not need a second component API for the same controls.

## Decision

`@koppajs/koppajs-ui5` remains an adapter package that preserves native `ui5-*` tags.
The package will not add wrapper components, alias tags, or a mirrored component catalog unless real usage proves a missing contract that cannot be solved at the bridge layer.

## Consequences

- The public surface stays small.
- UI5 upstream documentation remains directly useful to consumers.
- Integration behavior is explicit and easier to stabilize.
- Some convenience features are intentionally deferred in favor of predictability.
