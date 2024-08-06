import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/decentlab/dl-sdd/v1.0.0/payload.js" as const;

  describe("Payload decoder test 1", () => {
  const payload = [
    {
      variable: "payload",
      value: "0243e300058000800080008000800080008741877b8749876c876c876600000000000000000000014a09e3",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(2.53);
    expect(values.device_id).toBe(17379);
    expect(values.moisture_at_level_0).toBe(0);
    expect(values.moisture_at_level_1).toBe(0);
    expect(values.moisture_at_level_2).toBe(0);
    expect(values.moisture_at_level_3).toBe(0);
    expect(values.moisture_at_level_4).toBe(0);
    expect(values.moisture_at_level_5).toBe(0);
    expect(values.protocol_version).toBe(2);
    expect(values.salinity_at_level_0).toBe(-100);
    expect(values.salinity_at_level_1).toBe(-100);
    expect(values.salinity_at_level_2).toBe(-100);
    expect(values.salinity_at_level_3).toBe(-100);
    expect(values.salinity_at_level_4).toBe(-100);
    expect(values.salinity_at_level_5).toBe(230);
    expect(values.temperature_at_level_0).toBe(18.57);
    expect(values.temperature_at_level_1).toBe(19.15);
    expect(values.temperature_at_level_2).toBe(18.65);
    expect(values.temperature_at_level_3).toBe(19);
    expect(values.temperature_at_level_4).toBe(19);
    expect(values.temperature_at_level_5).toBe(18.94);
  });
});

describe("Payload decoder test 2", () => {
  const payload = [
    {
      variable: "payload",
      value: "0243e3000409e3",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(2.53);
    expect(values.device_id).toBe(17379);
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
