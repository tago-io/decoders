import * as fs from "node:fs";
import * as path from "node:path";
import Ajv, { JSONSchemaType } from "ajv";
import addFormats from "ajv-formats";
import networkSchema from "../../schema/network.json" assert { type: "json" };
import networkDetailsSchema from "../../schema/network_details.json" assert { type: "json" };
import connectorSchema from "../../schema/connector.json" assert { type: "json" };
import connectorDetailsSchema from "../../schema/connector_details.json" assert { type: "json" };
import type { Connector, Network, Versions } from "../../schema/types";

const isVerbose = process.argv[2] === "--verbose";

const ajv = new Ajv({ allErrors: true, removeAdditional: "all" });
addFormats(ajv);

// Compile Network schemas
const validateNetwork = ajv.compile(networkSchema);
const validateNetworkDetails = ajv.compile(networkDetailsSchema);
// Compile Connector schemas
const validateConnector = ajv.compile(connectorSchema);
const validateConnectorDetails = ajv.compile(connectorDetailsSchema);

function validateVersions(versionsObj: Versions, filePath: string, validateType: "network" | "connector") {
  const versionKeys = Object.keys(versionsObj);

  for (const version of versionKeys) {
    const detailsPath = path.join(
      filePath,
      versionsObj[version].manifest
    );

    if (!fs.existsSync(detailsPath)) {
      throw `${validateType} manifest version file not found in ${filePath}`;
    }

    const detailsData = JSON.parse(fs.readFileSync(detailsPath, "utf8"));

    const validator = validateType === "network" ? validateNetworkDetails : validateConnectorDetails;

    const isDetailsValid = validator(detailsData);

    if (!isDetailsValid) {
      throw `Validation errors in ${detailsPath}.\n\n${JSON.stringify(validator.errors, null, 2)}`;
    }
  }
}

async function validateNetworkFiles(directoryPath: string): Promise<void> {
  try {
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

      const isNetworkValid = validateNetwork(networkData);

      if (!isNetworkValid) {
        throw `Validation errors in ${networkPath}.\n\n${JSON.stringify(
          validateNetwork.errors,
          null,
          2
        )}\n`;
      }

      validateVersions(networkData.versions, filePath, "network");

      if (isVerbose) {
        console.info("Validated:", filePath);
      }
    }
    console.info("All Networks successfully validated! 🚀");
  } catch (error) {
    console.error("Error processing network directories:", error);
    process.exit(1);
  }
}

async function validateConnectorFiles(directoryPath: string): Promise<void> {
  try {
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
          throw `connector.jsonc manifest file not found in ${modelPath}`;
        }

        const connectorData: Connector = JSON.parse(
          fs.readFileSync(connectorPath, "utf8")
        );

        const isConnectorValid = validateConnector(connectorData);
        if (!isConnectorValid) {
          throw `Validation errors in ${connectorPath}.\n\n${JSON.stringify(
            validateConnector.errors,
            null,
            2
          )}`;
        }

        validateVersions(connectorData.versions, modelPath, "connector");

        if (isVerbose) {
          console.info("Validated:", modelPath);
        }
      }
    }
    console.info("All Connectors successfully validated! 🚀");
  } catch (error) {
    console.error("Error processing connector directories:", error);
    process.exit(1);
  }
}

validateNetworkFiles("./decoders/network").catch(console.error);
validateConnectorFiles("./decoders/connector").catch(console.error);
