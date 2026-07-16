import { describe, expect, test, beforeEach } from "vitest";
import { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/senzemo/senstick-srm10/v1.0.0/payload.ts";

let payload: DataToSend[] = [];

describe("Senstick SRM10 - Alarm Packet (port 1)", () => {
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
    expect(status?.unit).toBe("");
  });
});

describe("Senstick SRM10 - Data Packet without status (port 2, 8 bytes)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "0A000A0000006480" },
      { variable: "port", value: "2" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Current rain parsed correctly", () => {
    const current_rain = payload.find((x) => x.variable === "current_rain");
    expect(current_rain?.value).toBe(2);
    expect(current_rain?.unit).toBe("mm");
  });

  test("Current rain total parsed correctly", () => {
    const current_rain_total = payload.find((x) => x.variable === "current_rain_total");
    expect(current_rain_total?.value).toBe(2);
    expect(current_rain_total?.unit).toBe("mm");
  });

  test("Total rain parsed correctly", () => {
    const total_rain = payload.find((x) => x.variable === "total_rain");
    expect(total_rain?.value).toBe(20);
    expect(total_rain?.unit).toBe("mm");
  });

  test("Battery level parsed correctly", () => {
    const battery_level = payload.find((x) => x.variable === "battery_level");
    expect(battery_level?.value).toBe(1302);
    expect(battery_level?.unit).toBe("mV");
  });

  test("No status pushed", () => {
    const status = payload.find((x) => x.variable === "status");
    expect(status).toBeUndefined();
  });
});

describe("Senstick SRM10 - Data Packet with status (port 2, 9 bytes)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "0305000500000032FF" },
      { variable: "port", value: "2" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Status parsed correctly", () => {
    const status = payload.find((x) => x.variable === "status");
    expect(status?.value).toBe(3);
    expect(status?.unit).toBe("");
  });

  test("Current rain parsed correctly", () => {
    const current_rain = payload.find((x) => x.variable === "current_rain");
    expect(current_rain?.value).toBe(1);
    expect(current_rain?.unit).toBe("mm");
  });

  test("Current rain total parsed correctly", () => {
    const current_rain_total = payload.find((x) => x.variable === "current_rain_total");
    expect(current_rain_total?.value).toBe(1);
    expect(current_rain_total?.unit).toBe("mm");
  });

  test("Total rain parsed correctly", () => {
    const total_rain = payload.find((x) => x.variable === "total_rain");
    expect(total_rain?.value).toBe(10);
    expect(total_rain?.unit).toBe("mm");
  });

  test("Battery level parsed correctly", () => {
    const battery_level = payload.find((x) => x.variable === "battery_level");
    expect(battery_level?.value).toBe(1800);
    expect(battery_level?.unit).toBe("mV");
  });
});

describe("Senstick SRM10 - Total rain high-bit regression (port 2, 9 bytes)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "000000008000000000" },
      { variable: "port", value: "2" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Total rain stays positive when top byte has bit 7 set", () => {
    const total_rain = payload.find((x) => x.variable === "total_rain");
    expect(total_rain?.value).toBe(429496729.6);
  });
});

describe("Senstick SRM10 - Total rain high-bit regression (port 2, 8 bytes)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "0000008000000000" },
      { variable: "port", value: "2" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Total rain stays positive when top byte has bit 7 set", () => {
    const total_rain = payload.find((x) => x.variable === "total_rain");
    expect(total_rain?.value).toBe(429496729.6);
  });
});


describe("Senstick SRM10 - Config Packet (port 3)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "013C050183020A0A0F" },
      { variable: "port", value: "3" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Status parsed correctly", () => {
    const status = payload.find((x) => x.variable === "status");
    expect(status?.value).toBe(1);
  });

  test("Send period parsed correctly", () => {
    const send_period = payload.find((x) => x.variable === "send_period");
    expect(send_period?.value).toBe(60);
  });

  test("Movement threshold parsed correctly", () => {
    const movement_threshold = payload.find((x) => x.variable === "movement_threshold");
    expect(movement_threshold?.value).toBe(5);
  });

  test("Packet confirm parsed correctly", () => {
    const packet_confirm = payload.find((x) => x.variable === "packet_confirm");
    expect(packet_confirm?.value).toBe(1);
  });

  test("ADR on parsed correctly", () => {
    const adr_on = payload.find((x) => x.variable === "adr_on");
    expect(adr_on?.value).toBe(true);
  });

  test("Data rate parsed correctly", () => {
    const data_rate = payload.find((x) => x.variable === "data_rate");
    expect(data_rate?.value).toBe(3);
  });

  test("Family id parsed correctly", () => {
    const family_id = payload.find((x) => x.variable === "family_id");
    expect(family_id?.value).toBe(2);
  });

  test("Product id parsed correctly", () => {
    const product_id = payload.find((x) => x.variable === "product_id");
    expect(product_id?.value).toBe(10);
  });

  test("HW version parsed correctly", () => {
    const hw_version = payload.find((x) => x.variable === "hw_version");
    expect(hw_version?.value).toBe(1);
  });

  test("FW version parsed correctly", () => {
    const fw_version = payload.find((x) => x.variable === "fw_version");
    expect(fw_version?.value).toBe(1.5);
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