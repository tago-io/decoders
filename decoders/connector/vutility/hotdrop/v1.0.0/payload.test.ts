import { describe, expect, test } from "vitest";
import { DataToSend } from "@tago-io/sdk/lib/types";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/vutility/hotdrop/v1.0.0/payload.js";

let payload: DataToSend[] = [];

describe("Shall not be parsed", () => {
  payload = [
    { variable: "shallnotpass", value: "04096113950292" },
    { variable: "fport", value: 9 },
  ];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([
      { variable: "shallnotpass", value: "04096113950292" },
      { variable: "fport", value: 9 },
    ]);
  });
});

