<br/>
<p align="center">
  <img src="https://assets.tago.io/tagoio/tagoio.png" width="200px" alt="TagoIO"></img>
</p>

# TagoIO Decoders

Open-source catalog of IoT payload decoders for LoRaWAN, MQTT, Sigfox, and device connector codecs on the TagoIO platform.

---

To help you get started, watch the [video tutorial on adding a new decoder](https://www.youtube.com/watch?v=7ejN2q0YWo0).

## What it is

Decoders are scripts that parse raw payloads from IoT devices and network servers into the TagoIO data format. This repository organizes them by network (LoRaWAN stack, MQTT broker, HTTP ingress) and connector (manufacturer and device model).

## Folder structure

```
decoders/
  network/<slug>/                Network decoder (runs before connector decoders)
    network.jsonc                Catalog entry
    assets/                      Banner, icon, logo images
    v1.0.0/
      manifest.jsonc             Version details
      payload.ts                 Decoder source (TypeScript)
      payload.js                 Built output for the platform
      payload.test.ts            Vitest unit tests

  connector/<manufacturer>/<device>/
    connector.jsonc              Catalog entry
    connector_details.jsonc      Parameters, linked networks, description
    description.md               Long description (searchable on TagoIO)
    assets/                      Logo image
    v1.0.0/
      payload-config.jsonc       Version details
      payload.ts                 Decoder source (TypeScript)
      payload.js                 Built output for the platform
      payload.test.ts            Vitest unit tests

schema/                          JSON schemas for all manifest types
src/                             Build, validate, and test harness
```

## Setup

Requires **Node.js 24+** and **pnpm 11**. Dev dependency versions are pinned in the `catalog` block of `pnpm-workspace.yaml`.

```bash
corepack enable
corepack use pnpm@11.5.0
pnpm install
```

## Manifests

Manifests are JSONC files that describe each decoder and its versions. The JSON schemas in `schema/` validate them.

### Network decoders

- **Manifest:** `network.jsonc` (schema: [`network.json`](./schema/network.json))
- **Version details:** `v<semver>/manifest.jsonc` (schema: [`network_details.json`](./schema/network_details.json))
- **Images:** banner 1500x375, icon 64x64, logo 443x160

### Connector decoders

- **Manifest:** `connector.jsonc` (schema: [`connector.json`](./schema/connector.json))
- **Version details:** `v<semver>/payload-config.jsonc` (schema: [`connector_details.json`](./schema/connector_details.json))
- **Images:** logo 443x625 or 443x443

### Example: connector manifest

```jsonc
{
  "$schema": "../../../../schema/connector.json",
  "name": "Abeeway Compact Tracker",
  "images": {
    "logo": "./assets/logo.png",
  },
  "versions": {
    "v1.0.0": {
      "src": "./v1.0.0/payload.js",
      "manifest": "./v1.0.0/payload-config.jsonc",
    },
  },
}
```

### Example: connector details

The fields `description`, `install_text`, and `device_annotation` must be factual. No subjective claims and no links outside the scope of TagoIO.

```jsonc
{
  "$schema": "../../../../schema/connector_details.json",
  "description": "./description.md",
  "install_text": "**Compact tracker**\n\nMulti-mode tracker with embedded sensors combining GPS, Low-power GPS, Wi-Fi Sniffer, BLE",
  "device_annotation": "",
  "device_parameters": [],
  "networks": [
    "../../../../network/lorawan-actility/v1.0.0/payload.js",
    "../../../../network/lorawan-chirpstack/v1.0.0/payload.js",
    "../../../../network/lorawan-ttn/v1.0.0/payload.js",
  ],
}
```

Every path in the `networks` array must point at a real file under `decoders/network/`.

## Adding a new decoder

### Network decoder

1. Create a folder under `decoders/network/` named after your network.
2. Add a `network.jsonc` following [`network.json`](./schema/network.json).
3. Create a version folder (`v1.0.0/`) with a `manifest.jsonc` following [`network_details.json`](./schema/network_details.json).
4. Write the decoder in `payload.ts` and build `payload.js`.
5. Add unit tests in `payload.test.ts`.

### Connector decoder

1. Create a folder under `decoders/connector/<manufacturer>/<device>/`.
2. Add a `connector.jsonc` following [`connector.json`](./schema/connector.json).
3. Create a version folder (`v1.0.0/`) with a `payload-config.jsonc` following [`connector_details.json`](./schema/connector_details.json).
4. Write the decoder in `payload.ts` and build `payload.js`.
5. Add unit tests in `payload.test.ts`.

Version folders use [SemVer](https://semver.org/). Breaking changes to output variables or types require a new version folder.

## Testing

### Unit tests

Tests use Vitest and the `decoderRun()` helper from `src/functions/decoder-run.ts`, which executes decoders in a local VM.

```bash
pnpm test                                        # all tests
pnpm test -- decoders/connector/abeeway/compact-tracker/v1.0.0/payload.test.ts  # single decoder
```

### Non-decoding test ("shall not pass")

Every decoder that must ignore payloads outside its scope needs a test proving it leaves unrelated data untouched:

```typescript
import { describe, expect, test, beforeEach } from "vitest";
import { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../src/functions/decoder-run";

const file_path = "decoders/connector/your-manufacturer/your-device/v1.0.0/payload.ts";

let payload: DataToSend[] = [];

describe("Shall not be parsed", () => {
  beforeEach(() => {
    payload = [{ variable: "shallnotpass", value: "04096113950292" }];
  });
  payload = decoderRun(file_path, { payload });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "shallnotpass", value: "04096113950292" }]);
  });
});
```

## Validation and build

Run these before submitting a PR:

```bash
pnpm run check        # oxlint + oxfmt --check
pnpm test             # all unit tests
pnpm start validator  # validate manifests against schema/
```

Maintainers building a release also run:

```bash
pnpm start generate   # build data/decoders.db
```

All commands:

| Command                | What it does                            |
| ---------------------- | --------------------------------------- |
| `pnpm run check`       | Lint (oxlint) and format check (oxfmt)  |
| `pnpm run typecheck`   | TypeScript type check (`tsc --noEmit`)  |
| `pnpm run linter`      | oxlint only                             |
| `pnpm run format:fix`  | oxfmt auto-fix (src/, schema/, configs) |
| `pnpm test`            | Vitest (all decoder and harness tests)  |
| `pnpm start validator` | Validate manifests against JSON schemas |
| `pnpm start generate`  | Build `data/decoders.db` for release    |
| `pnpm run ci`          | check + typecheck + test + validator    |

## Submitting a pull request

1. Create a branch for your decoder.
2. Follow the folder structure and manifest rules above.
3. Write TypeScript source with unit tests, including a shall-not-pass test where applicable.
4. Run `pnpm run check`, `pnpm test`, and `pnpm start validator`. All must pass.
5. Open a pull request. The [PR template](.github/PULL_REQUEST_TEMPLATE.md) has a checklist.
6. Wait for review. You may need to make changes based on feedback.

## License

This repository is licensed under the [Apache License 2.0](LICENSE.md). Contributors retain
copyright on their decoder code and license it under the same terms by submitting.

Logos and brand images under `decoders/` belong to their respective owners (device
manufacturers, network providers) and are not covered by the Apache License. See
[LICENSE.md](LICENSE.md#third-party-assets).

---

Built by the TagoIO team. Software licensed under [Apache-2.0](LICENSE.md). TagoIO logos and branding are not covered by Apache-2.0; see [Copyright Notice](LICENSE.md#copyright-notice) in LICENSE.md.
