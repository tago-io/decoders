/* eslint-disable unicorn/numeric-separators-style */
import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/milesight/ws303/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex, unit: "" }];
  payload = decoderRun(file_path, { payload });
  const battery = payload.find((item) => item.variable === "battery");
  const leakage_status = payload.find((item) => item.variable === "leakage_status");
  // Error parsing
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    battery,
    leakage_status,
    payload,
    parse_error,
  };
}

describe("Battery and Leakage", () => {
  const payloadHex = "017564030000";
  const result = preparePayload(payloadHex);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.battery?.value).toBe(100);
    expect(result.leakage_status?.value).toBe("normal");
  });
});

describe("Shall not be parsed", () => {
  let payload = [
    { variable: "shallnotpass", value: "04096113950292" },
    { variable: "fport", value: 9 },
  ];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([
      { variable: "shallnotpass", value: "04096113950292" },
      { variable: "fport", value: 9 },
    ]);
  });
});
