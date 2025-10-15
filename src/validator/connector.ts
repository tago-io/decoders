import { z } from "zod/v3";
import { zIntegrationParameters } from "./integration-parameters";
import { zBufferOrString, zBufferPayloadSize } from "./common.js";

const zConnector = z.object({
  id: z.string().max(24),
  name: z.string().max(255),
  version: z.string(),
  networks: z.array(z.string().max(24)).min(1).transform((data) => JSON.stringify(data)),
  description: z.string().max(500).nullish(),
  install_text: z.string().nullish(),
  install_end_text: z.string().nullish(),
  device_annotation: z.string().nullish(),
  device_parameters: zIntegrationParameters.nullish(),
  logo: z.string().nullish(),
  payload_decoder: zBufferPayloadSize(64).nullish(),
});

type TypeConnector = z.infer<typeof zConnector>;

export { zConnector };
export type { TypeConnector };
