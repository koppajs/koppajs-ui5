# Config Resolution

## description

Normalize consumer-supplied adapter configuration into a fully resolved internal configuration object.

## inputs

- `KoppajsUi5ConfigInput | undefined`
- Ambient `document` language and direction values when present
- Ambient `navigator` language values when present

## outputs

- `KoppajsUi5ResolvedConfig`

## behavior

- Defaults `packages` to `["main", "fiori"]`.
- Deduplicates package identifiers while preserving declaration order.
- Defaults `runtime.theme` to `"sap_horizon"`.
- Defaults `runtime.language` from `document`, then `navigator`, then `"en"`.
- Defaults `runtime.rtl` from the document direction, else `false`.
- Defaults `runtime.contentDensity` to `"cozy"`.
- Trims `assets.baseUrl` and drops empty strings.
- Defaults `bridge.ui5CustomEvents` and `bridge.warnOnUnsupportedBindings` to `true`.

## constraints

- Only the documented package names are supported.
- Resolution is pure with respect to its input plus ambient browser language and direction state.
- The resolved config shape is the source of truth for runtime registration.

## edge_cases

- Empty package arrays fall back to the default package set.
- Duplicate package names do not produce duplicate loads.
- Missing browser globals in non-browser contexts fall back to `"en"` and `false`.
- Whitespace-only strings are treated as absent values.

## acceptance_criteria

- Calling `resolveKoppajsUi5Config()` returns a fully populated config object.
- Explicit overrides replace defaults without widening the public contract.
- Returned packages are unique and stable in order.
- Default language and direction behavior matches the implemented browser fallbacks.

## evolution_phase

`v0` stabilization

## completeness_level

Implemented and covered by unit tests for defaults and explicit overrides.

## known_gaps

- The API does not validate package names beyond the TypeScript contract.
- Language and RTL derivation are browser-oriented and not an SSR contract.

## deferred_complexity

- Schema-level runtime validation for untyped consumers
- Environment-specific default strategies beyond browser globals

## technical_debt_items

- Consider adding explicit compatibility guidance for non-TypeScript consumers if that becomes a real support need.
