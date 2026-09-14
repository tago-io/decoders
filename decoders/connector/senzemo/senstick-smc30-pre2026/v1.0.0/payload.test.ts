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

// Networks hand the raw frame over under different variable names, encodings and port
// spellings. Whichever one is used, the decoded output must be identical.
describe("Senstick SMC30 (pre-2026) - network variable-name and encoding compatibility", () => {
  const HEX = "01092e1194279450";
  const PORT = 1;
  const BASE64 = Buffer.from(HEX, "hex").toString("base64");

  // The decoders append their variables with payload.concat(), so their own
  // contribution is the tail beyond the input they were handed.
  function decodedFrom(input: DataToSend[]) {
    const output = decoderRun(file_path, { payload: input });
    return output.slice(input.length).map((x) => ({ variable: x.variable, value: x.value }));
  }

  const expected = decodedFrom([
    { variable: "payload_raw", value: HEX },
    { variable: "port", value: PORT },
  ]);

  test("The reference decoding is not empty", () => {
    expect(expected.length).toBeGreaterThan(0);
  });

  test("Decodes TTI/TTN v3 output (frm_payload + fport)", () => {
    expect(decodedFrom([
      { variable: "frm_payload", value: HEX },
      { variable: "fport", value: PORT },
    ])).toEqual(expected);
  });

  test("Decodes ChirpStack/BrDot output (base64 data + fPort)", () => {
    expect(decodedFrom([
      { variable: "data", value: BASE64 },
      { variable: "fPort", value: PORT },
    ])).toEqual(expected);
  });

  test("Decodes Orbiwise output (base64 dataFrame + port)", () => {
    expect(decodedFrom([
      { variable: "dataFrame", value: BASE64 },
      { variable: "port", value: PORT },
    ])).toEqual(expected);
  });

  test("Decodes machineQ output (hex payload + FPort as a string)", () => {
    expect(decodedFrom([
      { variable: "payload", value: HEX },
      { variable: "FPort", value: String(PORT) },
    ])).toEqual(expected);
  });
  test("Rejects malformed hex in a hex-named variable instead of reading it as base64", () => {
    const output = decoderRun(file_path, {
      payload: [
        { variable: "payload", value: `${HEX.slice(0, -1)}Z` },
        { variable: "port", value: PORT },
      ],
    });
    expect(output.find((x: DataToSend) => x.variable === "parse_error")?.value).toBe('Could not decode "payload" as hex');
  });
  test("Takes the group from serie when the network sets no group", () => {
    const output = decoderRun(file_path, {
      payload: [
        { variable: "payload", value: HEX, serie: "777" },
        { variable: "port", value: PORT },
      ],
    });
    expect(output.find((x: DataToSend) => x.variable === "temperature")?.group).toBe("777");
  });
});
