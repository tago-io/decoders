import { describe, expect, test, beforeEach } from "vitest";
import { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/senzemo/senstick-spu30/v1.0.0/payload.ts";

let payload: DataToSend[] = [];

describe("Data packet - status byte and VOC index present (13 bytes)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "05092e11d72794032000780e74" },
      { variable: "port", value: "2" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("status", () => {
    expect(payload.find((x) => x.variable === "status")?.value).toEqual(5);
  });
  test("temperature", () => {
    expect(payload.find((x) => x.variable === "temperature")?.value).toEqual(23.5);
  });
  test("humidity", () => {
    expect(payload.find((x) => x.variable === "humidity")?.value).toEqual(45.67);
  });
  test("air_pressure", () => {
    expect(payload.find((x) => x.variable === "air_pressure")?.value).toEqual(1013.2);
  });
  test("co2", () => {
    expect(payload.find((x) => x.variable === "co2")?.value).toEqual(800);
  });
  test("voc_index", () => {
    expect(payload.find((x) => x.variable === "voc_index")?.value).toEqual(120);
  });
  test("battery_level", () => {
    expect(payload.find((x) => x.variable === "battery_level")?.value).toEqual(3700);
  });
});

describe("Data packet - no status, no VOC, negative temperature (10 bytes)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "fdf30c8a2694019f1004" },
      { variable: "port", value: "2" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("status defaults to 0", () => {
    expect(payload.find((x) => x.variable === "status")?.value).toEqual(0);
  });
  test("negative temperature", () => {
    expect(payload.find((x) => x.variable === "temperature")?.value).toEqual(-5.25);
  });
  test("humidity", () => {
    expect(payload.find((x) => x.variable === "humidity")?.value).toEqual(32.1);
  });
  test("air_pressure", () => {
    expect(payload.find((x) => x.variable === "air_pressure")?.value).toEqual(987.6);
  });
  test("co2", () => {
    expect(payload.find((x) => x.variable === "co2")?.value).toEqual(415);
  });
  test("no voc_index field", () => {
    expect(payload.find((x) => x.variable === "voc_index")).toBeUndefined();
  });
  test("battery_level", () => {
    expect(payload.find((x) => x.variable === "battery_level")?.value).toEqual(4100);
  });
});

describe("Config packet (port 3, 11 bytes)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "023c0185325007030c0a15" },
      { variable: "port", value: "3" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("status", () => {
    expect(payload.find((x) => x.variable === "status")?.value).toEqual(2);
  });
  test("send_period", () => {
    expect(payload.find((x) => x.variable === "send_period")?.value).toEqual(60);
  });
  test("packet_confirm", () => {
    expect(payload.find((x) => x.variable === "packet_confirm")?.value).toEqual(1);
  });
  test("data_rate (low 7 bits)", () => {
    expect(payload.find((x) => x.variable === "data_rate")?.value).toEqual(5);
  });
  test("adr_on (bit 7 set)", () => {
    expect(payload.find((x) => x.variable === "adr_on")?.value).toEqual(true);
  });
  test("co2_mid_threshold", () => {
    expect(payload.find((x) => x.variable === "co2_mid_threshold")?.value).toEqual(500);
  });
  test("co2_high_threshold", () => {
    expect(payload.find((x) => x.variable === "co2_high_threshold")?.value).toEqual(800);
  });
  test("led_intensity", () => {
    expect(payload.find((x) => x.variable === "led_intensity")?.value).toEqual(7);
  });
  test("family_id", () => {
    expect(payload.find((x) => x.variable === "family_id")?.value).toEqual(3);
  });
  test("product_id", () => {
    expect(payload.find((x) => x.variable === "product_id")?.value).toEqual(12);
  });
  test("hw_version", () => {
    expect(payload.find((x) => x.variable === "hw_version")?.value).toEqual(1);
  });
  test("fw_version", () => {
    expect(payload.find((x) => x.variable === "fw_version")?.value).toEqual(2.1);
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
describe("Senstick SPU30 - network variable-name and encoding compatibility", () => {
  const HEX = "05092e11d72794032000780e74";
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
