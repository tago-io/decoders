import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/decentlab/dl-ntu/v1.0.0/payload.js" as const;

  describe("Payload decoder test 1", () => {
  const payload = [
    {
      variable: "payload",
      value: "022332000300008885013e013e02330b10",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(2.83);
    expect(values.device_id).toBe(9010);
    expect(values.protocol_version).toBe(2);
    expect(values.status).toBe(0);
    expect(values.temperature).toBe(21.81);
    expect(values.turbidity_in_fnu).toBe(31.8);
    expect(values.turbidity_in_mg_l).toBe(56.3);
    expect(values.turbidity_in_ntu).toBe(31.8);
  });
});

describe("Payload decoder test 2", () => {
  const payload = [
    {
      variable: "payload",
      value: "02233200020b10",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(2.83);
    expect(values.device_id).toBe(9010);
    expect(values.protocol_version).toBe(2);
  });
});


describe("Shall not be parsed", () => {
  let payload = [{ variable: "shallnotpass", value: "04096113950292" }];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([
      { variable: "shallnotpass", value: "04096113950292" },
    ]);
  });
});
