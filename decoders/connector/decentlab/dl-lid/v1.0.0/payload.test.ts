import { describe, test, expect } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/decentlab/dl-lid/v1.0.0/payload.js" as const;

  describe("Payload decoder test 1", () => {
  const payload = [
    {
      variable: "payload",
      value: "0211c90003119b117611bc119e118a119411a811a81194006401990abd",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(2.75);
    expect(values.device_id).toBe(4553);
    expect(values.distance_10th_percentile).toBe(4490);
    expect(values.distance_25th_percentile).toBe(4500);
    expect(values.distance_75th_percentile).toBe(4520);
    expect(values.distance_90th_percentile).toBe(4520);
    expect(values.distance_average).toBe(4507);
    expect(values.distance_maximum).toBe(4540);
    expect(values.distance_median).toBe(4510);
    expect(values.distance_minimum).toBe(4470);
    expect(values.distance_most_frequent_value).toBe(4500);
    expect(values.number_of_samples).toBe(100);
    expect(values.protocol_version).toBe(2);
    expect(values.total_acquisition_time).toBe(399.41);
  });
});

describe("Payload decoder test 2", () => {
  const payload = [
    {
      variable: "payload",
      value: "0211c900020abd",
    },
  ];
  const decoded = decoderRun(file_path, { payload });
  const values = Object.fromEntries(
    decoded.map((it) => [it.variable, it.value ?? 0]),
  );

  test("Decoded values", () => {
    expect(values.battery_voltage).toBe(2.75);
    expect(values.device_id).toBe(4553);
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
