import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/mclimate/co2-display-lite/v1.0.0/payload.js" as const;


describe("MClimate CO2 Display Lite keepalive", () => {

  let payload = [{ variable: "payload", value: "010263870AAC39100117" }];
  payload = decoderRun(file_path, { payload });
  const CO2 = payload.find((item) => item.variable === "CO2");
  const sensorTemperature = payload.find((item) => item.variable === "sensorTemperature");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("CO2", () => {
    expect(CO2?.value).toBe(569);
  });

  test("Temperature", () => {
    expect(sensorTemperature?.value).toBe(21.1);
  });
});

describe("MClimate CO2 Display Lite keepalive with command response ", () => {
  let payload = [{ variable: "payload", value: "1205010263870AAC39100117" }];
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
    expect(CO2?.value).toBe(569);
  });

  test("Temperature", () => {
    expect(sensorTemperature?.value).toBe(21.1);
  });
});

describe("Normal TagoIO Format data, should pass normally", () => {
  test("Shall not be parsed", () => {
    let payload = [{ variable: "shallnotpass", value: "invalid_payload" }];

    expect(payload).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "shallnotpass", value: "invalid_payload" })]));
  });
});