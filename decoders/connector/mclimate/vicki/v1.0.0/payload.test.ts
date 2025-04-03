import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/mclimate/vicki/v1.0.0/payload.js" as const;

describe("MClimate Vicki keepalive", () => {
  let payload = [{ variable: "payload", value: "011D5A78FA2C01F080" }];
  payload = decoderRun(file_path, { payload });
  const sensorTemperature = payload.find((item) => item.variable === "sensorTemperature");
  const motorPosition = payload.find((item) => item.variable === "motorPosition");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Sensor Temperature", () => {
    expect(sensorTemperature?.value).toBe(18.01);
  });

  test("Motor Position", () => {
    expect(motorPosition?.value).toBe(250);
  });
});

describe("MClimate Vicki keepalive with command response ", () => {
  let payload = [{ variable: "payload", value: "1205011D5A78FA2C01F080" }];
  payload = decoderRun(file_path, { payload });
  const sensorTemperature = payload.find((item) => item.variable === "sensorTemperature");
  const motorPosition = payload.find((item) => item.variable === "motorPosition");
  const keepAliveTime = payload.find((item) => item.variable === "keepAliveTime");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("response GetKeepAliveTime", () => {
    expect(keepAliveTime?.value).toBe(5);
  });

  test("Sensor Temperature", () => {
    expect(sensorTemperature?.value).toBe(18.01);
  });

  test("Motor Position", () => {
    expect(motorPosition?.value).toBe(250);
  });
});

describe("Normal TagoIO Format data, should pass normally", () => {
  test("Shall not be parsed", () => {
    let payload = [{ variable: "shallnotpass", value: "invalid_payload" }];

    expect(payload).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "shallnotpass", value: "invalid_payload" })]));
  });
});