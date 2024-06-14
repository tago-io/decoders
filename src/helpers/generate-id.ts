import { createHash } from "node:crypto";
import mappedIds from "../../map-ids.json";

type TypeVersion = {
  name: string;
  version: string;
};

function generateID({ name, version }: TypeVersion, isConnector = false): string {
  let normalizedName = name
    .replaceAll(/[^\w\s+-]|_/g, "")
    .replaceAll("-", " ")
    .replaceAll(/\s+/g, "-")
    .toLowerCase();

  if (isConnector) {
    const connectorSplitted = normalizedName.split(/-(.+)/);
    const manufacturer = connectorSplitted[0];
    const connectorModel = connectorSplitted[1] || manufacturer;

    normalizedName = `connector:${manufacturer}${connectorModel}`;
  }

  const combinedString = `${normalizedName}-${version}`;
  const hash = createHash('md5').update(combinedString).digest('hex');

  const id = hash.substring(0, 24);

  // @ts-expect-error
  return mappedIds[id] || id;
}

function extractNameAndVersionFromPath(path: string): { name: string; version: string } {
  const parts = path.split('/');
  const networkIndex = parts.indexOf('network');

  if (networkIndex === -1 || networkIndex + 2 >= parts.length) {
    throw new Error('Invalid path format');
  }

  const lastSegment = parts[parts.length - 1];
  if (lastSegment.includes('.')) {
    parts.pop();
  }

  const name = parts[networkIndex + 1];
  const version = parts[networkIndex + 2];

  if (!name || !version) {
    throw new Error('missing name or version on path');
  }

  return { name, version };
}

console.log(generateID({ version: "v1.0.0", name: "lorawan-loriot" }))

export { generateID, extractNameAndVersionFromPath };
