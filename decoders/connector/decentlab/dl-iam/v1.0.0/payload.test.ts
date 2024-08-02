import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/decentlab/dl-iam/v1.0.0/payload.js" as const;

  describe("Payload decoder test 1", () => {
  const payload = [
    {
      variable: "payload",
      value: "020bbd007f0b926a515d48bc4e0262006981c7000093d4000b0111",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.activity_counter).toBe(11);
    expect(values.air_humidity).toBe(36.44);
    expect(values.air_temperature).toBe(27.68);
    expect(values.ambient_light_infrared).toBe(105);
    expect(values.ambient_light_visible_infrared).toBe(610);
    expect(values.barometric_pressure).toBe(96412);
    expect(values.battery_voltage).toBe(2.96);
    expect(values.co2_concentration).toBe(455);
    expect(values.co2_sensor_status).toBe(0);
    expect(values.device_id).toBe(3005);
    expect(values.illuminance).toBe(678.77);
    expect(values.protocol_version).toBe(2);
    expect(values.raw_ir_reading).toBe(37844);
    expect(values.total_voc).toBe(273);
  });
});

describe("Payload decoder test 2", () => {
  const payload = [
    {
      variable: "payload",
      value: "020bbd006f0b926a515d48bc4e02620069000b0111",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.activity_counter).toBe(11);
    expect(values.air_humidity).toBe(36.44);
    expect(values.air_temperature).toBe(27.68);
    expect(values.ambient_light_infrared).toBe(105);
    expect(values.ambient_light_visible_infrared).toBe(610);
    expect(values.barometric_pressure).toBe(96412);
    expect(values.battery_voltage).toBe(2.96);
    expect(values.device_id).toBe(3005);
    expect(values.illuminance).toBe(678.77);
    expect(values.protocol_version).toBe(2);
    expect(values.total_voc).toBe(273);
  });
});

describe("Payload decoder test 3", () => {
  const payload = [
    {
      variable: "payload",
      value: "020bbd00010b92",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(2.96);
    expect(values.device_id).toBe(3005);
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
