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