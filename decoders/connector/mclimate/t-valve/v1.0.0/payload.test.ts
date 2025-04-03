import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/mclimate/t-valve/v1.0.0/payload.js" as const;


describe("MClimate T-Valve keepalive", () => {
  let payload = [{ variable: "payload", value: "2CC0" }];
  payload = decoderRun(file_path, { payload });
  const valveState = payload.find((item) => item.variable === "valveState");
  const waterTemp = payload.find((item) => item.variable === "waterTemp");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Valve State", () => {
    expect(valveState?.value).toBe(true);
  });

  test("Water Temp", () => {
    expect(waterTemp?.value).toBe(22);
  });
});

describe("Normal TagoIO Format data, should pass normally", () => {
  test("Shall not be parsed", () => {
    let payload = [{ variable: "shallnotpass", value: "invalid_payload" }];

    expect(payload).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "shallnotpass", value: "invalid_payload" })]));
  });
});
