import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/decentlab/dl-cws2/v1.0.0/payload.js" as const;

  describe("Payload decoder test 1", () => {
  const payload = [
    {
      variable: "payload",
      value: "0258c000074676fa0a81c9813fa6d88137802581300b91",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.air_humidity).toBe(99.44);
    expect(values.air_humidity_radiation_shield).toBe(97.67);
    expect(values.air_temperature).toBe(3.19);
    expect(values.air_temperature_radiation_shield).toBe(3.17);
    expect(values.angle).toBe(37);
    expect(values.battery_voltage).toBe(2.96);
    expect(values.device_id).toBe(22720);
    expect(values.dew_point).toBe(3.11);
    expect(values.protocol_version).toBe(2);
    expect(values.sensor_temperature).toBe(3.04);
    expect(values.surface_temperature).toBe(4.57);
  });
});

describe("Payload decoder test 2", () => {
  const payload = [
    {
      variable: "payload",
      value: "0258c000040b91",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(2.96);
    expect(values.device_id).toBe(22720);
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
