import { z } from "zod/v3";
import validator from "validator";

const zBufferPayload = z.any().refine((val) => Buffer.isBuffer(val), "Invalid Payload Parser");

const zBufferPayloadSize = (sizeKb: number) => {
  return z.any().superRefine((val, ctx) => {
    if (!Buffer.isBuffer(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid Payload Parser",
      });

      return z.never;
    }

    if (Buffer.byteLength(val) > sizeKb * 1000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Not permitted to use function parse with more than ${sizeKb}kb`,
      });
    }
  });
};

const zDomain = z.string().refine((val) => {
  return validator.isFQDN(val, {
    allow_underscores: true,
  });
}, "Invalid domain");

const zBufferOrString = z.union([z.string(), z.instanceof(Buffer)]);

export { zBufferPayload, zBufferPayloadSize, zDomain, zBufferOrString };
