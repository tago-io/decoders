import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/decentlab/dl-isf/v1.0.0/payload.js" as const;

  describe("Payload decoder test 1", () => {
  const payload = [
    {
      variable: "payload",
      value: "023d0100030c290bab0c3e79707a1d78437991490845997e4cacdeaa6e00000000457e415a0b59",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.alpha_inner).toBe(0.0);
    expect(values.alpha_outer).toBe(-0.05);
    expect(values.battery_voltage).toBe(2.9);
    expect(values.beta_inner).toBe(-0.04);
    expect(values.beta_outer).toBe(-0.15);
    expect(values.device_id).toBe(15617);
    expect(values.diagnostic).toBe(0);
    expect(values.heat_velocity_inner).toBe(0.14);
    expect(values.heat_velocity_outer).toBe(-2.21);
    expect(values.max_voltage).toBe(11.49);
    expect(values.min_voltage).toBe(10.86);
    expect(values.protocol_version).toBe(2);
    expect(values.sap_flow).toBe(-0.19);
    expect(values.temperature_outer).toBe(-4.36);
    expect(values.tmax_inner).toBe(35.63);
    expect(values.tmax_outer).toBe(37.39);
    expect(values.upstream_tmax_inner).toBe(33.46);
    expect(values.upstream_tmax_outer).toBe(35.58);
  });
});

describe("Payload decoder test 2", () => {
  const payload = [
    {
      variable: "payload",
      value: "023d0100020b59",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(2.9);
    expect(values.device_id).toBe(15617);
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
