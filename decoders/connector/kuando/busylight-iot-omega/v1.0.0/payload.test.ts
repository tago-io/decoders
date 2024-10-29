/* eslint-disable unicorn/numeric-separators-style */
import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/kuando/busylight-iot-omega/v1.0.0/payload.ts";

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex }];
  payload = decoderRun(file_path, { payload });

  const RSSI = payload.find((item) => item.variable === "RSSI");
  const SNR = payload.find((item) => item.variable === "SNR");
  const messages_received = payload.find((item) => item.variable === "messages_received");
  const messages_send = payload.find((item) => item.variable === "messages_send");
  const lastcolor_red = payload.find((item) => item.variable === "lastcolor_red");
  const lastcolor_blue = payload.find((item) => item.variable === "lastcolor_blue");
  const lastcolor_green = payload.find((item) => item.variable === "lastcolor_green");
  const lastcolor_ontime = payload.find((item) => item.variable === "lastcolor_ontime");
  const lastcolor_offtime = payload.find((item) => item.variable === "lastcolor_offtime");
  const sw_rev = payload.find((item) => item.variable === "sw_rev");
  const hw_rev = payload.find((item) => item.variable === "hw_rev");
  const adr_state = payload.find((item) => item.variable === "adr_state");
  const parse_error = payload.find((item) => item.variable === "parse_error");

  return {
    payload,
    RSSI,
    SNR,
    messages_received,
    messages_send,
    lastcolor_red,
    lastcolor_blue,
    lastcolor_green,
    lastcolor_ontime,
    lastcolor_offtime,
    sw_rev,
    hw_rev,
    adr_state,
    parse_error,
  };
}

describe("Unit Test", () => {
  const payloadHex = "9cffffff140000005c000000c3040000000099ff00380c01";
  const result = preparePayload(payloadHex);

  test("Variable values", () => {
    expect(result.RSSI?.value).toBe(-100);
    expect(result.SNR?.value).toBe(20);
    expect(result.messages_received?.value).toBe(92);
    expect(result.messages_send?.value).toBe(1219);
    expect(result.lastcolor_red?.value).toBe(0);
    expect(result.lastcolor_blue?.value).toBe(0);
    expect(result.lastcolor_green?.value).toBe(153);
    expect(result.lastcolor_ontime?.value).toBe(255);
    expect(result.lastcolor_offtime?.value).toBe(0);
    expect(result.sw_rev?.value).toBe(56);
    expect(result.hw_rev?.value).toBe(12);
    expect(result.adr_state?.value).toBe(1);
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
