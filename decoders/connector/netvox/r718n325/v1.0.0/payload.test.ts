/* eslint-disable unicorn/numeric-separators-style */
import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/netvox/r718n325/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex, port) {
  let payload = [
    { variable: "payload", value: payloadHex, unit: "" },
    { variable: "fport", value: port, unit: "" },
  ] as any;
  payload = decoderRun(file_path, { payload });

  const parse_error = payload.find((item) => item.variable === "parse_error");
  const battery = payload.find((item) => item.variable === "battery");
  const cmd = payload.find((item) => item.variable === "cmd");
  const status = payload.find((item) => item.variable === "status");
  const min_time = payload.find((item) => item.variable === "min_time");
  const max_time = payload.find((item) => item.variable === "max_time");
  const shock_event = payload.find((item) => item.variable === "shock_event");
  // const multiplier1 = payload.find((item) => item.variable === "multiplier1");
  const multiplier2 = payload.find((item) => item.variable === "multiplier2");
  const multiplier3 = payload.find((item) => item.variable === "multiplier3");
  const current1 = payload.find((item) => item.variable === "current1");
  const current2 = payload.find((item) => item.variable === "current2");
  const current3 = payload.find((item) => item.variable === "current3");
  const current_change = payload.find((item) => item.variable === "current_change");

  return {
    payload,
    battery,
    cmd,
    status,
    min_time,
    max_time,
    shock_event,
    parse_error,
    current_change,
    current1,
    current2,
    current3,
    // multiplier1,
    multiplier2,
    multiplier3,
  };
}

describe("Port 6, 0x01, unit tests", () => {
  const payloadHex = "014A012405DC07D009C401";
  const port = 6;
  const result = preparePayload(payloadHex, port);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.battery?.value).toBe(3.6);
    expect(result.current1?.value).toBe(1500);
    expect(result.current2?.value).toBe(2000);
    expect(result.current3?.value).toBe(2500);
    expect(result.current1?.metadata?.multiplier1).toBe(1);
  });
});

describe("Port 6, 0x02, unit tests", () => {
  const payloadHex = "014A022401010000000000";
  const port = 6;
  const result = preparePayload(payloadHex, port);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.battery?.value).toBe(3.6);
    expect(result.multiplier2?.value).toBe(1);
    expect(result.multiplier3?.value).toBe(1);
  });
});

describe("Port 7, 0x81, unit tests", () => {
  const payloadHex = "81BB010000000000000000";
  const port = 7;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("config_report_rsp");
    expect(result.status?.value).toBe("failure");
  });
});

describe("Port 7, 0x82, unit tests", () => {
  const payloadHex = "824A003C003C0064000000";
  const port = 7;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("read_config_report_rsp");
    expect(result.min_time?.value).toBe(60);
    expect(result.max_time?.value).toBe(60);
    expect(result.current_change?.value).toBe(100);
  });
});
