import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/dragino/mds120-lb-ls/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string, port: number) {
  let payload = [
    { variable: "payload", value: payloadHex },
    { variable: "FPort", value: port },
  ];
  payload = decoderRun(file_path, { payload });

  const bat_v = payload.find((item) => item.variable === "bat_v");
  const distance = payload.find((item) => item.variable === "distance");
  const temp_ds18b20 = payload.find((item) => item.variable === "temp_ds18b20");
  const interrupt_flag = payload.find((item) => item.variable === "interrupt_flag");
  const sensor_flag = payload.find((item) => item.variable === "sensor_flag");
  const sensor_model = payload.find((item) => item.variable === "sensor_model");
  const firmware_version = payload.find((item) => item.variable === "firmware_version");
  const frequency_band = payload.find((item) => item.variable === "frequency_band");
  const sub_band = payload.find((item) => item.variable === "sub_band");
  const tdc = payload.find((item) => item.variable === "tdc");
  const stop_timer = payload.find((item) => item.variable === "stop_timer");
  const alarm_timer = payload.find((item) => item.variable === "alarm_timer");
  const pnackmd = payload.find((item) => item.variable === "pnackmd");
  const datalog = payload.find((item) => item.variable === "datalog");

  return {
    payload,
    bat_v,
    distance,
    temp_ds18b20,
    interrupt_flag,
    sensor_flag,
    sensor_model,
    firmware_version,
    frequency_band,
    sub_band,
    tdc,
    stop_timer,
    alarm_timer,
    pnackmd,
    datalog,
  };
}

describe("MDS120-LB/LS Port 2 - Invalid Reading", () => {
  const payloadHex = "0D123FFF000CCC00";
  const port = 2;
  const result = preparePayload(payloadHex, port);

  test("Battery voltage", () => {
    expect(result.bat_v?.value).toBe(3.346);
  });

  test("Distance is Invalid Reading", () => {
    expect(result.distance?.value).toBe("Invalid Reading");
  });

  test("Interrupt flag", () => {
    expect(result.interrupt_flag?.value).toBe(0);
  });

  test("Sensor flag", () => {
    expect(result.sensor_flag?.value).toBe(0);
  });

  test("Temperature DS18B20", () => {
    expect(result.temp_ds18b20?.value).toBe(327.6);
  });
});

describe("MDS120-LB/LS Port 3 - Datalog", () => {
  // Simulated 11-byte datalog entry
  const payloadHex = "0D1203E8000CCC67890ABC";
  const port = 3;
  const result = preparePayload(payloadHex, port);

  test("Pnackmd flag", () => {
    expect(result.pnackmd?.value).toBe("False");
  });

  test("Datalog contains data", () => {
    expect(result.datalog?.value).toContain("[");
    expect(result.datalog?.value).toContain(",");
    expect(result.datalog?.value).toContain("]");
  });
});

describe("MDS120-LB/LS Port 5 - Device Info", () => {
  const payloadHex = "2A011001000D12";
  const port = 5;
  const result = preparePayload(payloadHex, port);

  test("Sensor model", () => {
    expect(result.sensor_model?.value).toBe("MDS120-LB");
  });

  test("Firmware version", () => {
    expect(result.firmware_version?.value).toBe("1.1.0");
  });

  test("Frequency band", () => {
    expect(result.frequency_band?.value).toBe("EU868");
  });

  test("Sub band", () => {
    expect(result.sub_band?.value).toBe(0);
  });

  test("Battery voltage", () => {
    expect(result.bat_v?.value).toBe(3.346);
  });
});

describe("MDS120-LB/LS - Shall not be parsed", () => {
  let payload = [
    { variable: "shallnotpass", value: "04096113950292" },
    { variable: "FPort", value: 9 },
  ];
  payload = decoderRun(file_path, { payload });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([
      { variable: "shallnotpass", value: "04096113950292" },
      { variable: "FPort", value: 9 },
    ]);
  });
});
