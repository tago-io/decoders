import { describe, expect, test, beforeEach } from "vitest";
import { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/senzemo/senstick-stf40/v1.0.0/payload.ts";

let payload: DataToSend[] = [];

describe("Port 2 - Data packet (4 bytes, negative temperature)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "0c1cffd8" },
      { variable: "port", value: "2" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Battery voltage parsed correctly", () => {
    const battery_voltage = payload.find((x) => x.variable === "battery_voltage");
    expect(battery_voltage?.value).toBe(3100);
    expect(battery_voltage?.unit).toBe("mV");
  });

 test("Probe temperature parsed as negative", () => {
    const probe_temperature = payload.find((x) => x.variable === "probe_temperature");
    expect(probe_temperature?.value).toBe(-0.4);
    expect(probe_temperature?.unit).toBe("°C");
  });
});

describe("Port 1 - Alarm packet", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "05" },
      { variable: "port", value: "1" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Status parsed correctly", () => {
    const status = payload.find((x) => x.variable === "status");
    expect(status?.value).toBe(5);
    expect(status?.unit).toBe("");
  });
});

describe("Port 2 - Data packet (12 bytes, full report)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "0c1c091e0834000186a00ce4" },
      { variable: "port", value: "2" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Battery voltage parsed correctly", () => {
    const battery_voltage = payload.find((x) => x.variable === "battery_voltage");
    expect(battery_voltage?.value).toBe(3100);
    expect(battery_voltage?.unit).toBe("mV");
  });

  test("Probe temperature parsed correctly", () => {
    const probe_temperature = payload.find((x) => x.variable === "probe_temperature");
    expect(probe_temperature?.value).toBe(23.34);
    expect(probe_temperature?.unit).toBe("°C");
  });

  test("Sensor voltage parsed correctly", () => {
    const sensor_voltage = payload.find((x) => x.variable === "sensor_voltage");
    expect(sensor_voltage?.value).toBe(2100);
    expect(sensor_voltage?.unit).toBe("mV");
  });

  test("NTC resistance parsed correctly", () => {
    const ntc_resistance = payload.find((x) => x.variable === "ntc_resistance");
    expect(ntc_resistance?.value).toBe(100000);
    expect(ntc_resistance?.unit).toBe("ohm");
  });

  test("vdda parsed correctly", () => {
    const vdda = payload.find((x) => x.variable === "vdda");
    expect(vdda?.value).toBe(3300);
    expect(vdda?.unit).toBe("mV");
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
describe("Senstick STF40 - network variable-name and encoding compatibility", () => {
  const HEX = "0c1c091e0834000186a00ce4";
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
