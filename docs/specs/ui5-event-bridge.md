# UI5 Event Bridge

## description

Translate explicit `onUi5...` listener aliases into the actual kebab-case UI5 custom event names and keep declarative host bindings connected across rerenders.

## inputs

- UI5 custom elements present in an attached host subtree
- Event listener registrations using `ui5<EventAlias>` event names
- Declarative attributes such as `onUi5SelectionChange="handlerName"`

## outputs

- Native event listeners bound to the actual UI5 event names
- One-time warnings for unresolved aliases on real UI5 elements

## behavior

- Resolves aliases by reading UI5 metadata from the target custom element constructor.
- Patches `addEventListener` and `removeEventListener` once to translate `ui5...` event names into real event types.
- Observes host subtree mutations and attribute changes so declarative `onUi5...` bindings stay attached.
- Looks up handlers on the KoppaJS component instance `userContext` and `methods`.
- Disables bridge behavior when `bridge.ui5CustomEvents` is `false`.

## constraints

- Only real UI5 custom elements are eligible for alias resolution.
- Aliases must use the explicit `onUi5<EventName>` convention.
- Bridge behavior should not interfere with native DOM event names such as `click`, `input`, or `change`.

## edge_cases

- Unknown alias names warn once per element tag and alias pair.
- Empty handler attribute values remove any previously attached listener for the same alias.
- Handler names that no longer resolve on the host instance remove any previously attached listener for the same alias.
- Existing bindings are replaced only when the resolved event type or handler changes.
- Detached hosts do not bind listeners until connected.

## acceptance_criteria

- Known aliases such as `selection-change` and `value-state-change` resolve correctly.
- Declarative `onUi5...` bindings survive host rerender cycles.
- Clearing or invalidating a declarative `onUi5...` handler removes the stale listener.
- Disabling the bridge prevents alias resolution without affecting native events.

## evolution_phase

`v0` stabilization

## completeness_level

Implemented and covered by integration and end-to-end tests for representative UI5 custom events.

## known_gaps

- The bridge relies on runtime metadata from UI5 custom elements and therefore only works after those elements are loaded.

## deferred_complexity

- Broader event binding conventions beyond the explicit `onUi5...` form
- Automatic discovery of handler references outside current KoppaJS instance conventions

## technical_debt_items

- Extend attribute rebinding coverage beyond clear-and-replace cycles if the adapter starts seeing regressions in more complex rerender patterns.
