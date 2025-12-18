import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

// Path to the RN172 decoder
const file_path =
  "decoders/connector/radionode/rn172/v1.0.0/payload.js";

describe("Radionode RN172 Decoder", () => {

  test("Hexadecimal payload is passed through unchanged when no decoding is applied", () => {
    // Hexadecimal device payload
    const input = [
      {
        variable: "payload",
        value: "0100FA012C",
      },
    ];

    // Execute decoder
    const result = decoderRun(file_path, { payload: input });

    // Assertions
    expect(Array.isArray(result)).toBe(true);

    // RN172 decoder currently does NOT decode hex,
    // so the payload must remain unchanged
    expect(result).toEqual(input);
  });

});
