/* eslint-disable unicorn/numeric-separators-style */
import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/tagoiobrand/tagoiodevice/v1.0.0/payload.ts" as const;

describe("Example decoder unit test", () => {
  const raw_payload = [{ variable: "payload", value: "0109611395" }];
  const payload = decoderRun(file_path, { payload: raw_payload });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  const temperature = payload.find((item) => item.variable === "temperature");
  const humidity = payload.find((item) => item.variable === "humidity");
  const protocol_version = payload.find((item) => item.variable === "protocol_version");

  test("Check if variable exists", () => {
    expect(temperature).toBeTruthy();
    expect(humidity).toBeTruthy();
    expect(protocol_version).toBeTruthy();
  });

  test("Check output values", () => {
    expect(temperature?.value).toBe(24.01);
    expect(humidity?.value).toBe(50.13);
    expect(protocol_version?.value).toBe(1);
  });

  test("Check variable unit", () => {
    expect(temperature?.unit).toBe("°C");
    expect(humidity?.unit).toBe("%");
  });
});
