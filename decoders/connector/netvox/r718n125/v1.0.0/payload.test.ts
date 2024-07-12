/* eslint-disable unicorn/numeric-separators-style */
import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/netvox/r718n125/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string, port: number) {
  let payload = [
    { variable: "payload", value: payloadHex, unit: "" },
    { variable: "fport", value: port, unit: "" },
  ] as any;
  payload = decoderRun(file_path, { payload });

  const software_version = payload.find(
    (item) => item.variable === "software_version"
  );
  const hardware_version = payload.find(
    (item) => item.variable === "hardware_version"
  );
  const date_code = payload.find((item) => item.variable === "date_code");
  const parse_error = payload.find((item) => item.variable === "parse_error");
  const battery = payload.find((item) => item.variable === "battery");
  const cmd = payload.find((item) => item.variable === "cmd");
  const status = payload.find((item) => item.variable === "status");
  const min_time = payload.find((item) => item.variable === "min_time");
  const max_time = payload.find((item) => item.variable === "max_time");
  const current_change = payload.find(
    (item) => item.variable === "current_change"
  );
  const current = payload.find((item) => item.variable === "current");
  const multiplier = payload.find((item) => item.variable === "multiplier");
  const lowCurrent = payload.find((item) => item.variable === "lowCurrent");
  const highCurrent = payload.find((item) => item.variable === "highCurrent");

  return {
    software_version,
    hardware_version,
    date_code,
    payload,
    battery,
    cmd,
    status,
    min_time,
    max_time,
    parse_error,
    current_change,
    current,
    multiplier,
    lowCurrent,
    highCurrent,
  };
}

describe("Port 6, 0x01, unit tests", () => {
  const payloadHex = "0149016010103001000000";
  const port = 6;
  const result = preparePayload(payloadHex, port);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.battery?.value).toBe(9.6);
    expect(result.current?.value).toBe(4112);
    expect(result.multiplier?.value).toBe(48);
    expect(result.lowCurrent?.value).toBe("alarm");
    expect(result.highCurrent?.value).toBe("noalarm");
  });
});

describe("Port 7, 0x81, unit tests", () => {
  const payloadHex = "8149010000000000000000";
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

describe("Port 7, 0x01, unit tests", () => {
  const payloadHex = "0149016010103001000000";
  const port = 7;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("config_report_req");
    expect(result.min_time?.value).toBe(352);
    expect(result.max_time?.value).toBe(4112);
    expect(result.current_change?.value).toBe(12289);
  });
});

describe("Port 7, 0x81, unit tests", () => {
  const payloadHex = "8149026010103001000000";
  const port = 7;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("config_report_rsp");
    expect(result.status?.value).toBe(2);
  });
});

describe("Port 7, 0x82, unit tests", () => {
  const payloadHex = "8249016010103001000000";
  const port = 7;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("read_config_report_rsp");
    expect(result.min_time?.value).toBe(352);
    expect(result.max_time?.value).toBe(4112);
    expect(result.current_change?.value).toBe(12289);
  });
});
