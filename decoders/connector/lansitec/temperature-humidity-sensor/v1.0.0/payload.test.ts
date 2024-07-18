import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/lansitec/temperature-humidity-sensor/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload: {
    variable: string;
    value: string;
    unit: string;
    metadata: {};
  }[] = [{ variable: "payload", value: payloadHex, unit: "", metadata: {} }];
  payload = decoderRun(file_path, { payload });
  // decodeUplink variables
  const type = payload.find((item) => item.variable === "type");
  const version = payload.find((item) => item.variable === "version");
  const battery = payload.find((item) => item.variable === "battery");
  const rssi = payload.find((item) => item.variable === "rssi");
  const snr = payload.find((item) => item.variable === "snr");
  const temperature = payload.find((item) => item.variable === "temperature");
  const humidity = payload.find((item) => item.variable === "humidity");
  const crc = payload.find((item) => item.variable === "crc");

  return {
    type,
    version,
    battery,
    rssi,
    snr,
    temperature,
    humidity,
    crc,
  };
}

describe("Temperature and humidity unit tests", () => {
  const payloadHex = "2164500bb81610220000";
  const result = preparePayload(payloadHex);

  test("Check variable values", () => {
    expect(result.type?.value).toBe("Heartbeat");
    expect(result.version?.value).toBe(1);
    expect(result.battery?.value).toBe(100);
    expect(result.rssi?.value).toBe(-80);
    expect(result.snr?.value).toBe(30);
    expect(result.temperature?.value).toBe("22.16℃");
    expect(result.humidity?.value).toBe(34);
    expect(result.crc?.value).toBe(0);
  });
});

describe("Shall not be parsed", () => {
  let payload: {
    variable: string;
    value: string;
  }[] = [{ variable: "shallnotpass", value: "04096113950292" }];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([
      { variable: "shallnotpass", value: "04096113950292" },
    ]);
  });
});
