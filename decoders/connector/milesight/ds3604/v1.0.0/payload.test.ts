import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/milesight/ds3604/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex }];
  payload = decoderRun(file_path, { payload });

  const battery = payload.find((item) => item.variable === "battery");
  const template = payload.find((item) => item.variable === "template");
  const text_1 = payload.find((item) => item.variable === "text_1");
  const qrcode = payload.find((item) => item.variable === "qrcode");

  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    battery,
    template,
    qrcode,
    text_1,
    parse_error,
  };
}

describe("Device information unit tests", () => {
  const payloadHex = "017564FB0100054D696C6573FB010A0568656C6C6F";
  const result = preparePayload(payloadHex);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.battery?.value).toBe(100);
    expect(result.template?.value).toBe(1);
    expect(result.text_1?.value).toBe("Miles");
    expect(result.qrcode?.value).toBe("hello");
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
