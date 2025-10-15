import { z } from "zod/v3";

const zEnv = z.object({
  DECODERS_ASSET_DOMAIN: z.string(),
});

// eslint-disable-next-line no-process-env
const envParsed = zEnv.parse(process.env);

export { envParsed as env };
