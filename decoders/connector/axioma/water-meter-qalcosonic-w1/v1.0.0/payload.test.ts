import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/axioma/water-meter-qalcosonic-w1/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex }];
  payload = decoderRun(file_path, { payload });

  const status_code = payload.find((item) => item.variable === "status_code");
  const current_volume = payload.find((item) => item.variable === "current_volume");
  const first_log_datetime = payload.find((item) => item.variable === "first_log_datetime");
  const volume_at_log_datetime = payload.find((item) => item.variable === "volume_at_log_datetime");

  const log_volume_delta_1 = payload.find((item) => item.variable === "log_volume_delta_1");
  const log_volume_delta_2 = payload.find((item) => item.variable === "log_volume_delta_2");
  const log_volume_delta_3 = payload.find((item) => item.variable === "log_volume_delta_3");
  const log_volume_delta_4 = payload.find((item) => item.variable === "log_volume_delta_4");
  const log_volume_delta_5 = payload.find((item) => item.variable === "log_volume_delta_5");
  const log_volume_delta_6 = payload.find((item) => item.variable === "log_volume_delta_6");
  const log_volume_delta_7 = payload.find((item) => item.variable === "log_volume_delta_7");
  const log_volume_delta_8 = payload.find((item) => item.variable === "log_volume_delta_8");
  const log_volume_delta_9 = payload.find((item) => item.variable === "log_volume_delta_9");
  const log_volume_delta_10 = payload.find((item) => item.variable === "log_volume_delta_10");
  const log_volume_delta_11 = payload.find((item) => item.variable === "log_volume_delta_11");
  const log_volume_delta_12 = payload.find((item) => item.variable === "log_volume_delta_12");
  const log_volume_delta_13 = payload.find((item) => item.variable === "log_volume_delta_13");
  const log_volume_delta_14 = payload.find((item) => item.variable === "log_volume_delta_14");
  const log_volume_delta_15 = payload.find((item) => item.variable === "log_volume_delta_15");

  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    status_code,
    current_volume,
    first_log_datetime,
    volume_at_log_datetime,
    log_volume_delta_1,
    log_volume_delta_2,
    log_volume_delta_3,
    log_volume_delta_4,
    log_volume_delta_5,
    log_volume_delta_6,
    log_volume_delta_7,
    log_volume_delta_8,
    log_volume_delta_9,
    log_volume_delta_10,
    log_volume_delta_11,
    log_volume_delta_12,
    log_volume_delta_13,
    log_volume_delta_14,
    log_volume_delta_15,

    // parse error
    parse_error,
  };
}

describe("Port 100 unit tests", () => {
  const payloadHex = "0ea0355d302935000030b6345de7290000b800b900b800b800b800b900b800b800b800b800b800b800b900b900b900";
  const result = preparePayload(payloadHex);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Port 100 variable values", () => {
    expect(result.status_code?.value).toBe(30);
    expect(result.current_volume?.value).toBe(13.609);
    expect(result.first_log_datetime?.value).toBe("2019-07-21T19:00:00.000Z");
    expect(result.volume_at_log_datetime?.value).toBe(10.727);
    expect(result.log_volume_delta_1?.value).toBe(0.184);
    expect(result.log_volume_delta_1?.value).toBe(0.184);
    expect(result.log_volume_delta_2?.value).toBe(0.185);
    expect(result.log_volume_delta_3?.value).toBe(0.184);
    expect(result.log_volume_delta_4?.value).toBe(0.184);
    expect(result.log_volume_delta_5?.value).toBe(0.184);
    expect(result.log_volume_delta_6?.value).toBe(0.185);
    expect(result.log_volume_delta_7?.value).toBe(0.184);
    expect(result.log_volume_delta_8?.value).toBe(0.184);
    expect(result.log_volume_delta_9?.value).toBe(0.184);
    expect(result.log_volume_delta_10?.value).toBe(0.184);
    expect(result.log_volume_delta_11?.value).toBe(0.184);
    expect(result.log_volume_delta_12?.value).toBe(0.184);
    expect(result.log_volume_delta_13?.value).toBe(0.185);
    expect(result.log_volume_delta_14?.value).toBe(0.185);
    expect(result.log_volume_delta_15?.value).toBe(0.185);
  });
});

describe("Port 100 unit tests, smaller payload", () => {
  const payloadHex = "f70a196810280000000000";
  const result = preparePayload(payloadHex);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Port 100 variable values", () => {
    expect(result.status_code?.value).toBe(10);
    expect(result.current_volume?.value).toBe(0.04);
  });
});

describe("Port 103 unit tests", () => {
  const payloadHex = "43b1315d30";
  const result = preparePayload(payloadHex);

  test("Port 103 variable values", () => {
    expect(result.status_code?.value).toBe(30);
  });
});

describe("Shall not be parsed", () => {
  let payload = [{ variable: "shallnotpass", value: "04096113950292" }];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "shallnotpass", value: "04096113950292" }]);
  });
});
