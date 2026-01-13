import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/radionode/rn320-bth/v1.0.0/payload.js";

describe("Radionode RN320-BTH Decoder", () => {

  test("Executes decoder with hexadecimal RN320-BTH uplink", () => {
    const input = [
      {
        variable: "payload",
        value: "01010A01F4012C", // hex uplink
      },
    ];

    const result = decoderRun(file_path, { payload: input });

    // Decoder runs and returns TagoIO array
    expect(Array.isArray(result)).toBe(true);

    // Payload is preserved when frame is not recognized
    expect(result).toEqual(input);
  });

});
