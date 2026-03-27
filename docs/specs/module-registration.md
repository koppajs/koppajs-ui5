# Module Registration

## description

Expose the KoppaJS adapter through an explicit module factory and a convenience install helper.

## inputs

- `KoppajsUi5ConfigInput | undefined`
- KoppaJS `Core` and module install context at runtime

## outputs

- `createKoppajsUi5Module()` returns a KoppaJS-compatible module object with resolved config attached.
- `installKoppajsUi5()` registers that module through `Core.take(...)`.

## behavior

- Resolves config eagerly when the module is created.
- Returns a module named `"koppajsUi5"`.
- Registers runtime behavior during `install(ctx)`.
- Observes `onUi5...` attributes during `attach()` for the host element.
- Exposes the resolved config through the returned module object and attach payload.

## constraints

- The public entry point remains the root package export.
- `installKoppajsUi5()` is only a convenience wrapper and must not diverge from `createKoppajsUi5Module()`.
- Module creation does not itself load UI5 packages; runtime registration handles that.

## edge_cases

- Calling the convenience install helper multiple times is allowed, but runtime conflict rules apply during registration.
- Empty or omitted config input resolves to the documented defaults.

## acceptance_criteria

- The returned module is compatible with KoppaJS `Core.take(...)`.
- The module name and exported function names stay stable unless a documented breaking change is introduced.
- `installKoppajsUi5()` delegates to `Core.take(createKoppajsUi5Module(...))`.

## evolution_phase

`v0` stabilization

## completeness_level

Implemented and covered by unit tests for module shape and convenience installation.

## known_gaps

- The published module type remains intentionally small and depends on the upstream `IModule` contract.

## deferred_complexity

- Additional helper APIs for alternate registration styles

## technical_debt_items

- Revisit whether the attach payload needs formal documentation outside the module type if consumers start depending on it directly.
