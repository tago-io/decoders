import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/mclimate/co2-sensor/v1.0.0/payload.js" as const;


describe("MClimate CO2 Sensor and Notifier keepalive", () => {

  let payload = [{ variable: "payload", value: "010271027384ED" }];
  payload = decoderRun(file_path, { payload });
  const CO2 = payload.find((item) => item.variable === "CO2");
  const sensorTemperature = payload.find((item) => item.variable === "sensorTemperature");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("CO2", () => {
    expect(CO2?.value).toBe(625);
  });

  test("Temperature", () => {
    expect(sensorTemperature?.value).toBe(22.7);
  });
});

describe("MClimate CO2 Sensor and Notifier keepalive with command response ", () => {
  let payload = [{ variable: "payload", value: "1205010271027384ED" }];
  payload = decoderRun(file_path, { payload });
  const CO2 = payload.find((item) => item.variable === "CO2");
  const sensorTemperature = payload.find((item) => item.variable === "sensorTemperature");
  const keepAliveTime = payload.find((item) => item.variable === "keepAliveTime");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("response GetKeepAliveTime", () => {
    expect(keepAliveTime?.value).toBe(5);
  });

  test("CO2", () => {
    expect(CO2?.value).toBe(625);
  });

  test("Temperature", () => {
    expect(sensorTemperature?.value).toBe(22.7);
  });
});

describe("Normal TagoIO Format data, should pass normally", () => {
  test("Shall not be parsed", () => {
    let payload = [{ variable: "shallnotpass", value: "invalid_payload" }];

    expect(payload).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "shallnotpass", value: "invalid_payload" })]));
  });
});