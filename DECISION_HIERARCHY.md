# Decision Hierarchy

When repository artifacts disagree, resolve conflicts in this order:

1. Source code and exported TypeScript types in [`src/`](./src)
2. Executable tests in [`tests/`](./tests)
3. Feature specifications in [`docs/specs/`](./docs/specs)
4. Architecture rules in [`ARCHITECTURE.md`](./ARCHITECTURE.md) and [`adr/`](./adr)
5. Maintainer workflow documents such as [`DEVELOPMENT_RULES.md`](./DEVELOPMENT_RULES.md) and [`TESTING_STRATEGY.md`](./TESTING_STRATEGY.md)
6. User-facing summary docs such as [`README.md`](./README.md) and [`CONTRIBUTING.md`](./CONTRIBUTING.md)
7. Future intent in [`ROADMAP.md`](./ROADMAP.md)

## Resolution Rules

- If code and tests agree but docs disagree, update the docs.
- If docs describe a better contract than the implementation provides, either fix the implementation and tests or narrow the docs immediately.
- Do not treat roadmap items as current behavior.
- Record lasting architectural choices in ADRs when they affect future repository alignment.
