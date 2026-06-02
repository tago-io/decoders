import path from "node:path";
import { env } from "../validator/env.ts";

function generateAssetURL(decoderDirectory: string, assetPath?: string) {
  if (!assetPath) {
    return null;
  }

  return `${env.DECODERS_ASSET_DOMAIN}/${path.join(decoderDirectory, assetPath)}`;
}

export { generateAssetURL };
