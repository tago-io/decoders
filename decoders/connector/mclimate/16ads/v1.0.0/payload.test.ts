import { describe, test, expect, beforeEach } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/mclimate/16ads/v1.0.0/payload.js" as const;


describe("MClimate 16ADS keepalive", () => {

  let payload = [{ variable: "payload", value: "011C01" }];
  payload = decoderRun(file_path, { payload });
  const internalTemperature = payload.find((item) => item.variable === "internalTemperature");
  const relayState = payload.find((item) => item.variable === "relayState");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("internalTemperature", () => {
    expect(internalTemperature?.value).toBe(28);
  });

  test("relayState", () => {
    expect(relayState?.value).toBe('ON');
  });
});

describe("MClimate 16ADS keepalive with command response ", () => {
  let payload = [{ variable: "payload", value: "1205011C01" }];
  payload = decoderRun(file_path, { payload });
  const internalTemperature = payload.find((item) => item.variable === "internalTemperature");
  const relayState = payload.find((item) => item.variable === "relayState");
  const keepAliveTime = payload.find((item) => item.variable === "keepAliveTime");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("response GetKeepAliveTime", () => {
    expect(keepAliveTime?.value).toBe(5);
  });

  test("internalTemperature", () => {
    expect(internalTemperature?.value).toBe(28);
  });

  test("relayState", () => {
    expect(relayState?.value).toBe('ON');
  });
});

describe("Normal TagoIO Format data, should pass normally", () => {
  test("Shall not be parsed", () => {
    let payload = [{ variable: "shallnotpass", value: "invalid_payload" }];

    expect(payload).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "shallnotpass", value: "invalid_payload" })]));
  });
});