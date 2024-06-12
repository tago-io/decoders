## TagoIO - Decoders - Parsers - Codecs

This repository contains the necessary tools and guidelines for creating and managing decoders for TagoIO platform. Decoders are scripts that interpret the payload data from a IoT Device or protocol and convert it into a TagoIO data format.

## Useful commands

Installing all packages and libs needed
`npm install`

Validating Decoders manifest
`npm start validator`

Running Tests
`npm test`

Running Linter
`npm linter`

Running a specific Decoder
`npx tsx $your decoder path$`

## Folder Structure

The project follows this folder structure:

- [`./decoders/`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FUsers%2Ftagoio%2FDocuments%2Fwork%2Fjs%2Fdecoders%2Fdecoders%2F%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "/Users/tagoio/Documents/work/js/decoders/decoders/"): This directory contains the network and connector decoders.
    - `./network/network-name`: This directory should be named with the network name/model;
    - `./connector/manufactor-name/`: This directory should be named after the manufacturer of the device for which the decoder is being created. It groups together all decoders related to the specific manufacturer.
      - `./connector/manufactor-name/sensor-name/`: This directory should be named after the specific sensor or device model for which the decoder is being created. It contains all versions of the decoder for that specific sensor or device model.
- [`./schema/`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FUsers%2Ftagoio%2FDocuments%2Fwork%2Fjs%2Fdecoders%2Fschema%2F%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "/Users/tagoio/Documents/work/js/decoders/schema/"): This directory contains the JSON schemas for the network and connector decoders.

## Manifests

Manifests are JSONC files that describe the details of each version of a decoder. 

For Network decoders it should follow the structure defined in [`network.json`](./schema/network.json) and [`network_details.json`](./schema/network_details.json).

For Connector decoders it should follow the structure defined in [`connector.json`](./schema/connector.json) and [`connector_details.json`](./schema/connector_details.json).

## Adding a New Decoder

### Network Decoder

1. Create a new folder under [`./decoders/network/`](./decoders/network/) with the name of your network decoder.
2. Inside this folder, create a [`network.jsonc`](command:_github.copilot.openSymbolFromReferences?%5B%7B%22%24mid%22%3A1%2C%22path%22%3A%22%2FUsers%2Ftagoio%2FDocuments%2Fwork%2Fjs%2Fdecoders%2Fschema%2Fnetwork.json%22%2C%22scheme%22%3A%22file%22%7D%2C%7B%22line%22%3A0%2C%22character%22%3A0%7D%5D "schema/network.json") file. This file should follow the structure defined in [`network.json`](./schema/network.json) from the [`./schema/`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FUsers%2Ftagoio%2FDocuments%2Fwork%2Fjs%2Fdecoders%2Fschema%2F%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "/Users/tagoio/Documents/work/js/decoders/schema/") directory.
3. For each version of your network decoder, create a new folder inside your network decoder's folder. The folder name should be the version number.
4. Inside each version folder, create a [`manifest.jsonc`](command:_github.copilot.openSymbolFromReferences?%5B%7B%22%24mid%22%3A1%2C%22path%22%3A%22%2FUsers%2Ftagoio%2FDocuments%2Fwork%2Fjs%2Fdecoders%2Fschema%2Ftypes.ts%22%2C%22scheme%22%3A%22file%22%7D%2C%7B%22line%22%3A3%2C%22character%22%3A4%7D%5D "schema/types.ts") file. This file should follow the structure defined in [`network_details.json`](./schema/network_details.json) from the [`./schema/`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FUsers%2Ftagoio%2FDocuments%2Fwork%2Fjs%2Fdecoders%2Fschema%2F%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "/Users/tagoio/Documents/work/js/decoders/schema/") directory.

### Connector Decoder

1. Create a new folder under [`./decoders/connector/`](./decoders/connector/) with the manufacturer and the name of your connector decoder.
2. Inside this folder, create a [`connector.jsonc`](command:_github.copilot.openSymbolFromReferences?%5B%7B%22%24mid%22%3A1%2C%22path%22%3A%22%2FUsers%2Ftagoio%2FDocuments%2Fwork%2Fjs%2Fdecoders%2Fschema%2Fconnector.json%22%2C%22scheme%22%3A%22file%22%7D%2C%7B%22line%22%3A0%2C%22character%22%3A0%7D%5D "schema/connector.json") file. This file should follow the structure defined in [`connector.json`](./schema/connector.json) from the [`./schema/`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FUsers%2Ftagoio%2FDocuments%2Fwork%2Fjs%2Fdecoders%2Fschema%2F%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "/Users/tagoio/Documents/work/js/decoders/schema/") directory.
3. For each version of your connector decoder, create a new folder inside your connector decoder's folder. The folder name should be the version number.
4. Inside each version folder, create a [`manifest.jsonc`](command:_github.copilot.openSymbolFromReferences?%5B%7B%22%24mid%22%3A1%2C%22path%22%3A%22%2FUsers%2Ftagoio%2FDocuments%2Fwork%2Fjs%2Fdecoders%2Fschema%2Ftypes.ts%22%2C%22scheme%22%3A%22file%22%7D%2C%7B%22line%22%3A3%2C%22character%22%3A4%7D%5D "schema/types.ts") file. This file should follow the structure defined in [`connector_details.json`](./schema/connector_details.json) from the [`./schema/`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2FUsers%2Ftagoio%2FDocuments%2Fwork%2Fjs%2Fdecoders%2Fschema%2F%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "/Users/tagoio/Documents/work/js/decoders/schema/") directory.

## Submitting a Decoder Pull Request

1. Create a new branch for your decoder.
2. Add your decoder following the instructions above.
3. Commit your changes and open a pull request to review. Before commit the decoder run the command `npm start validator` to check if all data in the manifest file is correct.
4. Wait for the Pull Request to be reviewed. You may need to make some changes based on the feedback you receive.
5. Once your Pull Request is approved, it will be merged into the main codebase.

NOTE: The decoder code should be in TypeScript and have Unit Test respecting the rules.

