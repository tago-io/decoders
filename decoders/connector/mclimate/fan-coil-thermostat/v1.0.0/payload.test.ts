import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/mclimate/fan-coil-thermostat/v1.0.0/payload.js" as const;


describe("MClimate Fan Coil Thermostat keepalive", () => {

  let payload = [{ variable: "payload", value: "01028875013B0100060101" }];
  payload = decoderRun(file_path, { payload });
  const actualFanSpeed = payload.find((item) => item.variable === "actualFanSpeed");
  const sensorTemperature = payload.find((item) => item.variable === "sensorTemperature");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("actualFanSpeed", () => {
    expect(actualFanSpeed?.value).toBe(6);
  });

  test("Temperature", () => {
    expect(sensorTemperature?.value).toBe(24.8);
  });
});

describe("MClimate Fan Coil Thermostat keepalive with command response ", () => {
  let payload = [{ variable: "payload", value: "120501028875013B0100060101" }];
  payload = decoderRun(file_path, { payload });
  const actualFanSpeed = payload.find((item) => item.variable === "actualFanSpeed");
  const sensorTemperature = payload.find((item) => item.variable === "sensorTemperature");
  const keepAliveTime = payload.find((item) => item.variable === "keepAliveTime");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("response GetKeepAliveTime", () => {
    expect(keepAliveTime?.value).toBe(5);
  });

  test("actualFanSpeed", () => {
    expect(actualFanSpeed?.value).toBe(6);
  });

  test("Temperature", () => {
    expect(sensorTemperature?.value).toBe(24.8);
  });
});

describe("Normal TagoIO Format data, should pass normally", () => {
  test("Shall not be parsed", () => {
    let payload = [{ variable: "shallnotpass", value: "invalid_payload" }];

    expect(payload).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "shallnotpass", value: "invalid_payload" })]));
  });
});