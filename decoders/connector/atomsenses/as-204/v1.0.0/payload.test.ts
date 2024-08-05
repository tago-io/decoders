import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/atomsenses/as-204/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex, unit: "", metadata: {} }];
  payload = decoderRun(file_path, { payload });
  // Decoder variables
  const battery = payload.find((item) => item.variable === "battery");
  const temperature = payload.find((item) => item.variable === "temperature");
  const humidity = payload.find((item) => item.variable === "humidity");
  const co2 = payload.find((item) => item.variable === "co2");
  const nh3 = payload.find((item) => item.variable === "nh3");
  const h2s = payload.find((item) => item.variable === "h2s");
  // Error parsing
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    battery,
    temperature,
    humidity,
    co2,
    nh3,
    h2s,
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
    expect(result.nh3?.value).toBe(0);
    expect(result.h2s?.value).toBe(0.01);
  });

  test("Check variable units", () => {
    expect(result.battery?.unit).toBe("%");
    expect(result.temperature?.unit).toBe("°C");
    expect(result.humidity?.unit).toBe("%RH");
    expect(result.co2?.unit).toBe("ppm");
    expect(result.nh3?.unit).toBe("ppm");
    expect(result.h2s?.unit).toBe("ppm");
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
