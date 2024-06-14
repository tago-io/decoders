/* eslint-disable unicorn/numeric-separators-style */
import { expect, describe, test } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/milesight/em400-tld/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex, unit: "" }];
  payload = decoderRun(file_path, { payload });
  const battery_level = payload.find((item) => item.variable === "battery_level");
  const temperature = payload.find((item) => item.variable === "temperature");
  const distance = payload.find((item) => item.variable === "distance");
  const position = payload.find((item) => item.variable === "position");
  const temperature_abnormal = payload.find((item) => item.variable === "temperature_abnormal");
  const distance_alarming = payload.find((item) => item.variable === "distance_alarming");

  // Error parsing
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    battery_level, //
    temperature, //
    distance, //
    position, //
    temperature_abnormal,
    distance_alarming,
    payload,
    parse_error,
  };
}

describe("First unit test. battery, temp, dist ,position", () => {
  const payloadHex = "0175640367f80004820101050000";
  const result = preparePayload(payloadHex);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check if variable exists", () => {
    expect(result.battery_level).toBeTruthy();
    expect(result.temperature).toBeTruthy();
    expect(result.distance).toBeTruthy();
    expect(result.position).toBeTruthy();
  });

  test("Check variable values", () => {
    expect(result.battery_level?.value).toBe(100);
    expect(result.temperature?.value).toBe(24.8);
    expect(result.distance?.value).toBe(257);
    expect(result.position?.value).toBe("normal");
  });

  test("Check variable units", () => {
    expect(result.battery_level?.unit).toBe("%");
    expect(result.temperature?.unit).toBe("°C");
    expect(result.distance?.unit).toBe("mm");
  });
});

describe("Second unit test. dist, dist alarm", () => {
  const payloadHex = "8482330701";
  const result = preparePayload(payloadHex);

  test("Check if variable exists", () => {
    expect(result.distance).toBeTruthy();
    expect(result.distance_alarming).toBeTruthy();
  });

  test("Check variable values", () => {
    expect(result.distance?.value).toBe(1843);
    expect(result.distance_alarming?.value).toBe(true);
  });

  test("Check variable units", () => {
    expect(result.distance?.unit).toBe("mm");
  });
});

describe("Third unit test. temp, temp alarm", () => {
  const payloadHex = "8367220101";
  const result = preparePayload(payloadHex);

  test("Check if variable exists", () => {
    expect(result.temperature).toBeTruthy();
    expect(result.temperature_abnormal).toBeTruthy();
  });

  test("Check variable values", () => {
    expect(result.temperature?.value).toBe(29);
    expect(result.temperature_abnormal?.value).toBe(true);
  });

  test("Check variable units", () => {
    expect(result.temperature?.unit).toBe("°C");
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
