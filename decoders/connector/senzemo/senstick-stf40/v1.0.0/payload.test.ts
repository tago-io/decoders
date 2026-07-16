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