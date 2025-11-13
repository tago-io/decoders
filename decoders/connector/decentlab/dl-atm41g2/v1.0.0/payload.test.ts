import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/decentlab/dl-atm41g2/v1.0.0/payload.js" as const;

  describe("Payload decoder test 1", () => {
  const payload = [
    {
      variable: "payload",
      value: "025ef80003805c000080008000803484b3803680e78086a60181d680ed81c9809f8000117000010adc",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.air_temperature).toBe(23.1);
    expect(values.barometric_pressure).toBe(97.29);
    expect(values.battery_voltage).toBe(2.78);
    expect(values.cumulative_precipitation).toBe(70);
    expect(values.device_id).toBe(24312);
    expect(values.internal_temperature).toBe(23.7);
    expect(values.lightning_average_distance).toBe(0);
    expect(values.lightning_strike_count).toBe(0);
    expect(values.maximum_wind_speed).toBe(0.54);
    expect(values.precipitation).toBe(0);
    expect(values.precipitation_electrical_conductivity).toBe(0);
    expect(values.protocol_version).toBe(2);
    expect(values.relative_humidity).toBe(47);
    expect(values.solar_radiation).toBe(9.2);
    expect(values.tilt_angle_x_orientation).toBe(45.7);
    expect(values.tilt_angle_y_orientation).toBe(15.9);
    expect(values.vapor_pressure).toBe(1.34);
    expect(values.wind_direction).toBe(120.3);
    expect(values.wind_speed).toBe(0.52);
  });
});

describe("Payload decoder test 2", () => {
  const payload = [
    {
      variable: "payload",
      value: "025ef800020adc",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(2.78);
    expect(values.device_id).toBe(24312);
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
