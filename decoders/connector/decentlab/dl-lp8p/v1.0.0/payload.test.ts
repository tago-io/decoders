import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/decentlab/dl-lp8p/v1.0.0/payload.js" as const;

  describe("Payload decoder test 1", () => {
  const payload = [
    {
      variable: "payload",
      value: "020578000f67bd618d1cedbd1081d981f4895b0bd80bb50000959895390c25",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.air_humidity).toBe(41.63);
    expect(values.air_temperature).toBe(24.36);
    expect(values.barometer_temperature).toBe(24.05);
    expect(values.barometric_pressure).toBe(96800);
    expect(values.battery_voltage).toBe(3.11);
    expect(values.capacitor_voltage_1).toBe(3.03);
    expect(values.capacitor_voltage_2).toBe(3.0);
    expect(values.co2_concentration).toBe(473);
    expect(values.co2_concentration_lpf).toBe(500);
    expect(values.co2_sensor_status).toBe(0);
    expect(values.co2_sensor_temperature).toBe(23.95);
    expect(values.device_id).toBe(1400);
    expect(values.protocol_version).toBe(2);
    expect(values.raw_ir_reading).toBe(38296);
    expect(values.raw_ir_reading_lpf).toBe(38201);
  });
});

describe("Payload decoder test 2", () => {
  const payload = [
    {
      variable: "payload",
      value: "020578000b67bd618d1cedbd100c25",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.air_humidity).toBe(41.63);
    expect(values.air_temperature).toBe(24.36);
    expect(values.barometer_temperature).toBe(24.05);
    expect(values.barometric_pressure).toBe(96800);
    expect(values.battery_voltage).toBe(3.11);
    expect(values.device_id).toBe(1400);
    expect(values.protocol_version).toBe(2);
  });
});

describe("Payload decoder test 3", () => {
  const payload = [
    {
      variable: "payload",
      value: "02057800080c25",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(3.11);
    expect(values.device_id).toBe(1400);
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
