# TagoIO - Decoders - Parsers - Codecs

This repository contains the necessary tools and guidelines for creating and managing decoders for the TagoIO platform. Decoders are scripts that interpret the payload data from an IoT Device or protocol and convert it into a TagoIO data format.

To help you get started, we've included a comprehensive video tutorial on how to add a new decoder: [Watch the tutorial](https://www.youtube.com/watch?v=7ejN2q0YWo0).

## Table of Contents

- [Folder Structure](#folder-structure)
- [Manifests](#manifests)
- [Adding a New Decoder](#adding-a-new-decoder)
  - [Network Decoder](#network-decoder)
  - [Connector Decoder](#connector-decoder)
- [Submitting a Decoder Pull Request](#submitting-a-decoder-pull-request)

## Folder Structure

The project follows this folder structure:

- [`./decoders/`](./decoders/): This directory contains the network and connector decoders.
  - `./network/network-name/`: This directory should be named with the network name/model.
  - `./connector/manufacturer-name/`: This directory should be named after the manufacturer of the device for which the decoder is being created. It groups together all decoders related to the specific manufacturer.
    - `./connector/manufacturer-name/sensor-name/`: This directory should be named after the specific sensor or device model for which the decoder is being created. It contains all versions of the decoder for that specific sensor or device model.
- [`./schema/`](./schema/): This directory contains the JSON schemas for the network and connector decoders.

## Manifests

Manifests are JSONC files that describe the details of each version of a decoder. They are essential for ensuring that the decoder is correctly identified and processed by the TagoIO platform.

### Network Decoders

- **Images**
  - **Banner**: Expected dimension `1500x375`
  - **Icon**: Expected dimension `64x64`
  - **Logo**: Expected dimension `443x160`
- **Manifest File:** `network.jsonc`
- **Details File:** `network_details.jsonc`

### Connector Decoders

- **Images**
  - **Logo**: Expected dimension `443x625` or `443x443`
- **Manifest File:** `connector.jsonc`
- **Details File:** `connector_details.jsonc`

### Example: Connector Manifest

Here's an example of a `connector.jsonc` file for a connector decoder:

```jsonc
{
  "$schema": "../../../schema/connector.json",
  "name": "Abeeway Compact Tracker", // Searchable Field on the TagoIO platform.
  "images": {
    "logo": "./assets/logo.png"
  },
  "versions": {
    "v1.0.0": {
      "src": "./v1.0.0/payload.js",
      "manifest": "./v1.0.0/payload-config.jsonc"
    }
  }
}
```

### Example: Connector Details

Here's an example of a `connector_details.jsonc` file for a connector decoder:

**🚨 IMPORTANT:** The fields `description`, `install_text`, and `device_annotation` must be objective and cannot be subjective, e.g. "Best sensor". They also must not contain external links that are outside the scope of TagoIO.

```jsonc
{
  "$schema": "../../../schema/connector_details.json",
  "description": "./description.md", // Searchable Field on the TagoIO platform.
  "install_text": "**Compact tracker**\n\nMulti-mode tracker with embedded sensors combining GPS, Low-power GPS, Wi-Fi Sniffer, BLE",
  "device_annotation": "",
  "device_parameters": [
    {
      "name": "beacon_decoder",
      "type": "dropdown",
      "label": "Beacon decoder type",
      "group": "main",
      "options": [
        {
          "is_default": false,
          "label": "One variable with all beacons",
          "value": "simple"
        },
        {
          "is_default": true,
          "label": "Split beacon in different variables",
          "value": "splitted"
        }
      ]
    }
  ],
  "networks": [
    "../../../network/lorawan-actility/v1.0.0/payload.js",
    "../../../network/lorawan-chirpstack/v1.0.0/payload.js",
    "../../../network/lorawan-citylink/v1.0.0/payload.js",
    "../../../network/lorawan-helium/v1.0.0/payload.js",
    "../../../network/lorawan-everynet/v1.0.0/payload.js",
    "../../../network/lorawan-kerlink/v1.0.0/payload.js",
    "../../../network/lorawan-loriot/v1.0.0/payload.js",
    "../../../network/lorawan-machineq/v1.0.0/payload.js",
    "../../../network/lorawan-senet/v1.0.0/payload.js",
    "../../../network/lorawan-swisscom/v1.0.0/payload.js",
    "../../../network/lorawan-ttn/v1.0.0/payload.js",
    "../../../network/lorawan-twtg/v1.0.0/payload.js",
    "../../../network/lorawan-twtg/v3/v1.0.0/payload.js",
    "../../../network/lorawan-brodt/v1.0.0/payload.js"
  ]
}
```

## Adding a New Decoder

### Network Decoder

1. **Create a new folder:**

   - Navigate to [`./decoders/network/`](./decoders/network/) and create a new folder named after your network decoder.

2. **Create the manifest file:**

   - Inside this folder, create a `network.jsonc` file. Follow the structure defined in [`network.json`](./schema/network.json).

3. **Create version folders:**

   - For each version of your network decoder, create a new folder inside your network decoder's folder. Name the folder with the version number.
   - The pattern utilized for versioning is the [SemVer](https://semver.org/)

4. **Create version manifest files:**
   - Inside each version folder, create a `manifest.jsonc` file. Follow the structure defined in [`network_details.json`](./schema/network_details.json).

### Connector Decoder

1. **Create a new folder:**

   - Navigate to [`./decoders/connector/`](./decoders/connector/) and create a new folder named after the manufacturer and the name of your connector decoder.

2. **Create the manifest file:**

   - Inside this folder, create a `connector.jsonc` file. Follow the structure defined in [`connector.json`](./schema/connector.json).

3. **Create version folders:**

   - For each version of your connector decoder, create a new folder inside your connector decoder's folder. Name the folder with the version number.
   - The pattern utilized for versioning is the [SemVer](https://semver.org/)

4. **Create version manifest files:**
   - Inside each version folder, create a `manifest.jsonc` file. Follow the structure defined in [`connector_details.json`](./schema/connector_details.json).

## Submitting a Decoder Pull Request

1. **Create a new branch:**

   - Create a new branch for your decoder.

2. **Add your decoder:**

   - Follow the instructions above to add your decoder.

3. **Include Non-Decoding Test Cases:**

   - Add unit tests to verify that payloads not intended for decoding remain unchanged. This ensures that additional data pass through the decoder without modification. Use the following template:

   ```typescript
   import { describe, expect, test, beforeEach } from "vitest";
   import { DataToSend } from "@tago-io/sdk/lib/types";

   import { decoderRun } from "../../../../../src/functions/decoder-run";

   const file_path = "DECODER-FILE-PATH"; // e.g. decoders/connector/your-decoder/v1.0.0/payload.ts

   let payload: DataToSend[] = [];

   describe("Shall not be parsed", () => {
     let payload = [
       { variable: "shallnotpass", value: "04096113950292" },
       { variable: "fport", value: 9 },
     ];
     payload = decoderRun(file_path, { payload });
     test("Output Result", () => {
       expect(Array.isArray(payload)).toBe(true);
     });

     test("Not parsed Result", () => {
       expect(payload).toEqual([
         { variable: "shallnotpass", value: "04096113950292" },
         { variable: "fport", value: 9 },
       ]);
     });
   });
   ```

4. **Run these commands to validate your changes:**

   - **Run the linter to check code style:**

   ```bash
   npm run linter
   ```

   - **Run all unit tests to ensure functionality:**

   ```bash
   npm test
   ```

   - **Validate your manifest files:**

   ```bash
   npm start validator
   ```

   - **Generate database:**

   ```bash
   npm start generate
   ```

   - Make sure all commands execute successfully without errors before submitting your PR. This helps maintain code quality and ensures all documentation is up to date.

5. **Commit your changes:**

   - Commit your changes and open a pull request for review.

6. **Review and feedback:**

   - Wait for the Pull Request to be reviewed. You may need to make some changes based on the feedback you receive.

7. **Merge your changes:**
   - Once your Pull Request is approved, it will be merged into the main codebase.

### 📝 Note: The decoder code should be in TypeScript and have Unit Tests respecting the rules.

---

For more detailed information, please refer to the examples provided in the repository and the schema files located in the `./schema/` directory.
