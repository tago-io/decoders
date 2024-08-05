import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/decentlab/dl-pheht/v1.0.0/payload.js" as const;

  describe("Payload decoder test 1", () => {
  const payload = [
    {
      variable: "payload",
      value: "0252b800030000884282c77f637ff60c5c",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(3.16);
    expect(values.device_id).toBe(21176);
    expect(values.ph).toBe(7.11);
    expect(values.ph_mv).toBe(-1);
    expect(values.protocol_version).toBe(2);
    expect(values.redox).toBe(-15.7);
    expect(values.status).toBe(0);
    expect(values.temperature).toBe(21.14);
  });
});

describe("Payload decoder test 2", () => {
  const payload = [
    {
      variable: "payload",
      value: "0252b800020c5c",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(3.16);
    expect(values.device_id).toBe(21176);
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
