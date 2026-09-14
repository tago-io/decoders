import { describe, expect, test, beforeEach } from "vitest";
import { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/senzemo/senstick-sto10/v1.0.0/payload.ts";

let payload: DataToSend[] = [];

describe("Senstick STO10 - Data Packet (4 bytes, with status)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "0009f680" },
      { variable: "port", value: 2 },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Status", () => {
    const status = payload.find((x) => x.variable === "status");
    expect(status?.value).toBe("OK");
  });

  test("Temperature", () => {
    const temperature = payload.find((x) => x.variable === "temperature");
    expect(temperature?.value).toBe(25.5);
    expect(temperature?.unit).toBe("°C");
  });

  test("Battery Level", () => {
    const battery_level = payload.find((x) => x.variable === "battery_level");
    expect(battery_level?.value).toBe(1302);
    expect(battery_level?.unit).toBe("mV");
  });
});

describe("Senstick STO10 - Config Packet (9 bytes)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "000a05018302070a0f" },
      { variable: "port", value: 3 },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Status", () => {
    const status = payload.find((x) => x.variable === "status");
    expect(status?.value).toBe("OK");
  });

  test("Send Period", () => {
    const send_period = payload.find((x) => x.variable === "send_period");
    expect(send_period?.value).toBe(10);
  });

  test("Move Threshold", () => {
    const move_thr = payload.find((x) => x.variable === "move_thr");
    expect(move_thr?.value).toBe(5);
  });

  test("Packet Confirm", () => {
    const packet_confirm = payload.find((x) => x.variable === "packet_confirm");
    expect(packet_confirm?.value).toBe(1);
  });

  test("Data Rate", () => {
    const data_rate = payload.find((x) => x.variable === "data_rate");
    expect(data_rate?.value).toBe(3);
  });

  test("ADR On", () => {
    const adr_on = payload.find((x) => x.variable === "adr_on");
    expect(adr_on?.value).toBe(true);
  });

  test("Family ID", () => {
    const family_id = payload.find((x) => x.variable === "family_id");
    expect(family_id?.value).toBe(2);
  });

  test("Product ID", () => {
    const product_id = payload.find((x) => x.variable === "product_id");
    expect(product_id?.value).toBe(7);
  });

  test("HW Version", () => {
    const hw = payload.find((x) => x.variable === "hw");
    expect(hw?.value).toBe(1);
  });

  test("FW Version", () => {
    const fw = payload.find((x) => x.variable === "fw");
    expect(fw?.value).toBe(1.5);
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
describe("Senstick STO10 - network variable-name and encoding compatibility", () => {
  const HEX = "0009f680";
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
