import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/mclimate/open-close/v1.0.0/payload.js" as const;


describe("MClimate Open/Close keepalive", () => {
  let payload = [{ variable: "payload", value: "01AB00D91B5CAE01" }];
  payload = decoderRun(file_path, { payload });
  const counter = payload.find((item) => item.variable === "counter");
  const temperature = payload.find((item) => item.variable === "temperature");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Counter", () => {
    expect(counter?.value).toBe(1793198);
  });

  test("Temperature", () => {
    expect(temperature?.value).toBe(21.7);
  });
});

describe("MClimate Open/Close keepalive with command response ", () => {
  let payload = [{ variable: "payload", value: "120501AB00D91B5CAE01" }];
  payload = decoderRun(file_path, { payload });
  const counter = payload.find((item) => item.variable === "counter");
  const temperature = payload.find((item) => item.variable === "temperature");
  const keepAliveTime = payload.find((item) => item.variable === "keepAliveTime");
  
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("response GetKeepAliveTime", () => {
    expect(keepAliveTime?.value).toBe(5);
  });
  test("Counter", () => {
    expect(counter?.value).toBe(1793198);
  });

  test("Temperature", () => {
    expect(temperature?.value).toBe(21.7);
  });
});

describe("Normal TagoIO Format data, should pass normally", () => {
  test("Shall not be parsed", () => {
    let payload = [{ variable: "shallnotpass", value: "invalid_payload" }];

    expect(payload).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "shallnotpass", value: "invalid_payload" })]));
  });
});