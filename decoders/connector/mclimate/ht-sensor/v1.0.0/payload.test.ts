import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/mclimate/ht-sensor/v1.0.0/payload.js" as const;


describe("MClimate HT keepalive", () => {

  let payload = [{ variable: "payload", value: "01027473F10400" }];
  payload = decoderRun(file_path, { payload });
  const thermistorProperlyConnected = payload.find((item) => item.variable === "thermistorProperlyConnected");
  const sensorTemperature = payload.find((item) => item.variable === "sensorTemperature");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("thermistorProperlyConnected", () => {
    expect(thermistorProperlyConnected?.value).toBe(false);
  });

  test("Temperature", () => {
    expect(sensorTemperature?.value).toBe(22.8);
  });
});

describe("MClimate HT keepalive with command response ", () => {
  let payload = [{ variable: "payload", value: "120501027473F10400" }];
  payload = decoderRun(file_path, { payload });
  const thermistorProperlyConnected = payload.find((item) => item.variable === "thermistorProperlyConnected");
  const sensorTemperature = payload.find((item) => item.variable === "sensorTemperature");
  const keepAliveTime = payload.find((item) => item.variable === "keepAliveTime");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("response GetKeepAliveTime", () => {
    expect(keepAliveTime?.value).toBe(5);
  });

  test("thermistorProperlyConnected", () => {
    expect(thermistorProperlyConnected?.value).toBe(false);
  });

  test("Temperature", () => {
    expect(sensorTemperature?.value).toBe(22.8);
  });
});

describe("Normal TagoIO Format data, should pass normally", () => {
  test("Shall not be parsed", () => {
    let payload = [{ variable: "shallnotpass", value: "invalid_payload" }];

    expect(payload).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "shallnotpass", value: "invalid_payload" })]));
  });
});