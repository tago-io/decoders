import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/netvox/r313da/v1.0.0/payload.ts";

function preparePayload(payloadHex, port) {
  let payload = [
    { variable: "payload", value: payloadHex, unit: "" },
    { variable: "fPort", value: port, unit: "" },
  ];
  payload = decoderRun(file_path, { payload });
  const parse_error = payload.find((item) => item.variable === "parse_error");
  const cmd = payload.find((item) => item.variable === "cmd");
  const status = payload.find((item) => item.variable === "status");
  const min_time = payload.find((item) => item.variable === "min_time");
  const max_time = payload.find((item) => item.variable === "max_time");
  const battery_change = payload.find((item) => item.variable === "battery_change");
  const restore_report_set = payload.find((item) => item.variable === "restore_report_set");
  return {
    payload,
    cmd,
    status,
    min_time,
    max_time,
    battery_change,
    restore_report_set,
    parse_error,
  };
}

describe("Port 7, 0x81, configure report response", () => {
  const payloadHex = "81A8000000000000000000";
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

describe("Port 7, 0x82, read current configure report", () => {
  const payloadHex = "824E003C003C0100000000";
  const port = 7;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("read_config_report_rsp");
    expect(result.min_time?.value).toBe(60);
    expect(result.max_time?.value).toBe(60);
    expect(result.battery_change?.value).toBe(0.1);
  });
});

describe("Port 7, 0x83, set restore report response", () => {
  const payloadHex = "83A8000000000000000000";
  const port = 7;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("set_restore_report_rsp");
    expect(result.status?.value).toBe("success");
  });
});

describe("Port 7, 0x84, read current restore report", () => {
  const payloadHex = "84A8010000000000000000";
  const port = 7;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.restore_report_set?.value).toBe("report_when_sensor_restore");
  });
});
