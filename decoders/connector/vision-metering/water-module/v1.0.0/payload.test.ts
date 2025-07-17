import { describe, test, expect, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

import { DataToSend } from "@tago-io/sdk/lib/types";
import * as ts from "typescript";

const decoderFile = readFileSync(join(__dirname, "./payload.ts"), "utf8");
const transpiled = ts.transpile(decoderFile);

let payload: DataToSend[] = [];

(globalThis as any).payload = payload;

describe("Shall not be parsed", () => {
  beforeEach(() => {
    payload = [{ variable: "shallnotpass", value: "04096113950292"}];
    (globalThis as any).payload = payload;
  });

  test("Output Result", () => {
    eval(transpiled);
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "shallnotpass", value: "04096113950292" }]);
  });
});

describe("Water Meter Payload Parser", () => {
  beforeEach(() => {
    payload = [{ variable: "payload", value: "00f90000000100001010010102" }];
    (globalThis as any).payload = payload;
  });

  describe("Startup Packet", () => {
    test("Should parse all startup packet values correctly", () => {
      eval(transpiled);
      expect(Array.isArray(payload)).toBe(true);
      expect(payload.length).toBeGreaterThan(1);

      // Check packet type
      const packetType = payload.find((x) => x.variable === "packet_type");
      const batteryVoltage = payload.find((x) => x.variable === "battery_voltage");
      const resetReason = payload.find((x) => x.variable === "reset_reason");
      const rebootCounter = payload.find((x) => x.variable === "reboot_counter");
      const firmwareVersion = payload.find((x) => x.variable === "firmware_version");
      
      expect(packetType?.value).toBe("startup");
      expect(batteryVoltage?.value).toBe(3.59);
      expect(batteryVoltage?.unit).toBe("V");
      expect(resetReason?.value).toBe("Reset pin");
      expect(rebootCounter?.value).toBe(4112);
      expect(firmwareVersion?.value).toBe("1.1.2");
    });
  });

  describe("Periodic Packet", () => {
    beforeEach(() => {
      payload = [{ variable: "payload", value: "01f9000002c0001002c0100002c0000002c0000102c0000002c000" }];
      (globalThis as any).payload = payload;
    });

    test("Should parse all periodic packet values correctly", () => {
      eval(transpiled);
      expect(Array.isArray(payload)).toBe(true);

      const packetType = payload.find((x) => x.variable === "packet_type");
      const batteryVoltage = payload.find((x) => x.variable === "battery_voltage");
      const consumptionNow = payload.find((x) => x.variable === "consumption_now");
      const consumption1h = payload.find((x) => x.variable === "consumption_1h_ago");
      const consumption2h = payload.find((x) => x.variable === "consumption_2h_ago");
      const consumption3h = payload.find((x) => x.variable === "consumption_3h_ago");
      const consumption4h = payload.find((x) => x.variable === "consumption_4h_ago");
      const consumption5h = payload.find((x) => x.variable === "consumption_5h_ago");

      expect(packetType?.value).toBe("periodic");
      expect(batteryVoltage?.value).toBe(3.59);
      expect(batteryVoltage?.unit).toBe("V");
      expect(consumptionNow?.value).toBe(704);
      expect(consumptionNow?.unit).toBe("L");
      expect(consumption1h?.value).toBe(1049280);
      expect(consumption2h?.value).toBe(268436160);
      expect(consumption3h?.value).toBe(704);
      expect(consumption4h?.value).toBe(66240);
      expect(consumption5h?.value).toBe(704);

      // Check that all consumption values have time and metadata
      expect(consumptionNow?.time).toBeDefined();
      expect(consumptionNow?.metadata?.hours_ago).toBe(0);
      expect(consumption1h?.metadata?.hours_ago).toBe(1);
      expect(consumption2h?.metadata?.hours_ago).toBe(2);
      expect(consumption3h?.metadata?.hours_ago).toBe(3);
      expect(consumption4h?.metadata?.hours_ago).toBe(4);
      expect(consumption5h?.metadata?.hours_ago).toBe(5);
    });
  });

  describe("Reed Switch Packet", () => {
    beforeEach(() => {
      payload = [{ variable: "payload", value: "02f9001002c0010102003939363130343336313000" }];
      (globalThis as any).payload = payload;
    });

    test("Should parse all reed switch packet values correctly", () => {
      eval(transpiled);
      expect(Array.isArray(payload)).toBe(true);
      expect(payload.length).toBeGreaterThan(1);

      const packetType = payload.find((x) => x.variable === "packet_type");
      const batteryVoltage = payload.find((x) => x.variable === "battery_voltage");
      const consumptionCurrent = payload.find((x) => x.variable === "consumption_current");
      const firmwareVersion = payload.find((x) => x.variable === "firmware_version");

      expect(packetType?.value).toBe("reed_switch");
      expect(batteryVoltage?.value).toBe(3.59);
      expect(batteryVoltage?.unit).toBe("V");
      expect(consumptionCurrent?.value).toBe(1049280);
      expect(consumptionCurrent?.unit).toBe("L");
      expect(firmwareVersion?.value).toBe("1.1.2");

      // Check that all values have time and proper metadata
      expect(batteryVoltage?.time).toBeDefined();
      expect(consumptionCurrent?.time).toBeDefined();
      expect(firmwareVersion?.time).toBeDefined();
      expect(batteryVoltage?.metadata?.packet_type).toBe("reed_switch");
      expect(consumptionCurrent?.metadata?.packet_type).toBe("reed_switch");
      expect(firmwareVersion?.metadata?.packet_type).toBe("reed_switch");
    });
  });
});
