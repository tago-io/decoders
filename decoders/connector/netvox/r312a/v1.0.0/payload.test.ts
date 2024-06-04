import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/netvox/r312a/v1.0.0/payload.ts";

describe("Port 6, 0x00, Startup version report", () => {
  const raw_payload = [
    { variable: "payload", value: "014D00640B2019071800000" },
    { variable: "fPort", value: 6 },
  ];
  const payload = decoderRun(file_path, { payload: raw_payload });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  const software_version = payload.find((item) => item.variable === "software_version");
  const hardware_version = payload.find((item) => item.variable === "hardware_version");
  const datacode = payload.find((item) => item.variable === "datacode");

  test("Check if variable is correct", () => {
    expect(software_version.value).toBe(10); // review
    expect(hardware_version.value).toBe(11);
    expect(datacode.value).toBe(20190718);
  });
});

describe("Port 6, 0x01, Battery report", () => {
  const raw_payload = [
    { variable: "payload", value: "014D011C01000000000000" },
    { variable: "fPort", value: 6 },
  ];
  const payload = decoderRun(file_path, { payload: raw_payload });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  const volt = payload.find((item) => item.variable === "volt");
  const alarm = payload.find((item) => item.variable === "alarm");

  test("Check if variable is correct", () => {
    expect(volt.value).toBe(2.8);
    expect(alarm.value).toBe("alarm");
  });
});

describe("Port 7, 0x81, configure report response", () => {
  const raw_payload = [
    { variable: "payload", value: "814D000000000000000000" },
    { variable: "fPort", value: 7 },
  ];
  const payload = decoderRun(file_path, { payload: raw_payload });

  const cmd = payload.find((item) => item.variable === "cmd");
  const status = payload.find((item) => item.variable === "status");

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("results", () => {
    expect(cmd?.value).toBe("config_report_rsp");
    expect(status?.value).toBe("success");
  });
});

describe("Port 7, 0x82, read current configure report", () => {
  const raw_payload = [
    { variable: "payload", value: "824D038407080100000000" },
    { variable: "fPort", value: 7 },
  ];
  const payload = decoderRun(file_path, { payload: raw_payload });

  const cmd = payload.find((item) => item.variable === "cmd");
  const min_time = payload.find((item) => item.variable === "min_time");
  const max_time = payload.find((item) => item.variable === "max_time");
  const battery_change = payload.find((item) => item.variable === "battery_change");

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("results", () => {
    expect(cmd?.value).toBe("read_config_report_rsp");
    expect(min_time?.value).toBe(900);
    expect(max_time?.value).toBe(1800);
    expect(battery_change?.value).toBe(0.1);
  });
});

describe("Port 13, 0x81, set button press time response", () => {
  const raw_payload = [
    { variable: "payload", value: "814D000000000000000000" },
    { variable: "fPort", value: 13 },
  ];
  const payload = decoderRun(file_path, { payload: raw_payload });

  const cmd = payload.find((item) => item.variable === "cmd");
  const status = payload.find((item) => item.variable === "status");

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("results", () => {
    expect(cmd?.value).toBe("set_button_press_time_rsp");
    expect(status?.value).toBe("success");
  });
});

describe("Port 13, 0x82, get button press time response", () => {
  const raw_payload = [
    { variable: "payload", value: "824D050000000000000000" },
    { variable: "fPort", value: 13 },
  ];
  const payload = decoderRun(file_path, { payload: raw_payload });

  const cmd = payload.find((item) => item.variable === "cmd");
  const press_time = payload.find((item) => item.variable === "press_time");

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("results", () => {
    expect(cmd?.value).toBe("get_button_press_time_rsp");
    expect(press_time?.value).toBe(5);
  });
});
