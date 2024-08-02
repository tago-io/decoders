import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/decentlab/dl-atm22/v1.0.0/payload.js" as const;

  describe("Payload decoder test 1", () => {
  const payload = [
    {
      variable: "payload",
      value: "0208c900038009812b8014810880027fe8800880040bf5",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.air_temperature).toBe(26.4);
    expect(values.battery_voltage).toBe(3.06);
    expect(values.device_id).toBe(2249);
    expect(values.east_wind_speed).toBe(0.04);
    expect(values.maximum_wind_speed).toBe(0.2);
    expect(values.north_wind_speed).toBe(0.08);
    expect(values.protocol_version).toBe(2);
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
      value: "0208c900020bf5",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(3.06);
    expect(values.device_id).toBe(2249);
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
