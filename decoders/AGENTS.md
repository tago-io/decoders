# decoders/

Payload decoder catalog. Cross-cutting repo rules (git, CI, PRs) are in the [root AGENTS.md](../AGENTS.md).

## Layout

| Path | Role |
|------|------|
| `network/<slug>/` | LoRaWAN stack, MQTT broker, HTTP ingress, etc. Runs before connector decoders. |
| `connector/<manufacturer>/<device>/` | Device-specific parsing into TagoIO variables. |

Each decoder folder has `network.jsonc` or `connector.jsonc` (catalog entry), optional `connector_details.jsonc` (parameters, linked networks, copy), `v<semver>/payload.ts`, and `assets/`.

## Before you edit

1. Read the manifest `name` and `versions` map so you touch the right SemVer folder.
2. For connectors, read `connector_details.jsonc`: `device_parameters`, `networks` paths, and `description` / `install_text` (must stay factual).
3. Skim existing `payload.test.ts` in that version folder for variable names and fPort patterns.

## Runtime (platform vs local tests)

- Decoder entrypoint mutates global `payload` (array of `{ variable, value, ... }`).
- Local tests use `decoderRun(path, { payload })` from `src/functions/decoder-run.ts` (VM2). Results can differ slightly from production VM.
- `moment` is injected in tests; platform may expose `moment`, `dayjs`, or `loraPacket` per `global.d.ts`.

## Commands

```bash
# Replace PATH with the decoder directory you are changing
pnpm test -- PATH/v1.0.0/payload.test.ts
pnpm start validator
```

## Rules

1. Breaking changes to output variables or types require a new SemVer folder; do not silently change `v1.0.0` behavior in place.
2. Add a shall-not-pass test when the decoder must leave unrelated payloads untouched (README template).
3. Every `networks` entry in `connector_details.jsonc` must resolve to a file under `decoders/network/`.
4. Do not commit customer-identifying bytes in fixtures; use synthetic payloads.
5. `oxlint` ignores `decoders/**/v1.0.0/*.ts` paths listed in `.oxlintrc.json`; `payload.ts` at version root still gets relaxed rules via overrides. `oxfmt` does not format `decoders/**` yet.