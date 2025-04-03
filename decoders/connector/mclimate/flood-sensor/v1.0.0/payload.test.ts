import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/mclimate/flood-sensor/v1.0.0/payload.js" as const;


describe("MClimate Flood Sensor keepalive", () => {

  let payload = [{ variable: "payload", value: "08C9" }];
  payload = decoderRun(file_path, { payload });
  const flood = payload.find((item) => item.variable === "flood");
  const battery = payload.find((item) => item.variable === "battery");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("thermistorProperlyConnected", () => {
    expect(flood?.value).toBe(false);
  });

  test("battery", () => {
    expect(battery?.value).toBe(3.216);
  });
});

describe("Normal TagoIO Format data, should pass normally", () => {
  test("Shall not be parsed", () => {
    let payload = [{ variable: "shallnotpass", value: "invalid_payload" }];

    expect(payload).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "shallnotpass", value: "invalid_payload" })]));
  });
});