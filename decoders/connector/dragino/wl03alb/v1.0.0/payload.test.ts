/* eslint-disable unicorn/numeric-separators-style */
import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/dragino/wl03alb/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string, port: number) {
  let payload = [
    { variable: "payload", value: payloadHex },
    { variable: "fport", value: port },
  ];
  payload = decoderRun(file_path, { payload });

  const datalog = payload.find((item) => item.variable === "datalog");
  const tdc = payload.find((item) => item.variable === "tdc");
  const disalarm = payload.find((item) => item.variable === "disalarm");
  const keep_status = payload.find((item) => item.variable === "keep_status");
  const keep_time = payload.find((item) => item.variable === "keep_time");
  const trigger_mode = payload.find((item) => item.variable === "trigger_mode");
  const sensor_model = payload.find((item) => item.variable === "sensor_model");
  const firmware_version = payload.find((item) => item.variable === "firmware_version");
  const frequency_band = payload.find((item) => item.variable === "frequency_band");
  const sub_band = payload.find((item) => item.variable === "sub_band");
  const bat = payload.find((item) => item.variable === "bat");
  const workmod = payload.find((item) => item.variable === "workmod");
  const cmod = payload.find((item) => item.variable === "cmod");
  const alarm = payload.find((item) => item.variable === "alarm");
  const water_leak_status = payload.find((item) => item.variable === "water_leak_status");
  const last_water_leak_duration = payload.find((item) => item.variable === "last_water_leak_duration");
  const water_leak_times = payload.find((item) => item.variable === "water_leak_times");
  const leak_alarm_time = payload.find((item) => item.variable === "leak_alarm_time");
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    // datalog,
    tdc,
    disalarm,
    keep_status,
    keep_time,
    sensor_model,
    firmware_version,
    frequency_band,
    sub_band,
    bat,
    workmod,
    cmod,
    alarm,
    water_leak_status,
    last_water_leak_duration,
    water_leak_times,
    leak_alarm_time,
    parse_error,
  };
}

describe("Port 4 unit tests", () => {
  const payloadHex = "001C2000A901000A";
  const port = 4;
  const result = preparePayload(payloadHex, port);

  test("Port 4 variable values", () => {
    expect(result.disalarm?.value).toBe(0);
    expect(result.keep_status?.value).toBe(1);
    expect(result.keep_time?.value).toBe(256);
    expect(result.leak_alarm_time?.value).toBe(10);
  });
});

describe("Port 5 unit tests", () => {
  const payloadHex = "1D010002010B45";
  const port = 5;
  const result = preparePayload(payloadHex, port);

  test("Port 5 variable values", () => {
    expect(result.sensor_model?.value).toBe("WL03A-LB");
    expect(result.firmware_version?.value).toBe("1.0.0");
    expect(result.frequency_band?.value).toBe("US915");
    expect(result.sub_band?.value).toBe(1);
    expect(result.bat?.value).toBe(2.885);
  });
});

describe("Port x unit tests 2 byte size", () => {
  const payloadHex = "090012340023455F982EC8";
  const port = 2;
  const result = preparePayload(payloadHex, port);

  test("Port x variable values", () => {
    expect(result.cmod?.value).toBe("PART");
    expect(result.tdc?.value).toBe("NO");
    expect(result.alarm?.value).toBe("FALSE");
    expect(result.water_leak_status?.value).toBe("LEAK");
    expect(result.water_leak_times?.value).toBe(4660);
    expect(result.last_water_leak_duration?.value).toBe(9029);
  });
});

describe("Shall not be parsed", () => {
  let payload = [
    { variable: "shallnotpass", value: "04096113950292" },
    { variable: "fport", value: 9 },
  ];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([
      { variable: "shallnotpass", value: "04096113950292" },
      { variable: "fport", value: 9 },
    ]);
  });
});
