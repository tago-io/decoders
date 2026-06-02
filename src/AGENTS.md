# src/

Node tooling: manifest validation, SQLite database generation, and the `decoderRun` test harness used by decoder unit tests.

## Layout

```
functions/     CLI entrypoints (validator, generate-database)
helpers/       File IO, TS build step, ID generation, network/connector builders
validator/     Zod/AJV validation for manifests and integration parameters
database/      Knex/SQLite schema for decoders.db
main.ts        Dispatches `validator` or `generate` from argv
```

## Conventions

- ESM imports with `node:` protocol for built-ins; relative imports use explicit `.ts` / `.json` extensions (`moduleResolution: nodenext`).
- `pnpm start` runs `src/main.ts` via Node 24+ native TypeScript (no `tsx`).
- Named exports; avoid new default exports.
- Exported functions in this tree should have explicit return types.
- Prefer `const` and `??` / `?.` over manual null checks.
- `decoder-run.ts` keeps dual CJS/ESM export for Vitest compatibility; do not remove without updating all decoder tests.

## Commands

```bash
pnpm test                          # from repo root; includes src/**/*.test.ts
pnpm run check                     # oxlint + oxfmt --check
pnpm run linter                    # oxlint only; v1.0.0 payload.ts paths ignored per .oxlintrc.json
pnpm start validator
pnpm start generate
```

## Rules

1. Validator changes must update or extend tests in `src/validator/*.test.ts`.
2. Schema changes in `schema/*.json` require running `pnpm start validator` and fixing any broken manifests in the same PR.
3. `generate-database` output path is `data/decoders.db`; do not change without coordinating release workflow (`.github/workflows/deploy.yml`).
