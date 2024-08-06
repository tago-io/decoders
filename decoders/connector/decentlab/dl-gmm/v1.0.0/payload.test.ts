import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/decentlab/dl-gmm/v1.0.0/payload.js" as const;

  describe("Payload decoder test 1", () => {
  const payload = [
    {
      variable: "payload",
      value: "02532b00038726892081148297a57380cf81700bbc",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.air_humidity).toBe(27.6);
    expect(values.air_temperature).toBe(23.36);
    expect(values.atmospheric_pressure).toBe(95.87);
    expect(values.battery_voltage).toBe(3.0);
    expect(values.co2_concentration).toBe(663);
    expect(values.device_id).toBe(21291);
    expect(values.dew_point).toBe(3.68);
    expect(values.photosynthetically_active_radiation).toBe(183);
    expect(values.protocol_version).toBe(2);
    expect(values.vapor_pressure_deficit).toBe(2.07);
  });
});

describe("Payload decoder test 2", () => {
  const payload = [
    {
      variable: "payload",
      value: "02528500020bbc",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(3.0);
    expect(values.device_id).toBe(21125);
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
