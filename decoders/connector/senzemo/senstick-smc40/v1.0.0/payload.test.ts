import { describe, expect, test, beforeEach } from "vitest";
import { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/senzemo/senstick-smc40/v1.0.0/payload.ts";

let payload: DataToSend[] = [];

describe("Alarm packet (port 1)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "05" },
      { variable: "port", value: "1" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Status", () => {
    const status = payload.find((x) => x.variable === "status");
    expect(status?.value).toBe(5);
  });
});

describe("Data packet, 7 bytes, positive temperature (port 2)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "092E11D7279480" },
      { variable: "port", value: "2" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Status", () => {
    expect(payload.find((x) => x.variable === "status")?.value).toBe(0);
  });
  test("Temperature", () => {
    expect(payload.find((x) => x.variable === "temperature")?.value).toBe(23.5);
  });
  test("Humidity", () => {
    expect(payload.find((x) => x.variable === "humidity")?.value).toBe(45.67);
  });
  test("Air pressure", () => {
    expect(payload.find((x) => x.variable === "air_pressure")?.value).toBe(1013.2);
  });
  test("Battery level", () => {
    expect(payload.find((x) => x.variable === "battery_level")?.value).toBe(1302);
  });
});

describe("Data packet, 8 bytes, negative temperature (port 2)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "03FDC90C8A2694C8" },
      { variable: "port", value: "2" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Status", () => {
    expect(payload.find((x) => x.variable === "status")?.value).toBe(3);
  });
  test("Temperature", () => {
    expect(payload.find((x) => x.variable === "temperature")?.value).toBe(-5.67);
  });
  test("Humidity", () => {
    expect(payload.find((x) => x.variable === "humidity")?.value).toBe(32.1);
  });
  test("Air pressure", () => {
    expect(payload.find((x) => x.variable === "air_pressure")?.value).toBe(987.6);
  });
  test("Battery level", () => {
    expect(payload.find((x) => x.variable === "battery_level")?.value).toBe(1584);
  });
});

describe("Config packet (port 3)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "010A0501850228280A" },
      { variable: "port", value: "3" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Status", () => {
    expect(payload.find((x) => x.variable === "status")?.value).toBe(1);
  });
  test("Send period", () => {
    expect(payload.find((x) => x.variable === "send_period")?.value).toBe(10);
  });
  test("Move threshold", () => {
    expect(payload.find((x) => x.variable === "move_thr")?.value).toBe(5);
  });
  test("Packet confirm", () => {
    expect(payload.find((x) => x.variable === "packet_confirm")?.value).toBe(1);
  });
  test("Data rate", () => {
    expect(payload.find((x) => x.variable === "data_rate")?.value).toBe(5);
  });
  test("ADR on", () => {
    expect(payload.find((x) => x.variable === "adr_on")?.value).toBe(true);
  });
  test("Family ID", () => {
    expect(payload.find((x) => x.variable === "family_id")?.value).toBe(2);
  });
  test("Product ID", () => {
    expect(payload.find((x) => x.variable === "product_id")?.value).toBe(40);
  });
  test("HW", () => {
    expect(payload.find((x) => x.variable === "hw")?.value).toBe(4);
  });
  test("FW", () => {
    expect(payload.find((x) => x.variable === "fw")?.value).toBe(1);
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
describe("Senstick SMC40 - network variable-name and encoding compatibility", () => {
  const HEX = "092E11D7279480";
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
