/* eslint-disable unicorn/numeric-separators-style */
import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "/decoders/connector/khomp/its-312-iot/v1.0.0/payload.ts" as const;

describe("The data below should not be parsed", () => {
  let payload = [
    { bn: "142143", bt: 1733859162, metadata: { mqtt_topic: "uns/euclides/pipa" } },
    { n: "battery", u: "%EL", v: 100, metadata: { mqtt_topic: "uns/euclides/pipa" } },
    { n: "rssi", u: "dBW", v: -109, metadata: { mqtt_topic: "uns/euclides/pipa" } },
    { n: "ext_pwr", vb: true, metadata: { mqtt_topic: "uns/euclides/pipa" } },
    { n: "update", vb: true, metadata: { mqtt_topic: "uns/euclides/pipa" } },
    { n: "c1_count", u: "count", v: 640, metadata: { mqtt_topic: "uns/euclides/pipa" } },
    { n: "c2_status", vb: false, metadata: { mqtt_topic: "uns/euclides/pipa" } },
    { n: "relay", vs: "NC", metadata: { mqtt_topic: "uns/euclides/pipa" } },
    { n: "env_temp", u: "Cel", v: 32.4, metadata: { mqtt_topic: "uns/euclides/pipa" } },
    { n: "env_hum", u: "%RH", v: 32.4, metadata: { mqtt_topic: "uns/euclides/pipa" } },
  ];

  payload = decoderRun(file_path, { payload });

  console.log(payload);

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Expected values", () => {
    expect(payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "device_number", value: "142143" }),
        expect.objectContaining({
          variable: "battery",
          value: 100,
          metadata: undefined,
          unit: "%EL",
          location: undefined,
        }),
        expect.objectContaining({
          variable: "rssi",
          value: -109,
          metadata: undefined,
          unit: "dBW",
          location: undefined,
        }),
        expect.objectContaining({
          variable: "ext_pwr",
          value: true,
          metadata: undefined,
          unit: undefined,
          location: undefined,
        }),
        expect.objectContaining({
          variable: "update",
          value: true,
          metadata: undefined,
          unit: undefined,
          location: undefined,
        }),
        expect.objectContaining({
          variable: "c_count",
          value: 640,
          metadata: undefined,
          unit: "count",
          location: undefined,
        }),
        expect.objectContaining({
          variable: "c_status",
          value: undefined,
          metadata: undefined,
          unit: undefined,
          location: undefined,
        }),
        expect.objectContaining({
          variable: "relay",
          value: "NC",
          metadata: undefined,
          unit: undefined,
          location: undefined,
        }),
        expect.objectContaining({
          variable: "env_temp",
          value: 32.4,
          metadata: undefined,
          unit: "Cel",
          location: undefined,
        }),
        expect.objectContaining({
          variable: "env_hum",
          value: 32.4,
          metadata: undefined,
          unit: "%RH",
          location: undefined,
        }),
        expect.objectContaining({
          variable: "payload",
          value: expect.any(String),
        }),
      ])
    );
  });
});
