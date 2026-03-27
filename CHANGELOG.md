# Change Log

All notable changes to **@koppajs/koppajs-ui5** are documented in this file.

This project uses a **manual, tag-driven release process**.
Tagged versions represent official milestones.

This changelog documents **intentional milestones and guarantees**,
not every internal refactor.

---

## [Unreleased]

This section tracks changes merged after the latest tag.

---

## [0.1.0] - 2026-03-27

- initial `@koppajs/koppajs-ui5` release
- added public config API with `resolveKoppajsUi5Config`, `createKoppajsUi5Module`, and `installKoppajsUi5`
- added official package loading for UI5 `main`, `fiori`, `compatibility`, and `ai`
- added runtime application for theme, language, RTL, and content density
- added `onUi5...` custom-event bridge and unsupported-binding warnings
- added unit, integration, and browser-fixture coverage plus a runnable example app
- added the repository documentation contract, governed root docs, and local `check:docs`/pre-commit enforcement
- added CI automation for `pnpm run check` and `pnpm run validate`
