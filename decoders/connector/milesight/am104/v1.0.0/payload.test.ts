import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/milesight/am104/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex, unit: "", metadata: {} }];
  payload = decoderRun(file_path, { payload });
  // Decoder variables
  const battery = payload.find((item) => item.variable === "battery");
  const temperature = payload.find((item) => item.variable === "temperature");
  const humidity = payload.find((item) => item.variable === "humidity");
  const motion_detection = payload.find((item) => item.variable === "motion_detection");
  const illumination = payload.find((item) => item.variable === "illumination");
  // Error parsing
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    battery,
    temperature,
    humidity,
    motion_detection,
    illumination,
    parse_error,
  };
}

describe("Device information unit tests", () => {
  const payloadHex = "01755C03673401046865056A490006651C0079001400";
  const result = preparePayload(payloadHex);

  test("Check variable values", () => {
    expect(result.battery?.value).toBe(92);
    expect(result.temperature?.value).toBe(30.8);
    expect(result.humidity?.value).toBe(50.5);
    expect(result.motion_detection?.value).toBe(73);
    expect(result.illumination?.value).toBe(28);
  });

  test("Check variable units", () => {
    expect(result.battery?.unit).toBe("%");
    expect(result.temperature?.unit).toBe("°C");
    expect(result.humidity?.unit).toBe("%RH");
    expect(result.motion_detection?.unit).toBeUndefined();
    expect(result.illumination?.unit).toBe("lux");
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
