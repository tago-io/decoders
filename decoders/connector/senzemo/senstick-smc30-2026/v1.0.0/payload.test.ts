import { describe, expect, test, beforeEach } from "vitest";
import { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/senzemo/senstick-smc30-2026/v1.0.0/payload.ts";
let payload: DataToSend[] = [];
describe("Port 1 - Alarm packet", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "07" },
      { variable: "port", value: "1" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Status decoded correctly", () => {
    const status = payload.find((x) => x.variable === "status");
    expect(status?.value).toBe(7);
    expect(status?.unit).toBe("");
  });
});

describe("Port 2 - Data packet (8 bytes, no status/time)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "0929158827940e42" },
      { variable: "port", value: "2" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Temperature decoded correctly", () => {
    const temperature = payload.find((x) => x.variable === "temperature");
    expect(temperature?.value).toBe(23.45);
    expect(temperature?.unit).toBe("°C");
  });

  test("Humidity decoded correctly", () => {
    const humidity = payload.find((x) => x.variable === "humidity");
    expect(humidity?.value).toBe(55.12);
    expect(humidity?.unit).toBe("%");
  });

  test("Air pressure decoded correctly", () => {
    const air_pressure = payload.find((x) => x.variable === "air_pressure");
    expect(air_pressure?.value).toBe(1013.2);
    expect(air_pressure?.unit).toBe("hPa");
  });

  test("Vbat decoded correctly", () => {
    const vbat = payload.find((x) => x.variable === "vbat");
    expect(vbat?.value).toBe(3650);
    expect(vbat?.unit).toBe("mV");
  });

  test("Status not present in 8-byte variant", () => {
    const status = payload.find((x) => x.variable === "status");
    expect(status).toBeUndefined();
  });
});

describe("Port 2 - Data packet (13 bytes, with status and unixtime)", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "02fe0c12c0270310046553f100" },
      { variable: "port", value: "2" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Status decoded correctly", () => {
    const status = payload.find((x) => x.variable === "status");
    expect(status?.value).toBe(2);
  });

  test("Temperature decoded correctly (negative value)", () => {
    const temperature = payload.find((x) => x.variable === "temperature");
    expect(temperature?.value).toBe(-5);
  });

  test("Humidity decoded correctly", () => {
    const humidity = payload.find((x) => x.variable === "humidity");
    expect(humidity?.value).toBe(48);
  });

  test("Air pressure decoded correctly", () => {
    const air_pressure = payload.find((x) => x.variable === "air_pressure");
    expect(air_pressure?.value).toBe(998.7);
  });

  test("Vbat decoded correctly", () => {
    const vbat = payload.find((x) => x.variable === "vbat");
    expect(vbat?.value).toBe(4100);
  });

  test("Unixtime decoded correctly", () => {
    const unixtime = payload.find((x) => x.variable === "unixtime");
    expect(unixtime?.value).toBe(1700000000);
    expect(unixtime?.unit).toBe("s");
  });
});

describe("Port 3 - Config packet", () => {
  beforeEach(() => {
    payload = [
      { variable: "payload_raw", value: "01030a018502072115" },
      { variable: "port", value: "3" },
    ];
    payload = decoderRun(file_path, { payload });
  });

  test("Status decoded correctly", () => {
    const status = payload.find((x) => x.variable === "status");
    expect(status?.value).toBe(1);
  });

  test("Send period decoded correctly", () => {
    const send_period = payload.find((x) => x.variable === "send_period");
    expect(send_period?.value).toBe("5 MIN");
  });

  test("Move threshold decoded correctly", () => {
    const move_thr = payload.find((x) => x.variable === "move_thr");
    expect(move_thr?.value).toBe(10);
  });

  test("Packet confirm decoded correctly", () => {
    const packet_confirm = payload.find((x) => x.variable === "packet_confirm");
    expect(packet_confirm?.value).toBe(1);
  });

  test("Data rate decoded correctly", () => {
    const data_rate = payload.find((x) => x.variable === "data_rate");
    expect(data_rate?.value).toBe(5);
  });

  test("ADR on decoded correctly", () => {
    const adr_on = payload.find((x) => x.variable === "adr_on");
    expect(adr_on?.value).toBe(true);
  });

  test("Family ID decoded correctly", () => {
    const family_id = payload.find((x) => x.variable === "family_id");
    expect(family_id?.value).toBe(2);
  });

  test("Product ID decoded correctly", () => {
    const product_id = payload.find((x) => x.variable === "product_id");
    expect(product_id?.value).toBe(7);
  });

  test("HW version decoded correctly", () => {
    const hw = payload.find((x) => x.variable === "hw");
    expect(hw?.value).toBe(3.3);
  });

  test("FW version decoded correctly", () => {
    const fw = payload.find((x) => x.variable === "fw");
    expect(fw?.value).toBe(2.1);
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