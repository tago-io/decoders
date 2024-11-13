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
