import path from "node:path";
import { env } from "../validator/env";

function generateAssetURL(decoderId: string, assetPath?: string) {
  if (!assetPath) {
    return null;
  }

  const filename = path.join(decoderId, assetPath);

  return `${env.DECODERS_ASSET_DOMAIN}/${filename}`;
}

export { generateAssetURL }
