import { z } from "zod";

const zIntegrationParameterBase = z.object({
  default: z.string().default(""),
  group: z.enum(["main", "advanced", "hide"]).default("main"),
  label: z.string().optional(),
  name: z.string().default(""),
});

const zIntegrationParameterText = zIntegrationParameterBase.extend({
  type: z.literal("text"),
});

const zIntegrationParameterNumber = zIntegrationParameterBase.extend({
  type: z.literal("number"),
});

const zIntegrationParameterDrop = zIntegrationParameterBase.extend({
  type: z.literal("dropdown"),
  options: z.array(
    z.object({
      is_default: z.boolean().optional(),
      label: z.string(),
      value: z.string(),
    })
  ),
});

const zIntegrationParameterSwitch = zIntegrationParameterBase.extend({
  type: z.literal("switch"),
  default: z.boolean().default(false),
});

const zIntegrationParameter = z.preprocess((value) => {
  if (typeof value === "object") {
    return { type: "text", ...value };
  }
  return value;
}, z.discriminatedUnion("type", [zIntegrationParameterText, zIntegrationParameterNumber, zIntegrationParameterDrop, zIntegrationParameterSwitch]));

const zIntegrationParameters = zIntegrationParameter.array().transform((data) => {
  if (data) {
    return JSON.stringify(data);
  }
  return data;
});;

type IntegrationParameter = z.infer<typeof zIntegrationParameter>;
type IntegrationParameters = z.infer<typeof zIntegrationParameters>;

export { zIntegrationParameter, zIntegrationParameters };
export type { IntegrationParameter, IntegrationParameters };
