import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/decentlab/dl-smtp/v1.0.0/payload.js" as const;

  describe("Payload decoder test 1", () => {
  const payload = [
    {
      variable: "payload",
      value: "020b50000309018a8c09438a9809278a920b3c8aa50c9c8a8c11e08aa500000000000000000b3b",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(2.88);
    expect(values.device_id).toBe(2896);
    expect(values.protocol_version).toBe(2);
    expect(values.soil_moisture_at_depth_0).toBe(-0.39);
    expect(values.soil_moisture_at_depth_1).toBe(-0.26);
    expect(values.soil_moisture_at_depth_2).toBe(-0.31);
    expect(values.soil_moisture_at_depth_3).toBe(0.75);
    expect(values.soil_moisture_at_depth_4).toBe(1.46);
    expect(values.soil_moisture_at_depth_5).toBe(4.15);
    expect(values.soil_moisture_at_depth_6).toBe(-5);
    expect(values.soil_moisture_at_depth_7).toBe(-5);
    expect(values.soil_temperature_at_depth_0).toBe(27);
    expect(values.soil_temperature_at_depth_1).toBe(27.12);
    expect(values.soil_temperature_at_depth_2).toBe(27.06);
    expect(values.soil_temperature_at_depth_3).toBe(27.25);
    expect(values.soil_temperature_at_depth_4).toBe(27);
    expect(values.soil_temperature_at_depth_5).toBe(27.25);
    expect(values.soil_temperature_at_depth_6).toBe(-327.68);
    expect(values.soil_temperature_at_depth_7).toBe(-327.68);
  });
});

describe("Payload decoder test 2", () => {
  const payload = [
    {
      variable: "payload",
      value: "020b5000020b3b",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(2.88);
    expect(values.device_id).toBe(2896);
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
