import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/radionode/rn172/v1.0.0/payload.js" as const;

describe("Radionode RN172 Decoder - Functional Validation", () => {
  test("Successfully parses UA58-APC (CO2, O3, Temp, Humidity)", () => {
    const input = [
      {
        variable: "payload",
        value: "model=UA58-APC&SMODEL=UA58-APC&C000=1705152000|500|20|25.5|45.2",
      },
    ];

    const result = decoderRun(file_path, { payload: input });
    const values = Object.fromEntries(result.map((it) => [it.variable, it.value]));

    expect(values.co2).toBe(500);
    expect(values.o3).toBe(20);
    expect(values.temp).toBe(25.5);
    expect(values.rh).toBe(45.2);
  });
});