import { z } from "zod";
import { zBufferPayloadSize, zDomain } from "./common";
import { zIntegrationParameters } from "./integration-parameters";

const zSerialNumber = z
  .object({
    case: z.enum(["lower", "upper", ""]).optional(),
    image: z.string().nullish(),
    label: z.string().max(100).optional(),
    mask: z.string().max(100).optional(),
    required: z.boolean().default(false),
  })
  .transform((data) => {
    if (data) {
      return JSON.stringify(data);
    }
    return data;
  });

const middlewareEndpointObject = z
  .object({
    "us-e1": zDomain.nullish(),
    "eu-w1": zDomain.nullish(),
  })
  .refine((data) => {
    if (!data?.["eu-w1"] && !data?.["us-e1"]) {
      return false;
    }
    return true;
  })
  .transform((data) => JSON.stringify(data));

const middlewareEndpointSchema = z.union([
  zDomain.nullish(), // String case
  middlewareEndpointObject, // Object case
]);

const zNetwork = z.object({
  id: z.string().max(24),
  name: z.string().max(255),
  version: z.string(),
  description: z.string().max(500).nullish(),
  documentation_url: z.string().nullish(),
  middleware_endpoint: middlewareEndpointSchema,
  serial_number: zSerialNumber.nullish(),
  device_parameters: zIntegrationParameters.nullish(),
  icon: z.string().nullish(),
  logo: z.string().nullish(),
  banner: z.string().nullish(),
  payload_decoder: zBufferPayloadSize(64).nullish(),
});

type TypeNetwork = z.infer<typeof zNetwork>;

export { zNetwork };

export type { TypeNetwork };
