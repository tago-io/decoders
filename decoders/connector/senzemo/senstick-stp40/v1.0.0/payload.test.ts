import { describe, expect, test, beforeEach } from "vitest";
import { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/senzemo/senstick-stp40/v1.0.0/payload.ts";

let payload: DataToSend[] = [];

describe("Senzemo Senstick STP40 decoder", () => {
  describe("Alarm Packet - port 1", () => {
    beforeEach(() => {
      payload = [
        { variable: "payload_raw", value: "05" },
        { variable: "port", value: "1" },
      ];
      payload = decoderRun(file_path, { payload });
    });

    test("Status parsed correctly", () => {
      const status = payload.find((x) => x.variable === "status");
      expect(status?.value).toBe(5);
    });
  });

  describe("Data Packet (4 bytes) - port 2", () => {
    beforeEach(() => {
      payload = [
        { variable: "payload_raw", value: "0AF50C80" },
        { variable: "port", value: "2" },
      ];
      payload = decoderRun(file_path, { payload });
    });

    test("Temperature parsed correctly", () => {
      const temperature = payload.find((x) => x.variable === "temperature");
      expect(temperature?.value).toBe(28.05);
    });

    test("Battery parsed correctly", () => {
      const battery = payload.find((x) => x.variable === "battery");
      expect(battery?.value).toBe(3200);
    });
  });

  describe("Data Packet (5 bytes) - port 4", () => {
    beforeEach(() => {
      payload = [
        { variable: "payload_raw", value: "010AF50C80" },
        { variable: "port", value: "4" },
      ];
      payload = decoderRun(file_path, { payload });
    });

    test("Status parsed correctly", () => {
      const status = payload.find((x) => x.variable === "status");
      expect(status?.value).toBe(1);
    });

    test("Temperature parsed correctly", () => {
      const temperature = payload.find((x) => x.variable === "temperature");
      expect(temperature?.value).toBe(28.05);
    });

    test("Battery parsed correctly", () => {
      const battery = payload.find((x) => x.variable === "battery");
      expect(battery?.value).toBe(3200);
    });
  });

  describe("Data Packet (4 bytes) - negative temperature - port 2", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "FFD80C80" },
      { variable: "port", value: "2" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Temperature parsed as negative", () => {
    const temperature = payload.find((x) => x.variable === "temperature");
    expect(temperature?.value).toBe(-0.4);
  });

  test("Battery parsed correctly", () => {
    const battery = payload.find((x) => x.variable === "battery");
    expect(battery?.value).toBe(3200);
  });
});

  describe("Config Packet - port 3", () => {
    beforeEach(() => {
      payload = [
        { variable: "payload_raw", value: "020A0501830709280C" },
        { variable: "port", value: "3" },
      ];
      payload = decoderRun(file_path, { payload });
    });

    test("Status parsed correctly", () => {
      const status = payload.find((x) => x.variable === "status");
      expect(status?.value).toBe(2);
    });

    test("SendPeriod parsed correctly", () => {
      const send_period = payload.find((x) => x.variable === "send_period");
      expect(send_period?.value).toBe(10);
    });

    test("MoveThr parsed correctly", () => {
      const move_thr = payload.find((x) => x.variable === "move_thr");
      expect(move_thr?.value).toBe(5);
    });

    test("PacketConfirm parsed correctly", () => {
      const packet_confirm = payload.find((x) => x.variable === "packet_confirm");
      expect(packet_confirm?.value).toBe(1);
    });

    test("DataRate parsed correctly", () => {
      const data_rate = payload.find((x) => x.variable === "data_rate");
      expect(data_rate?.value).toBe(3);
    });

    test("ADRon parsed correctly", () => {
      const adr_on = payload.find((x) => x.variable === "adr_on");
      expect(adr_on?.value).toBe(true);
    });

    test("FamilyId parsed correctly", () => {
      const family_id = payload.find((x) => x.variable === "family_id");
      expect(family_id?.value).toBe(7);
    });

    test("ProductId parsed correctly", () => {
      const product_id = payload.find((x) => x.variable === "product_id");
      expect(product_id?.value).toBe(9);
    });

    test("HW parsed correctly", () => {
      const hw = payload.find((x) => x.variable === "hw");
      expect(hw?.value).toBe(4);
    });

    test("FW parsed correctly", () => {
      const fw = payload.find((x) => x.variable === "fw");
      expect(fw?.value).toBe(1.2);
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
});

// Networks hand the raw frame over under different variable names, encodings and port
// spellings. Whichever one is used, the decoded output must be identical.
describe("Senstick STP40 - network variable-name and encoding compatibility", () => {
  const HEX = "0AF50C80";
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
