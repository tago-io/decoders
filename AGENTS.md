# tago-io/decoders

Public catalog of TagoIO network and connector payload decoders. Contributors add decoders under `decoders/`; maintainers run tooling in `src/` to validate manifests and build `decoders.db` for releases.

Human contributor guide: [README.md](./README.md).

## Structure

```
decoders/                     Decoder catalog (see decoders/AGENTS.md)
schema/                       JSON schemas for manifests (network.json, connector.json, details)
src/                          Build, validate, and test harness (see src/AGENTS.md)
```

Manifests are JSONC (`network.jsonc`, `connector.jsonc`, per-version `manifest.jsonc`). Decoder source per version is TypeScript (`payload.ts`) compiled to JS for the platform.

## Commands

```bash
corepack enable
corepack prepare pnpm@11.5.0 --activate   # or: corepack use pnpm@11.5.0
pnpm install
pnpm run check          # oxlint + oxfmt --check
pnpm run typecheck      # tsc --noEmit (src/ + schema/types.ts)
pnpm run ci             # check + typecheck + test + validator
pnpm run linter         # oxlint only
pnpm run format:fix     # oxfmt --write (src/, schema/, configs; not decoders/** yet)
pnpm test               # Vitest (all decoder + src tests)
pnpm start validator    # Validate every manifest against schema/
pnpm start generate     # Build data/decoders.db (release path)
```

Package manager: **pnpm 11.5.0** (`packageManager` in `package.json`). Project settings and **dependency version pins** live in `pnpm-workspace.yaml` (`catalog:` + `allowBuilds`, etc.). Root `package.json` devDependencies use the `catalog:` protocol; bump versions in the `catalog` block, then `pnpm install`. Requires **Node.js 24+** (native TypeScript execution for `pnpm start`; no `tsx`). Do not use npm; do not commit `package-lock.json`. CI: `pnpm/action-setup` + `pnpm install` (frozen lockfile is automatic in CI).

CI runs linter, test, validator on every push and PR. `generate` runs after those pass.

## Git conventions

Branches: `type/description` in kebab-case. Types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`. Example: `feat/abeeway-compact-tracker`.

Commits: conventional commits with scope, e.g. `feat(connector/abeeway): add compact tracker v1.0.0`. Subject under 72 characters, lowercase, no trailing period.

PR titles: human-readable changelog lines, not conventional commits. Capitalize the first word. Example: `Add Abeeway compact tracker decoder`.

PR bodies: canonical section order in `.github/PULL_REQUEST_TEMPLATE.md` (Summary, Test plan, `Closes #N`). No ISO27001 or CIA fields; this is a public OSS repo.

Issues for this repo belong on the [Decoders project (56)](https://github.com/orgs/tago-io/projects/56) when filed through org workflow. Fields: Priority, Category, Source, Manufacturer, Target Release.

Never in git artifacts: `Co-Authored-By`, AI attribution, personal email addresses (use `@tago.io` work email for org repos).

## Decoder contribution rules

1. New decoder code is TypeScript with Vitest unit tests beside the version folder (`payload.test.ts` or shared test pattern in README).
2. Add a "shall not pass" test when the decoder must ignore payloads outside its scope (see README template).
3. Version folders use [SemVer](https://semver.org/). One `payload.ts` (and built `payload.js` if present) per version directory.
4. `description`, `install_text`, and `device_annotation` in details manifests must be factual. No subjective marketing ("best sensor") and no links outside TagoIO scope.
5. Image dimensions: network banner 1500x375, icon 64x64, logo 443x160; connector logo 443x625 or 443x443 (see README).
6. Connector `networks` paths in `connector_details.jsonc` must point at real network decoder files in this repo.
7. Do not edit generated `data/decoders.db` in contributor PRs unless a maintainer is cutting a release.

## Tooling conventions

- TypeScript `strict: true` in `tsconfig.json`.
- Lint/format: OXC (`oxlint` + `oxfmt`; `.oxlintrc.json`, `.oxfmtrc.json`). Line width 180 in this repo (overrides org default 120 for decoder tree volume). `oxfmt` currently ignores `decoders/**` (manifest jsonc trailing-comma delta vs Biome); run a dedicated reformat before removing that ignore.
- Tests: Vitest. `decoderRun()` in `src/functions/decoder-run.ts` uses VM2 for local runs only; platform VM may differ slightly.
- Global `payload` in decoder scripts is intentional; oxlint declares it in `.oxlintrc.json` `globals`.

## Safety

- Never commit secrets, tokens, or customer payloads with identifiable data in tests. Use synthetic fixtures.
- Never force-push to `main`.
- Do not add `.github/instructions/`; repo rules live in `AGENTS.md` at repo root, `decoders/`, and `src/` only (not per-device copies).
