import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/milesight/vs133/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex }];
  payload = decoderRun(file_path, { payload });

  const line_1_total_in = payload.find((item) => item.variable === "line_1_total_in");
  const line_1_total_out = payload.find((item) => item.variable === "line_1_total_out");
  const line_2_total_in = payload.find((item) => item.variable === "line_2_total_in");
  const line_2_total_out = payload.find((item) => item.variable === "line_2_total_out");
  const line_3_total_in = payload.find((item) => item.variable === "line_3_total_in");
  const line_3_total_out = payload.find((item) => item.variable === "line_3_total_out");
  const line_4_total_in = payload.find((item) => item.variable === "line_4_total_in");
  const line_4_total_out = payload.find((item) => item.variable === "line_4_total_out");

  const line_1_period_in = payload.find((item) => item.variable === "line_1_period_in");
  const line_1_period_out = payload.find((item) => item.variable === "line_1_period_out");
  const line_2_period_in = payload.find((item) => item.variable === "line_2_period_in");
  const line_2_period_out = payload.find((item) => item.variable === "line_2_period_out");
  const line_3_period_in = payload.find((item) => item.variable === "line_3_period_in");
  const line_3_period_out = payload.find((item) => item.variable === "line_3_period_out");
  const line_4_period_in = payload.find((item) => item.variable === "line_4_period_in");
  const line_4_period_out = payload.find((item) => item.variable === "line_4_period_out");

  const region_1_count = payload.find((item) => item.variable === "region_1_count");
  const region_2_count = payload.find((item) => item.variable === "region_2_count");
  const region_3_count = payload.find((item) => item.variable === "region_3_count");
  const region_4_count = payload.find((item) => item.variable === "region_4_count");

  const region_1_avg_dwell = payload.find((item) => item.variable === "region_1_avg_dwell");
  const region_1_max_dwell = payload.find((item) => item.variable === "region_1_max_dwell");
  const region_2_avg_dwell = payload.find((item) => item.variable === "region_2_avg_dwell");
  const region_2_max_dwell = payload.find((item) => item.variable === "region_2_max_dwell");
  const region_3_avg_dwell = payload.find((item) => item.variable === "region_3_avg_dwell");
  const region_3_max_dwell = payload.find((item) => item.variable === "region_3_max_dwell");
  const region_4_avg_dwell = payload.find((item) => item.variable === "region_4_avg_dwell");
  const region_4_max_dwell = payload.find((item) => item.variable === "region_4_max_dwell");

  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    line_1_total_in,
    line_1_total_out,
    line_2_total_in,
    line_2_total_out,
    line_3_total_in,
    line_3_total_out,
    line_4_total_in,
    line_4_total_out,
    line_1_period_in,
    line_1_period_out,
    line_2_period_in,
    line_2_period_out,
    line_3_period_in,
    line_3_period_out,
    line_4_period_in,
    line_4_period_out,
    region_1_count,
    region_2_count,
    region_3_count,
    region_4_count,
    region_1_avg_dwell,
    region_1_max_dwell,
    region_2_avg_dwell,
    region_2_max_dwell,
    region_3_avg_dwell,
    region_3_max_dwell,
    region_4_avg_dwell,
    region_4_max_dwell,
    parse_error,
  };
}

describe("Total In/Out", () => {
  test("should decode the payload correctly", () => {
    const payloadHex = "03D24800000004D2C800000006D20000000007D20000000009D2000000000AD2000000000CD2B41400000DD28D1A0000";
    const result = preparePayload(payloadHex);

    expect(result.line_1_total_in?.value).toBe(72);
    expect(result.line_1_total_out?.value).toBe(200);
    expect(result.line_2_total_in?.value).toBe(0);
    expect(result.line_2_total_out?.value).toBe(0);
    expect(result.line_3_total_in?.value).toBe(0);
    expect(result.line_3_total_out?.value).toBe(0);
    expect(result.line_4_total_in?.value).toBe(5300);
    expect(result.line_4_total_out?.value).toBe(6797);
  });
});

describe("Period In/Out", () => {
  test("should decode the payload correctly", () => {
    const payloadHex = "05CC0000000008CC000000000BCC000000000ECC05000700";
    const result = preparePayload(payloadHex);

    expect(result.line_1_period_in?.value).toBe(0);
    expect(result.line_1_period_out?.value).toBe(0);
    expect(result.line_2_period_in?.value).toBe(0);
    expect(result.line_2_period_out?.value).toBe(0);
    expect(result.line_3_period_in?.value).toBe(0);
    expect(result.line_3_period_out?.value).toBe(0);
    expect(result.line_4_period_in?.value).toBe(5);
    expect(result.line_4_period_out?.value).toBe(7);
  });
});

describe("Region Counter", () => {
  test("should decode the payload correctly", () => {
    const payloadHex = "0FE302100709";
    const result = preparePayload(payloadHex);

    expect(result.region_1_count?.value).toBe(2);
    expect(result.region_2_count?.value).toBe(16);
    expect(result.region_3_count?.value).toBe(7);
    expect(result.region_4_count?.value).toBe(9);
  });
});

describe("Dwell Time", () => {
  test("should decode the payload correctly", () => {
    const payloadHex = "10E4010910112110E4027521753310E4038121238910E40476001387";
    const result = preparePayload(payloadHex);

    expect(result.region_1_avg_dwell?.value).toBe(4105);
    expect(result.region_1_max_dwell?.value).toBe(8465);
    expect(result.region_2_avg_dwell?.value).toBe(8565);
    expect(result.region_2_max_dwell?.value).toBe(13_173);
    expect(result.region_3_avg_dwell?.value).toBe(8577);
    expect(result.region_3_max_dwell?.value).toBe(35_107);
    expect(result.region_4_avg_dwell?.value).toBe(118);
    expect(result.region_4_max_dwell?.value).toBe(34_579);
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
