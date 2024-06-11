import { z } from "zod";

const zEnv = z.object({
  DECODERS_ASSET_DOMAIN: z.string(),
});

console.log(process.env?.DECODERS_ASSET_DOMAIN);

// eslint-disable-next-line no-process-env
const envParsed = zEnv.parse(process.env);

export { envParsed as env };
