import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/decentlab/dl-atm41/v1.0.0/payload.js" as const;

  describe("Payload decoder test 1", () => {
  const payload = [
    {
      variable: "payload",
      value: "02035a0003800a8000800080008009812b8014810880b4a57c820c810980027fe88056800880040bf5",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.air_temperature).toBe(26.4);
    expect(values.atmospheric_pressure).toBe(95.96);
    expect(values.battery_voltage).toBe(3.06);
    expect(values.compass_heading).toBe(86);
    expect(values.device_id).toBe(858);
    expect(values.east_wind_speed).toBe(0.04);
    expect(values.lightning_average_distance).toBe(0);
    expect(values.lightning_strike_count).toBe(0);
    expect(values.maximum_wind_speed).toBe(0.2);
    expect(values.north_wind_speed).toBe(0.08);
    expect(values.precipitation).toBe(0);
    expect(values.protocol_version).toBe(2);
    expect(values.relative_humidity).toBe(52.4);
    expect(values.sensor_temperature_internal).toBe(26.5);
    expect(values.solar_radiation).toBe(10);
    expect(values.vapor_pressure).toBe(1.8);
    expect(values.wind_direction).toBe(29.9);
    expect(values.wind_speed).toBe(0.09);
    expect(values.x_orientation_angle).toBe(0.2);
    expect(values.y_orientation_angle).toBe(-2.4);
  });
});

describe("Payload decoder test 2", () => {
  const payload = [
    {
      variable: "payload",
      value: "02035a00020bf5",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(3.06);
    expect(values.device_id).toBe(858);
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
