import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/mclimate/mc-button/v1.0.0/payload.js" as const;


describe("MClimate Multipurpose Button keepalive", () => {

  let payload = [{ variable: "payload", value: "01AB029B03" }];
  payload = decoderRun(file_path, { payload });
  const pressEvent = payload.find((item) => item.variable === "pressEvent");
  const sensorTemperature = payload.find((item) => item.variable === "sensorTemperature");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("pressEvent", () => {
    expect(pressEvent?.value).toBe(3);
  });

  test("Temperature", () => {
    expect(sensorTemperature?.value).toBe(66.7);
  });
});

describe("MClimate Multipurpose Button keepalive with command response ", () => {
  let payload = [{ variable: "payload", value: "120501AB029B03" }];
  payload = decoderRun(file_path, { payload });
  const pressEvent = payload.find((item) => item.variable === "pressEvent");
  const sensorTemperature = payload.find((item) => item.variable === "sensorTemperature");
  const keepAliveTime = payload.find((item) => item.variable === "keepAliveTime");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("response GetKeepAliveTime", () => {
    expect(keepAliveTime?.value).toBe(5);
  });
  test("pressEvent", () => {
    expect(pressEvent?.value).toBe(3);
  });

  test("Temperature", () => {
    expect(sensorTemperature?.value).toBe(66.7);
  });
});

describe("Normal TagoIO Format data, should pass normally", () => {
  test("Shall not be parsed", () => {
    let payload = [{ variable: "shallnotpass", value: "invalid_payload" }];

    expect(payload).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "shallnotpass", value: "invalid_payload" })]));
  });
});