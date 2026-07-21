import { describe, expect, test, beforeEach } from "vitest";
import { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/senzemo/senstick-smc30-pre2026/v1.0.0/payload.ts";

let payload: DataToSend[] = [];

describe("Senstick SMC30 - data packet decode", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "01092e1194279450" },
      { variable: "port", value: 1 },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Output is an array", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Decodes status correctly", () => {
    const status = payload.find((x) => x.variable === "status");
    expect(status?.value).toBe(1);
  });

  test("Decodes temperature correctly", () => {
    const temperature = payload.find((x) => x.variable === "temperature");
    expect(temperature?.value).toBe(23.5);
  });

  test("Decodes humidity correctly", () => {
    const humidity = payload.find((x) => x.variable === "humidity");
    expect(humidity?.value).toBe(45);
  });

  test("Decodes air pressure correctly", () => {
    const air_pressure = payload.find((x) => x.variable === "air_pressure");
    expect(air_pressure?.value).toBe(1013.2);
  });

  test("Decodes battery level correctly", () => {
    const battery_level = payload.find((x) => x.variable === "battery_level");
    expect(battery_level?.value).toBe(1.8);
  });

  test("Decodes battery percent correctly", () => {
    const battery_percent = payload.find((x) => x.variable === "battery_percent");
    expect(battery_percent?.value).toBe(12.5);
  });
});

describe("Shall not be parsed", () => {
  beforeEach(() => {
    payload = [{ variable: "shallnotpass", value: "04096113950292" }];
    payload = decoderRun(file_path, { payload });
  });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "shallnotpass", value: "04096113950292" }]);
  });
});