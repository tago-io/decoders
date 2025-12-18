import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

// Path to the RN320-BTH decoder
const file_path =
  "decoders/connector/radionode/rn320-bth/v1.0.0/payload.js";

describe("Radionode RN320-BTH Decoder", () => {

  test("Hexadecimal payload is passed through unchanged when no decoding is applied", () => {
    // Example hexadecimal payload from device
    const input = [
      {
        variable: "payload",
        value: "04096113950292",
      },
    ];

    // Execute decoder
    const result = decoderRun(file_path, { payload: input });

    // Assertions
    expect(Array.isArray(result)).toBe(true);

    // RN320-BTH decoder currently performs pass-through only
    expect(result).toEqual(input);
  });

});
