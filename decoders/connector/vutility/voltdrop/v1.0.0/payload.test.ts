import { describe, expect, test } from "vitest";
import { DataToSend } from "@tago-io/sdk/lib/types";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/vutility/voltdrop/v1.0.0/payload.js";


describe("Shall not be parsed", () => {
  let payload: DataToSend[] = [
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

describe("Test payload var", () => {
  let payload: DataToSend[] = [
    { variable: "shallnotpass", value: "04096113950292" },
    { variable: "fport", value: 9 },
    { variable: "payload", value: "29FFFFFFFFFFFFFFFFFFFF" }
  ];
  payload = decoderRun(file_path, { payload });
  test("Is Array", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Payload Parsed", () => {
    expect(payload).toEqual([
      { variable: "shallnotpass", value: "04096113950292" },
      { variable: "fport", value: 9 },
      { variable: "payload", value: "29FFFFFFFFFFFFFFFFFFFF" },
      {
        variable: "current", value: "4095.9375,4095.9375,4095.9375",
        metadata: {
          currentL1: 4095.9375,
          currentL2: 4095.9375,
          currentL3: 4095.9375,
        }
      },
      {
        variable: "max_current", value: "36735.439453125,36735.439453125,36735.439453125",
        metadata: {
          maxCurrentL1: 36735.439453125,
          maxCurrentL2: 36735.439453125,
          maxCurrentL3: 36735.439453125,
        }
      },
      {
        variable: "temperature",
        value: 80,
        unit: "C"
      }
    ]);
  });
});

