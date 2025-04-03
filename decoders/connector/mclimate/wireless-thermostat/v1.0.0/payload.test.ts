import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/mclimate/wireless-thermostat/v1.0.0/payload.js" as const;


describe("MClimate Wireless Thermostat keepalive", () => {
  let payload = [{ variable: "payload", value: "010267980C301B00029100" }];
  payload = decoderRun(file_path, { payload });
  const sensorTemperature = payload.find((item) => item.variable === "sensorTemperature");
  const lux = payload.find((item) => item.variable === "lux");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Sensor Temperature", () => {
    expect(sensorTemperature?.value).toBe(21.5);
  });

  test("LUX", () => {
    expect(lux?.value).toBe(657);
  });
});

describe("MClimate Wireless Thermostat keepalive with command response ", () => {
  let payload = [{ variable: "payload", value: "1205010267980C301B00029100" }];
  payload = decoderRun(file_path, { payload });
  const sensorTemperature = payload.find((item) => item.variable === "sensorTemperature");
  const lux = payload.find((item) => item.variable === "lux");
  const keepAliveTime = payload.find((item) => item.variable === "keepAliveTime");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("response GetKeepAliveTime", () => {
    expect(keepAliveTime?.value).toBe(5);
  });

  test("Sensor Temperature", () => {
    expect(sensorTemperature?.value).toBe(21.5);
  });

  test("LUX", () => {
    expect(lux?.value).toBe(657);
  });
});

describe("Normal TagoIO Format data, should pass normally", () => {
  test("Shall not be parsed", () => {
    let payload = [{ variable: "shallnotpass", value: "invalid_payload" }];

    expect(payload).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "shallnotpass", value: "invalid_payload" })]));
  });
});