import { describe, expect, test, beforeEach } from "vitest";
import { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/senzemo/senstick-stb10/v1.0.0/payload.ts";

let payload: DataToSend[] = [];

describe("Data packet - 5 bytes (no status)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "09c40a5a80" },
      { variable: "port", value: 2 },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("status", () => {
    expect(payload.find((x) => x.variable === "status")?.value).toBe(0);
  });
  test("temp_buf", () => {
    expect(payload.find((x) => x.variable === "temp_buf")?.value).toBe(25);
  });
  test("temp_inn", () => {
    expect(payload.find((x) => x.variable === "temp_inn")?.value).toBe(26.5);
  });
  test("bat", () => {
    expect(payload.find((x) => x.variable === "bat")?.value).toBe(1302);
  });
});

describe("Data packet - 6 bytes (with status)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "0104b0ffcec8" },
      { variable: "port", value: 2 },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("status", () => {
    expect(payload.find((x) => x.variable === "status")?.value).toBe(1);
  });
  test("temp_buf", () => {
    expect(payload.find((x) => x.variable === "temp_buf")?.value).toBe(12);
  });
  test("temp_inn", () => {
    expect(payload.find((x) => x.variable === "temp_inn")?.value).toBe(-0.5);
  });
  test("bat", () => {
    expect(payload.find((x) => x.variable === "bat")?.value).toBe(1584);
  });
});

describe("Data packet - 13 bytes (no status, with retransmission)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "01f403e832010203ff9c00c8ff" },
      { variable: "port", value: 2 },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("status", () => {
    expect(payload.find((x) => x.variable === "status")?.value).toBe(0);
  });
  test("temp_buf", () => {
    expect(payload.find((x) => x.variable === "temp_buf")?.value).toBe(5);
  });
  test("temp_inn", () => {
    expect(payload.find((x) => x.variable === "temp_inn")?.value).toBe(10);
  });
  test("bat", () => {
    expect(payload.find((x) => x.variable === "bat")?.value).toBe(996);
  });
  test("fcnt_ret", () => {
    expect(payload.find((x) => x.variable === "fcnt_ret")?.value).toBe(66051);
  });
  test("temp_buf_ret", () => {
    expect(payload.find((x) => x.variable === "temp_buf_ret")?.value).toBe(-1);
  });
  test("temp_inn_ret", () => {
    expect(payload.find((x) => x.variable === "temp_inn_ret")?.value).toBe(2);
  });
  test("bat_ret", () => {
    expect(payload.find((x) => x.variable === "bat_ret")?.value).toBe(1800);
  });
});

describe("Data packet - 14 bytes (with status and retransmission)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "070064ff380a0a0b0c012cfed464" },
      { variable: "port", value: 2 },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("status", () => {
    expect(payload.find((x) => x.variable === "status")?.value).toBe(7);
  });
  test("temp_buf", () => {
    expect(payload.find((x) => x.variable === "temp_buf")?.value).toBe(1);
  });
  test("temp_inn", () => {
    expect(payload.find((x) => x.variable === "temp_inn")?.value).toBe(-2);
  });
  test("bat", () => {
    expect(payload.find((x) => x.variable === "bat")?.value).toBe(839);
  });
  test("fcnt_ret", () => {
    expect(payload.find((x) => x.variable === "fcnt_ret")?.value).toBe(658188);
  });
  test("temp_buf_ret", () => {
    expect(payload.find((x) => x.variable === "temp_buf_ret")?.value).toBe(3);
  });
  test("temp_inn_ret", () => {
    expect(payload.find((x) => x.variable === "temp_inn_ret")?.value).toBe(-3);
  });
  test("bat_ret", () => {
    expect(payload.find((x) => x.variable === "bat_ret")?.value).toBe(1192);
  });
});

describe("Config packet - 9 bytes", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "023c0f011503040a15" },
      { variable: "port", value: 3 },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("status", () => {
    expect(payload.find((x) => x.variable === "status")?.value).toBe(2);
  });
  test("send_period", () => {
    expect(payload.find((x) => x.variable === "send_period")?.value).toBe(60);
  });
  test("move_thr", () => {
    expect(payload.find((x) => x.variable === "move_thr")?.value).toBe(15);
  });
  test("packet_confirm", () => {
    expect(payload.find((x) => x.variable === "packet_confirm")?.value).toBe(1);
  });
  test("data_rate", () => {
    expect(payload.find((x) => x.variable === "data_rate")?.value).toBe(5);
  });
  test("adr_on", () => {
    expect(payload.find((x) => x.variable === "adr_on")?.value).toBe(true);
  });
  test("family_id", () => {
    expect(payload.find((x) => x.variable === "family_id")?.value).toBe(3);
  });
  test("product_id", () => {
    expect(payload.find((x) => x.variable === "product_id")?.value).toBe(4);
  });
  test("hw", () => {
    expect(payload.find((x) => x.variable === "hw")?.value).toBe(1);
  });
  test("fw", () => {
    expect(payload.find((x) => x.variable === "fw")?.value).toBeCloseTo(2.1);
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
describe("Senstick STB10 - network variable-name and encoding compatibility", () => {
  const HEX = "09c40a5a80";
  const PORT = 2;
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
});
