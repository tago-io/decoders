import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/netvox/r718ka/v1.0.0/payload.ts";

function preparePayload(payloadHex, port) {
  let payload = [
    { variable: "payload", value: payloadHex, unit: "" },
    { variable: "fPort", value: port, unit: "" },
  ];
  payload = decoderRun(file_path, { payload });
  const parse_error = payload.find((item) => item.variable === "parse_error");
  const software_version = payload.find((item) => item.variable === "software_version");
  const hardware_version = payload.find((item) => item.variable === "hardware_version");
  const datacode = payload.find((item) => item.variable === "datacode");
  const battery = payload.find((item) => item.variable === "battery");
  const current = payload.find((item) => item.variable === "current");
  const fine_current = payload.find((item) => item.variable === "fine_current");
  const cmd = payload.find((item) => item.variable === "cmd");
  const status = payload.find((item) => item.variable === "status");
  const min_time = payload.find((item) => item.variable === "min_time");
  const max_time = payload.find((item) => item.variable === "max_time");
  const battery_change = payload.find((item) => item.variable === "battery_change");
  const press_time = payload.find((item) => item.variable === "press_time");
  const current_change = payload.find((item) => item.variable === "current_change");
  return {
    payload,
    software_version,
    hardware_version,
    datacode,
    battery,
    current,
    fine_current,
    cmd,
    status,
    min_time,
    max_time,
    battery_change,
    press_time,
    current_change,
    parse_error,
  };
}

//good
describe("Port 6, 0x00, Startup version report", () => {
  // good
  const payloadHex = "012200640B201911120000";
  const port = 6;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check if variable is correct", () => {
    expect(result.software_version?.value).toBe(10); // review
    expect(result.hardware_version?.value).toBe(11);
    expect(result.datacode?.value).toBe(20191112);
  });
});
//good
describe("Port 6, 0x01, Battery/current report", () => {
  const payloadHex = "01220123074E0000000000";
  const port = 6;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check if variable is correct", () => {
    expect(result.battery?.value).toBe(3.5);
    expect(result.current?.value).toBe(7);
    expect(result.fine_current?.value).toBe(7.8);
  });
});
//good
describe("Port 7, 0x81, configure report response", () => {
  const payloadHex = "812200000000000000000";
  const port = 7;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("config_report_rsp");
    expect(result.status?.value).toBe("success");
  });
});
//good
describe("Port 7, 0x82, read current configure report", () => {
  const payloadHex = "822203840708010A000000";
  const port = 7;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("read_config_report_rsp");
    expect(result.min_time?.value).toBe(900);
    expect(result.max_time?.value).toBe(1800);
    expect(result.battery_change?.value).toBe(0.1);
    expect(result.current_change?.value).toBe(10);
  });
});
