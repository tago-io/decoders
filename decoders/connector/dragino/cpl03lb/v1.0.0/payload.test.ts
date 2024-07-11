/* eslint-disable unicorn/numeric-separators-style */
import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/dragino/cpl03lb/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex, port) {
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
  const ttrig_mod1 = payload.find((item) => item.variable === "ttrig_mod1");
  const ttrig_mod2 = payload.find((item) => item.variable === "ttrig_mod2");
  const ttrig_mod3 = payload.find((item) => item.variable === "ttrig_mod3");
  const alarm_tdc = payload.find((item) => item.variable === "alarm_tdc");
  const sensor_model = payload.find((item) => item.variable === "sensor_model");
  const firmware_version = payload.find(
    (item) => item.variable === "firmware_version"
  );
  const frequency_band = payload.find(
    (item) => item.variable === "frequency_band"
  );
  const sub_band = payload.find((item) => item.variable === "sub_band");
  const bat = payload.find((item) => item.variable === "bat");
  const workmod = payload.find((item) => item.variable === "workmod");
  const cmod = payload.find((item) => item.variable === "cmod");
  const alarm = payload.find((item) => item.variable === "alarm");
  const pin_status = payload.find((item) => item.variable === "pin_status");
  const ttrig_mod = payload.find((item) => item.variable === "ttrig_mod");
  const total_pulse = payload.find((item) => item.variable === "total_pulse");
  const last_duration = payload.find(
    (item) => item.variable === "last_duration"
  );
  const time = payload.find((item) => item.variable === "time");
  const calculate_flag = payload.find(
    (item) => item.variable === "calculate_flag"
  );
  const pa8_total_pulse = payload.find(
    (item) => item.variable === "pa8_total_pulse"
  );
  const pa4_total_pulse = payload.find(
    (item) => item.variable === "pa4_total_pulse"
  );
  const pb15_total_pulse = payload.find(
    (item) => item.variable === "pb15_total_pulse"
  );

  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    datalog,
    tdc,
    disalarm,
    keep_status,
    keep_time,
    trigger_mode,
    ttrig_mod1,
    ttrig_mod2,
    ttrig_mod3,
    alarm_tdc,
    sensor_model,
    firmware_version,
    frequency_band,
    sub_band,
    bat,
    workmod,
    cmod,
    alarm,
    pin_status,
    ttrig_mod,
    total_pulse,
    last_duration,
    time,
    calculate_flag,
    pa8_total_pulse,
    pa4_total_pulse,
    pb15_total_pulse,
    // parse error
    parse_error,
  };
}

describe("Port 3 unit tests", () => {
  const payloadHex = "030101000000000064AE544B";
  const port = 3;
  const result = preparePayload(payloadHex, port);

  test("Port 3 variable values", () => {
    expect(result.datalog?.value).toContain(
      "[CPL01,SUM,NO,TRUE,OPEN,1,3,65792,0,1970-03-18 05:50:28],[CPL03,SUM,NO,3,0,0,1969-12-31 21:00:00],"
    );
  });
});

describe("Port 4 unit tests", () => {
  const payloadHex = "001C200000000001000001";
  const port = 4;
  const result = preparePayload(payloadHex, port);

  test("Port 4 variable values", () => {
    expect(result.disalarm?.value).toBe(0);
    expect(result.keep_status?.value).toBe(0);
    expect(result.keep_time?.value).toBe(0);
    expect(result.ttrig_mod1?.value).toBe(1);
    expect(result.ttrig_mod2?.value).toBe(0);
    expect(result.ttrig_mod3?.value).toBe(0);
    expect(result.alarm_tdc?.value).toBe(1);
  });
});

describe("Port 5 unit tests", () => {
  const payloadHex = "20010002010B45";
  const port = 5;
  const result = preparePayload(payloadHex, port);

  test("Port 5 variable values", () => {
    expect(result.sensor_model?.value).toBe("CPL03-LB");
    expect(result.firmware_version?.value).toBe("1.0.0");
    expect(result.frequency_band?.value).toBe("US915");
    expect(result.sub_band?.value).toBe(1);
    expect(result.bat?.value).toBe(2.885);
  });
});

describe("Port x unit tests 11 byte size", () => {
  const payloadHex = "190012340023455F982EC8";
  const port = 2;
  const result = preparePayload(payloadHex, port);

  test("Port x variable values", () => {
    expect(result.workmod?.value).toBe("CPL03");
    expect(result.cmod?.value).toBe("SUM");
    expect(result.tdc?.value).toBe("YES");
    expect(result.alarm?.value).toBe("FALSE");
    expect(result.pin_status?.value).toBe("OPEN");
    expect(result.ttrig_mod?.value).toBe(0);
    expect(result.total_pulse?.value).toBe(4660);
    expect(result.last_duration?.value).toBe(9029);
    expect(result.time?.value).toBe("2020-10-27 11:29:28");
  });
});

describe("Port x unit tests 10 byte size", () => {
  const payloadHex = "00010102000123000456";
  const port = 6;
  const result = preparePayload(payloadHex, port);

  test("Port x variable values", () => {
    expect(result.workmod?.value).toBe("CPL01");
    expect(result.cmod?.value).toBe("SUM");
    expect(result.tdc?.value).toBe("NO");
    expect(result.calculate_flag?.value).toBe(0);
    expect(result.pa8_total_pulse?.value).toBe(65794);
    expect(result.pa4_total_pulse?.value).toBe(291);
    expect(result.pb15_total_pulse?.value).toBe(1110);
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
