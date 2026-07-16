import { describe, expect, test, beforeEach } from "vitest";
import { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/senzemo/senstick-ssm40/v1.0.0/payload.ts";

let payload: DataToSend[] = [];

describe("Senzemo Senstick SSM40 decoder", () => {
  describe("Alarm packet (port 1)", () => {
    beforeEach(() => {
      payload = [
        { variable: "payload_raw", value: "02" },
        { variable: "port", value: "1" },
      ];
      payload = decoderRun(file_path, { payload });
    });

    test("status is parsed", () => {
      const status = payload.find((x) => x.variable === "status");
      expect(status?.value).toBe(2);
      expect(status?.unit).toBe("");
    });
  });

  describe("Data packet with status (port 2, 5 bytes)", () => {
    beforeEach(() => {
      payload = [
        { variable: "payload_raw", value: "010cec0258" },
        { variable: "port", value: "2" },
      ];
      payload = decoderRun(file_path, { payload });
    });

    test("status is parsed", () => {
      expect(payload.find((x) => x.variable === "status")?.value).toBe(1);
    });

    test("battery_voltage is parsed", () => {
      const battery_voltage = payload.find((x) => x.variable === "battery_voltage");
      expect(battery_voltage?.value).toBe(3308);
      expect(battery_voltage?.unit).toBe("mV");
    });

    test("sensor_voltage is parsed", () => {
      const sensor_voltage = payload.find((x) => x.variable === "sensor_voltage");
      expect(sensor_voltage?.value).toBe(600);
      expect(sensor_voltage?.unit).toBe("mV");
    });

    test("soil_moisture is parsed", () => {
      const soil_moisture = payload.find((x) => x.variable === "soil_moisture");
      expect(soil_moisture?.value).toBe(20);
      expect(soil_moisture?.unit).toBe("%");
    });

    test("vwc is parsed", () => {
      const vwc = payload.find((x) => x.variable === "vwc");
      expect(vwc?.value).toBe(5);
      expect(vwc?.unit).toBe("%");
    });
  });

  describe("Config packet (port 3)", () => {
    beforeEach(() => {
      payload = [
        { variable: "payload_raw", value: "010a0501830207280a" },
        { variable: "port", value: "3" },
      ];
      payload = decoderRun(file_path, { payload });
    });

    test("status is parsed", () => {
      expect(payload.find((x) => x.variable === "status")?.value).toBe(1);
    });

    test("send_period is parsed", () => {
      expect(payload.find((x) => x.variable === "send_period")?.value).toBe(10);
    });

    test("move_thr is parsed", () => {
      expect(payload.find((x) => x.variable === "move_thr")?.value).toBe(5);
    });

    test("packet_confirm is parsed", () => {
      expect(payload.find((x) => x.variable === "packet_confirm")?.value).toBe(1);
    });

    test("data_rate is parsed", () => {
      expect(payload.find((x) => x.variable === "data_rate")?.value).toBe(3);
    });

    test("adr_on is parsed", () => {
      expect(payload.find((x) => x.variable === "adr_on")?.value).toBe(true);
    });

    test("family_id is parsed", () => {
      expect(payload.find((x) => x.variable === "family_id")?.value).toBe(2);
    });

    test("product_id is parsed", () => {
      expect(payload.find((x) => x.variable === "product_id")?.value).toBe(7);
    });

    test("hw is parsed", () => {
      expect(payload.find((x) => x.variable === "hw")?.value).toBe(4);
    });

    test("fw is parsed", () => {
      expect(payload.find((x) => x.variable === "fw")?.value).toBe(1);
    });
  });

  describe("RTT firmware warning (port 4)", () => {
    beforeEach(() => {
      payload = [
        { variable: "payload_raw", value: "00" },
        { variable: "port", value: "4" },
      ];
      payload = decoderRun(file_path, { payload });
    });

    test("warning is parsed", () => {
      expect(payload.find((x) => x.variable === "warning")?.value).toBe("RTT FIRMWARE");
    });
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