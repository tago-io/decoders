import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/decentlab/dl-tp/v1.0.0/payload.js" as const;

  describe("Payload decoder test 1", () => {
  const payload = [
    {
      variable: "payload",
      value: "023e3e00038abc8a928aa08a848ab38a898ac38aad8ab78a928aa1000000000000000000000afc",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(2.81);
    expect(values.device_id).toBe(15934);
    expect(values.protocol_version).toBe(2);
    expect(values.temperature_at_level_0).toBe(27.48);
    expect(values.temperature_at_level_1).toBe(27.06);
    expect(values.temperature_at_level_10).toBe(27.21);
    expect(values.temperature_at_level_11).toBe(-327.68);
    expect(values.temperature_at_level_12).toBe(-327.68);
    expect(values.temperature_at_level_13).toBe(-327.68);
    expect(values.temperature_at_level_14).toBe(-327.68);
    expect(values.temperature_at_level_15).toBe(-327.68);
    expect(values.temperature_at_level_2).toBe(27.2);
    expect(values.temperature_at_level_3).toBe(26.92);
    expect(values.temperature_at_level_4).toBe(27.39);
    expect(values.temperature_at_level_5).toBe(26.97);
    expect(values.temperature_at_level_6).toBe(27.55);
    expect(values.temperature_at_level_7).toBe(27.33);
    expect(values.temperature_at_level_8).toBe(27.43);
    expect(values.temperature_at_level_9).toBe(27.06);
  });
});

describe("Payload decoder test 2", () => {
  const payload = [
    {
      variable: "payload",
      value: "023e3e00020afc",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(2.81);
    expect(values.device_id).toBe(15934);
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
