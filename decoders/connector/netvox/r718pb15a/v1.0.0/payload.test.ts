/* eslint-disable unicorn/numeric-separators-style */
import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/netvox/r718pb15a/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string, port: number) {
  let payload = [
    { variable: "payload", value: payloadHex, unit: "" },
    { variable: "fport", value: port, unit: "" },
  ] as any;
  payload = decoderRun(file_path, { payload });

  const parse_error = payload.find((item) => item.variable === "parse_error");
  const battery = payload.find((item) => item.variable === "battery");
  const cmd = payload.find((item) => item.variable === "cmd");
  const status = payload.find((item) => item.variable === "status");
  const battery_voltage = payload.find((item) => item.variable === "battery_voltage");
  const soil_vwc = payload.find((item) => item.variable === "soil_vwc");
  const soil_temperature = payload.find((item) => item.variable === "soil_temperature");
  const water_level = payload.find((item) => item.variable === "water_level");
  const soil_ec = payload.find((item) => item.variable === "soil_ec");

  return {
    payload,
    battery,
    cmd,
    status,
    parse_error,
    battery_voltage,
    soil_vwc,
    soil_temperature,
    water_level,
    soil_ec,
  };
}

describe("Port 6, 0x01, unit tests", () => {
  const payloadHex = "01580A2406850A96FFFF01";
  const port = 6;
  const result = preparePayload(payloadHex, port);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.battery_voltage?.value).toBe(3.6);
    expect(result.soil_vwc?.value).toBe(16.69);
    expect(result.soil_temperature?.value).toBe(27.1);
    expect(result.water_level?.value).toBe(65535);
    expect(result.soil_ec?.value).toBe(0.1);
  });
});
