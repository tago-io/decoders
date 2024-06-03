import { z } from "zod";
import { zBufferPayloadSize, zDomain, zBufferOrString } from "./common";
import { zIntegrationParameters } from "./integration-parameters";

const zSerialNumber = z.object({
  case: z.enum(["lower", "upper", ""]).optional(),
  image: zBufferOrString.optional(),
  label: z.string().max(100).optional(),
  mask: z.string().max(100).optional(),
  required: z.boolean().default(false),
}).transform((data) => {
  if (data) {
    return JSON.stringify(data);
  }
  return data;
});

const zNetwork = z.object({
  id: z.string().max(24),
  name: z.string().max(255),
  version: z.string(),
  description: z.string().max(500).nullish(),
  documentation_url: z.string().nullish(),
  middleware_endpoint: zDomain.nullish(),
  serial_number: zSerialNumber.nullish(),
  device_parameters: zIntegrationParameters.nullish(),
  icon: zBufferOrString.nullish(),
  logo: zBufferOrString.nullish(),
  banner: zBufferOrString.nullish(),
  payload_decoder: zBufferPayloadSize(64).nullish(),
});


type TypeNetwork = z.infer<typeof zNetwork>;

export { zNetwork };

export type { TypeNetwork };
