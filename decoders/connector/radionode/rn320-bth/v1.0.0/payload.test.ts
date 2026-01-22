import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/radionode/rn320-bth/v1.0.0/payload.js" as const;

describe("Radionode RN320-BTH - Sensor Test", () => {
  const payload = [
    {
      variable: "payload",
      value: "0C010000000000020000A04100004842", // Head 12, Temp 20.0, Hum 50.0
    },
  ];

  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values match expected RN320 logic", () => {
    expect(values.head).toBe(12);
    expect(values.temperature).toBe(20);
    expect(values.humidity).toBe(50);
  });
});

describe("Radionode RN320-BTH - Error Handling", () => {
  test("Shall not parse unknown variable", () => {
    const payload = [{ variable: "unknown", value: "0C0100" }];
    const result = decoderRun(file_path, { payload });

    expect(result).toEqual(payload);
  });

  test("Handles invalid head frame", () => {
    const payload = [{ variable: "payload", value: "FF0000" }];
    const decoded = decoderRun(file_path, { payload });
    const values = Object.fromEntries(decoded.map((it) => [it.variable, it.value]));

    expect(values.parse_error).toContain("Unsupported head");
  });
});