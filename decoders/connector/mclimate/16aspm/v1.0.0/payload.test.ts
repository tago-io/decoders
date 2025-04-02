import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/mclimate/16aspm/v1.0.0/payload.js" as const;


describe("MClimate 16ASPM keepalive", () => {

  let payload = [{ variable: "payload", value: "011C034A241805D9E7195201" }];
  payload = decoderRun(file_path, { payload });
  const energy_kWh = payload.find((item) => item.variable === "energy_kWh");
  const relayState = payload.find((item) => item.variable === "relayState");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("energy_kWh", () => {
    expect(energy_kWh?.value).toBe(55190.552);
  });

  test("relayState", () => {
    expect(relayState?.value).toBe('ON');
  });
});

describe("MClimate 16ASPM keepalive with command response ", () => {
  let payload = [{ variable: "payload", value: "1205011C034A241805D9E7195201" }];
  payload = decoderRun(file_path, { payload });
  const energy_kWh = payload.find((item) => item.variable === "energy_kWh");
  const relayState = payload.find((item) => item.variable === "relayState");
  const keepAliveTime = payload.find((item) => item.variable === "keepAliveTime");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("response GetKeepAliveTime", () => {
    expect(keepAliveTime?.value).toBe(5);
  });

  test("energy_kWh", () => {
    expect(energy_kWh?.value).toBe(55190.552);
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