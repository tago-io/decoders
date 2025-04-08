import { describe, expect, test } from "vitest";
import { DataToSend } from "@tago-io/sdk/lib/types";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/vutility/hotdrop/v1.0.0/payload.js";


describe("Shall not be parsed", () => {
  let payload: DataToSend[] = [
    { variable: "shallnotpass", value: "04096113950292" },
    { variable: "fport", value: 9 },
  ];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  console.log(JSON.stringify(payload));
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
    { variable: "payload", value: "3200000DE800786432FF11" }
  ];
  payload = decoderRun(file_path, { payload });
  test("Is Array", () => {
    expect(Array.isArray(payload)).toBe(true);
  });
  console.log(JSON.stringify(payload));

  test("Payload Parsed", () => {
    expect(payload).toEqual([
      { variable: "shallnotpass", value: "04096113950292" },
      { variable: "fport", value: 9 },
      { variable: "payload", value: "3200000DE800786432FF11" },
      { variable: "amp_hour_accumulation", value: 356 },
      {
        variable: "average_amps",
        value: 12,
        metadata: {
          max_amps: 24,
          min_amps: 6
        }
      },
      {
        variable: "capacitor_voltage",
        value: 5
      },
      {
        variable: "temperature",
        value: -32,
        unit: "C"
      }
    ]);
  });
});

