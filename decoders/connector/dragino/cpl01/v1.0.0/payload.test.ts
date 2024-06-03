import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/dragino/cpl01/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex } as any];
  payload = decoderRun(file_path, { payload });

  const battery_level = payload.find((item) => item.variable === "battery_level");
  const signal = payload.find((item) => item.variable === "signal");
  const mod = payload.find((item) => item.variable === "mod");
  const calculate_flag = payload.find((item) => item.variable === "calculate_flag");
  const contact_status = payload.find((item) => item.variable === "contact_status");
  const alarm = payload.find((item) => item.variable === "alarm");
  const total_pulse = payload.find((item) => item.variable === "total_pulse");
  const open_duration = payload.find((item) => item.variable === "open_duration");

  // Error parsing
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    battery_level,
    signal,
    mod,
    calculate_flag,
    contact_status,
    alarm,
    total_pulse,
    open_duration,
    parse_error,
  };
}

describe("unit tests", () => {
  const payloadHex = "f86778705021331700640c7817010000000000090000026315537b0100000b00002663510fed0100000b00002663510fed0100000b00002663510fed0100000b00002663510fed0100000b00002663510fed0100000b00002663510fed0100000b00002663510fed0100000b00002663510882";
  const result = preparePayload(payloadHex);
  console.log(result.parse_error);
  console.log(result);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.battery_level?.value).toBe(3.192);
    expect(result.signal?.value).toBe(23);
    expect(result.mod?.value).toBe(1);
    expect(result.calculate_flag?.value).toBe(0);
    expect(result.contact_status?.value).toBe(0);
    expect(result.alarm?.value).toBe(0);
    expect(result.total_pulse?.value).toBe(9);
    expect(result.open_duration?.value).toBe(2);
  });

  test("Check variable time", () => {
    expect(result.battery_level?.time).toBe("2022-09-05T01:40:11.000Z");
  });

  test("Check variable units", () => {
    expect(result.battery_level?.unit).toBe("V");
  });

  test("check first datalog element", () => {
    expect(result.payload[9]).toMatchObject({
      variable: "contact_status",
      value: 1,
      time: "2022-10-20T09:07:57.000Z",
      group: "2022-10-20T09:07:57.000Z",
    });
    expect(result.payload[10]).toMatchObject({
      variable: "total_pulse",
      value: 11,
      time: "2022-10-20T09:07:57.000Z",
      group: "2022-10-20T09:07:57.000Z",
    });
    expect(result.payload[11]).toMatchObject({
      variable: "open_duration",
      value: 38,
      time: "2022-10-20T09:07:57.000Z",
      group: "2022-10-20T09:07:57.000Z",
    });
  });

  test("check last datalog element", () => {
    expect(result.payload[30]).toMatchObject({
      variable: "contact_status",
      value: 1,
      time: "2022-10-20T08:36:18.000Z",
      group: "2022-10-20T08:36:18.000Z",
    });
    expect(result.payload[31]).toMatchObject({
      variable: "total_pulse",
      value: 11,
      time: "2022-10-20T08:36:18.000Z",
      group: "2022-10-20T08:36:18.000Z",
    });
    expect(result.payload[32]).toMatchObject({
      variable: "open_duration",
      value: 38,
      time: "2022-10-20T08:36:18.000Z",
      group: "2022-10-20T08:36:18.000Z",
    });
  });

  test("Check if all variables have the time key except the parse_error and payload keys", () => {
    const keys = Object.keys(result);
    for (const key of keys) {
      if (key !== "parse_error" && key !== "payload") {
        expect(result[key].time).toBeDefined();
      }
    }
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
