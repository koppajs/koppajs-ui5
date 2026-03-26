# Unsupported Binding Warnings

## description

Warn once when declarative attribute bindings target UI5 properties that do not have stable attribute-based support.

## inputs

- UI5 custom elements
- Attribute writes performed through `Element.prototype.setAttribute`
- UI5 property metadata for the target element

## outputs

- Console warnings describing the unsupported declarative binding

## behavior

- Installs a one-time patch over `Element.prototype.setAttribute`.
- Checks UI5 metadata to determine whether the target property supports attribute binding.
- Warns once per element-tag and attribute-name pair.
- Suppresses warnings when `bridge.warnOnUnsupportedBindings` is `false`.
- Limits the warning scope to UI5 elements before connection so runtime updates on live elements do not produce repeated noise.

## constraints

- Warnings are advisory only; the adapter does not attempt hidden coercion for complex values.
- Complex `Object` and `Array` properties are treated as unstable declarative bindings in `v0`.

## edge_cases

- Non-UI5 elements never trigger this warning path.
- Unknown attributes that do not map to a UI5 property do not warn.
- Repeated writes to the same unsupported attribute warn once.

## acceptance_criteria

- Unsupported UI5 properties such as complex JS-only bindings produce a single warning.
- Supported primitive or stringifiable attribute bindings do not warn.
- Disabling the warning feature suppresses the warning path cleanly.

## evolution_phase

`v0` stabilization

## completeness_level

Implemented and covered by integration tests for representative unsupported property bindings.

## known_gaps

- The warning path does not attempt deep type validation of serialized values.
- The current behavior documents an escape hatch through refs instead of offering declarative support for every property shape.

## deferred_complexity

- Richer diagnostics describing expected value shapes
- Opt-in adapters for specific high-value complex properties if real usage justifies them

## technical_debt_items

- Consider whether warning messages should eventually link to a stable troubleshooting document once the package has broader adoption.
