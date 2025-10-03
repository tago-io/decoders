/* eslint-disable unicorn/numeric-separators-style */
import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/netvox/r72632a01/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string, port: number) {
  let payload = [
    { variable: "payload", value: payloadHex, unit: "" },
    { variable: "fport", value: port, unit: "" },
  ] as any;
  payload = decoderRun(file_path, { payload });

  const battery_voltage = payload.find((item) => item.variable === "battery_voltage");
  const soil_nitrogen = payload.find((item) => item.variable === "soil_nitrogen");
  const soil_phosphorus = payload.find((item) => item.variable === "soil_phosphorus");
  const soil_potassium = payload.find((item) => item.variable === "soil_potassium");
  const pm2_5 = payload.find((item) => item.variable === "pm2_5");
  const co2 = payload.find((item) => item.variable === "co2");
  const temperature = payload.find((item) => item.variable === "temperature");
  const humidity = payload.find((item) => item.variable === "humidity");
  const nitrogen = payload.find((item) => item.variable === "nitrogen");
  const phosphorus = payload.find((item) => item.variable === "phosphorus");
  const potassium = payload.find((item) => item.variable === "potassium");
  return {
    payload,
    battery_voltage,
    soil_nitrogen,
    soil_phosphorus,
    soil_potassium,
    pm2_5,
    co2,
    temperature,
    humidity,
    nitrogen,
    phosphorus,
    potassium,
  };
}

describe("Port 6, PM2.5 values", () => {
  const payloadHex = "01090278FFFF000EFFFF00";
  const port = 6;
  const result = preparePayload(payloadHex, port);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.battery_voltage?.value).toBe(12);
    expect(result.pm2_5?.value).toBe(14);
  });
});

describe("Port 6, CO2 values", () => {
  const payloadHex = "010907780064FFFFFFFF00";
  const port = 6;
  const result = preparePayload(payloadHex, port);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.battery_voltage?.value).toBe(12);
    expect(result.co2?.value).toBe(10);
  });
});

describe("Port 6, Temp/Hum values", () => {
  const payloadHex = "01090C7809C42328FFFF00";
  const port = 6;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.battery_voltage?.value).toBe(12);
    expect(result.temperature?.value).toBe(25);
    expect(result.humidity?.value).toBe(90);
  });
});

describe("Port 6, NPK values", () => {
  const payloadHex = "01090f450014001c004100";
  const port = 6;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.battery_voltage?.value).toBe(6.9);
    expect(result.nitrogen?.value).toBe(20);
    expect(result.phosphorus?.value).toBe(28);
    expect(result.potassium?.value).toBe(65);
  });
});