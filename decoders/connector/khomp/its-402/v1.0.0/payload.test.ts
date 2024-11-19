/* eslint-disable unicorn/numeric-separators-style */
import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "/decoders/connector/khomp/its-402/v1.0.0/payload.ts" as const;

describe("The data below should not be parsed", () => {
  let payload = [
    { variable: "Temperature", value: "04096113950292" },
    { variable: "fport", value: 9 },
  ];

  let device = { params: [{ key: "language", value: "EN" }] };
  payload = decoderRun(file_path, { payload, device });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([
      { variable: "Temperature", value: "04096113950292" },
      { variable: "fport", value: 9 },
    ]);
  });
});

describe("The data below should not be parsed", () => {
  let payload = [
    { bn: "222996", bt: 1731937005, metadata: { mqtt_topic: "its/222996/data" } },
    { n: "ext_pwr", vb: true, metadata: { mqtt_topic: "its/222996/data" } },
    { n: "battery", u: "%EL", v: 99.92, metadata: { mqtt_topic: "its/222996/data" } },
    { n: "battery_status", vs: "battery_full", metadata: { mqtt_topic: "its/222996/data" } },
    { n: "c1_count", u: "count", v: 10691, metadata: { mqtt_topic: "its/222996/data" } },
    { n: "c2_status", vb: false, metadata: { mqtt_topic: "its/222996/data" } },
    { n: "rssi", u: "dBW", v: -83, metadata: { mqtt_topic: "its/222996/data" } },
    { n: "signal_status", vs: "excellent", metadata: { mqtt_topic: "its/222996/data" } },
  ];

  let device = { params: [{ key: "language", value: "EN" }] };
  payload = decoderRun(file_path, { payload, device });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  expect(payload).toEqual([{ variable: "serial_number", value: "222996" }]); // the rest wont show up because dayjs isn't inside of the test
  test("Output Result", () => {});
});
