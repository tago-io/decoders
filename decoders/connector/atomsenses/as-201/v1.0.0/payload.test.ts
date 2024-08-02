import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/atomsenses/as-201/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex, unit: "", metadata: {} }];
  payload = decoderRun(file_path, { payload });
  // Decoder variables
  const battery = payload.find((item) => item.variable === "battery");
  const temperature = payload.find((item) => item.variable === "temperature");
  const humidity = payload.find((item) => item.variable === "humidity");
  const co2 = payload.find((item) => item.variable === "co2");
  // Error parsing
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    battery,
    temperature,
    humidity,
    co2,
    parse_error,
  };
}

describe("Device information unit tests", () => {
  const payloadHex = "01755C03673401046865077dE704087d0000097d0100";
  const result = preparePayload(payloadHex);

  test("Check variable values", () => {
    expect(result.battery?.value).toBe(92);
    expect(result.temperature?.value).toBe(30.8);
    expect(result.humidity?.value).toBe(50.5);
    expect(result.co2?.value).toBe(1255);
  });

  test("Check variable units", () => {
    expect(result.battery?.unit).toBe("%");
    expect(result.temperature?.unit).toBe("°C");
    expect(result.humidity?.unit).toBe("%RH");
    expect(result.co2?.unit).toBe("ppm");
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
