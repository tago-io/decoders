import path from "node:path";
import fs from "node:fs";
import type { Knex } from "knex";
import type { Connector, ConnectorDetails } from "../../schema/types";
import { extractNameAndVersionFromPath, generateID } from "../helpers/generate-id";
import { readFileFromPath } from "../helpers/read-file";
import { buildTS } from "../helpers/build-ts";
import { zConnector } from "../validator/connector";
import { resolvePayload } from "./resolve-payload";

async function createConnectorVersion(knexClient: Knex, mainObj: Connector, filePath: string) {
  const versionKeys = Object.keys(mainObj.versions);

  if (versionKeys.length > 1) {
    throw `The decoders system allows only one version for now, it will be available soon. ${filePath}`;

  }

  for (const version of versionKeys) {
    const detailsPath = path.join(filePath, mainObj.versions[version].manifest);

    if (!fs.existsSync(detailsPath)) {
      throw `Connector manifest version file not found in ${filePath}`;
    }

    const detailsData: ConnectorDetails = JSON.parse(fs.readFileSync(detailsPath, "utf8"));

    const data = {
      id: generateID({ name: mainObj.name, version: version }, true),
      name: mainObj.name,
      version: version,
      description: readFileFromPath(`${filePath}/${version}`, detailsData.description, true),
      networks: detailsData.networks.map((n) => generateID(extractNameAndVersionFromPath(n))),
      device_parameters: detailsData?.device_parameters || [],
      install_text: detailsData?.install_text,
      install_end_text: detailsData?.install_end_text,
      device_annotation: detailsData?.device_annotation,
      logo: readFileFromPath(filePath, mainObj?.images?.logo),
      payload_decoder: resolvePayload(filePath, mainObj.versions[version].src),
    };

    const model = await zConnector.parseAsync(data);

    await knexClient.insert(model).into("connector");
  }
}

async function createConnectors(knexClient: Knex, directoryPath: string): Promise<void> {
  const files = fs.readdirSync(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);

    if (!fs.lstatSync(filePath).isDirectory()) {
      throw `${file} is not a valid directory`;
    }

    const listModelFile = fs.readdirSync(path.join(directoryPath, file));

    for (const fileModel of listModelFile) {
      const modelPath = path.join(directoryPath, file, fileModel);

      if (!fs.lstatSync(modelPath).isDirectory()) {
        throw `${fileModel} is not a valid directory`;
      }

      const connectorPath = path.join(modelPath, "connector.jsonc");

      if (!fs.existsSync(connectorPath)) {
        throw `Connector file not found in ${modelPath}`;
      }

      const connectorData: Connector = JSON.parse(fs.readFileSync(connectorPath, "utf8"));

      await createConnectorVersion(knexClient, connectorData, modelPath);
    }
  }
}

export { createConnectors };
