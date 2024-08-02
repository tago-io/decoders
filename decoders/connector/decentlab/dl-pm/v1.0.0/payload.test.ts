import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/decentlab/dl-pm/v1.0.0/payload.js" as const;

  describe("Payload decoder test 1", () => {
  const payload = [
    {
      variable: "payload",
      value: "021b50000f0c25002500270027002701f50107012c012d012d012d67bd618dbd10",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.air_humidity).toBe(41.63);
    expect(values.air_temperature).toBe(24.36);
    expect(values.barometric_pressure).toBe(96800);
    expect(values.battery_voltage).toBe(3.11);
    expect(values.device_id).toBe(6992);
    expect(values.pm0_5_number_concentration).toBe(26.3);
    expect(values.pm10_mass_concentration).toBe(3.9);
    expect(values.pm10_number_concentration).toBe(30.1);
    expect(values.pm1_0_mass_concentration).toBe(3.7);
    expect(values.pm1_0_number_concentration).toBe(30);
    expect(values.pm2_5_mass_concentration).toBe(3.9);
    expect(values.pm2_5_number_concentration).toBe(30.1);
    expect(values.pm4_mass_concentration).toBe(3.9);
    expect(values.pm4_number_concentration).toBe(30.1);
    expect(values.protocol_version).toBe(2);
    expect(values.typical_particle_size).toBe(501);
  });
});

describe("Payload decoder test 2", () => {
  const payload = [
    {
      variable: "payload",
      value: "021b50000d0c2567bd618dbd10",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.air_humidity).toBe(41.63);
    expect(values.air_temperature).toBe(24.36);
    expect(values.barometric_pressure).toBe(96800);
    expect(values.battery_voltage).toBe(3.11);
    expect(values.device_id).toBe(6992);
    expect(values.protocol_version).toBe(2);
  });
});

describe("Payload decoder test 3", () => {
  const payload = [
    {
      variable: "payload",
      value: "021b5000010c25",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(3.11);
    expect(values.device_id).toBe(6992);
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
