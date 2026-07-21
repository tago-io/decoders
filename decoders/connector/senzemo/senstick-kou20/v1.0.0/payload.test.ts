import { describe, expect, test, beforeEach } from "vitest";
import { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/senzemo/senstick-kou20/v1.0.0/payload.ts";

let payload: DataToSend[] = [];

describe("Port 1 - Alarm packet", () => {
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

describe("Port 2 - Data packet (4 bytes, no status)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "09F60E74" },
      { variable: "port", value: "2" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Temperature parsed correctly", () => {
    const temperature = payload.find((x) => x.variable === "temperature");
    expect(temperature?.value).toBe(25.5);
    expect(temperature?.unit).toBe("°C");
  });

  test("Battery parsed correctly", () => {
    const battery = payload.find((x) => x.variable === "battery");
    expect(battery?.value).toBe(3700);
    expect(battery?.unit).toBe("mV");
  });

  test("No status field present", () => {
    const status = payload.find((x) => x.variable === "status");
    expect(status).toBeUndefined();
  });
  test("Negative temperature parsed correctly", () => {
    const payload_negative = decoderRun(file_path, {
      payload: [
        { variable: "payload_raw", value: "FFD80E74" },
        { variable: "port", value: "2" },
      ],
    });
    const temperature = payload_negative.find((x) => x.variable === "temperature");
    expect(temperature?.value).toBe(-0.4);
    expect(temperature?.unit).toBe("°C");
  });
});

describe("Port 2 - Data packet (5 bytes, with status)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "0109C40CE4" },
      { variable: "port", value: "2" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Status parsed correctly", () => {
    const status = payload.find((x) => x.variable === "status");
    expect(status?.value).toBe(1);
    expect(status?.unit).toBe("");
  });

  test("Temperature parsed correctly", () => {
    const temperature = payload.find((x) => x.variable === "temperature");
    expect(temperature?.value).toBe(25.0);
    expect(temperature?.unit).toBe("°C");
  });

  test("Battery parsed correctly", () => {
    const battery = payload.find((x) => x.variable === "battery");
    expect(battery?.value).toBe(3300);
    expect(battery?.unit).toBe("mV");
  });
  test("Negative temperature parsed correctly", () => {
    const payload_negative = decoderRun(file_path, {
      payload: [
        { variable: "payload_raw", value: "01FFD80CE4" },
        { variable: "port", value: "2" },
      ],
    });
    const temperature = payload_negative.find((x) => x.variable === "temperature");
    expect(temperature?.value).toBe(-0.4);
    expect(temperature?.unit).toBe("°C");
  });
});

describe("Port 3 - Config packet", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "020A0501830709140F00" },
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
    expect(send_period?.unit).toBe("min");
  });

  test("MoveThr parsed correctly", () => {
    const move_thr = payload.find((x) => x.variable === "move_thr");
    expect(move_thr?.value).toBe(5);
  });

  test("PacketConfirm parsed correctly", () => {
    const packet_confirm = payload.find((x) => x.variable === "packet_confirm");
    expect(packet_confirm?.value).toBe(1);
  });

  test("DataRate and ADRon parsed correctly from combined byte", () => {
    const data_rate = payload.find((x) => x.variable === "data_rate");
    const adr_on = payload.find((x) => x.variable === "adr_on");
    expect(data_rate?.value).toBe(3);
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

  test("HW version parsed correctly", () => {
    const hw_version = payload.find((x) => x.variable === "hw_version");
    expect(hw_version?.value).toBe(2.0);
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