import path from "node:path";
import fs from "node:fs";
import type { Knex } from "knex";
import type { Network, NetworkDetails } from "../../schema/types";
import { generateID } from "../helpers/generate-id";
import { readFileFromPath } from "../helpers/read-file";
import { buildTS } from "../helpers/build-ts";
import { zNetwork } from "../validator/network";
import { resolvePayload } from "./resolve-payload";

async function createNetworkVersion(knexClient: Knex, mainObj: Network, filePath: string) {
  const versionKeys = Object.keys(mainObj.versions);

  if (versionKeys.length > 1) {
    throw `The decoders system allows only one version for now, it will be available soon. ${filePath}`;

  }

  for (const version of versionKeys) {
    const detailsPath = path.join(
      filePath,
      mainObj.versions[version].manifest
    );

    if (!fs.existsSync(detailsPath)) {
      throw `Network manifest version file not found in ${filePath}`;
    }

    const detailsData: NetworkDetails = JSON.parse(fs.readFileSync(detailsPath, "utf8"));

    const data = {
      id: generateID({ name: mainObj.name, version: version }),
      name: mainObj.name,
      version: version,
      documentation_url: detailsData?.documentation_url,
      device_parameters: detailsData?.device_parameters || [],
      serial_number: detailsData?.serial_number_config || {},
      description: readFileFromPath(`${filePath}/${version}`, detailsData.description, true),
      logo: readFileFromPath(filePath, mainObj?.images?.logo),
      banner: readFileFromPath(filePath, mainObj?.images?.banner),
      icon: readFileFromPath(filePath, mainObj?.images?.icon),
      payload_decoder: resolvePayload(filePath, mainObj.versions[version].src),
    };

    const model = await zNetwork.parseAsync(data);

    await knexClient.insert(model).into("network");
  }
}

async function createNetworks(knexClient: Knex, directoryPath: string): Promise<void> {
  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    if (!fs.lstatSync(filePath).isDirectory()) {
      throw `${file} is not a valid directory`;
    }
    const networkPath = path.join(filePath, "network.jsonc");
    if (!fs.existsSync(networkPath)) {
      throw `network.jsonc manifest file not found in ${filePath}`;
    }
    const networkData: Network = JSON.parse(
      fs.readFileSync(networkPath, "utf8")
    );
    await createNetworkVersion(knexClient, networkData, filePath);
  }
}

export { createNetworks };
