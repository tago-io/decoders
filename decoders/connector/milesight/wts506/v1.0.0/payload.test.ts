/* eslint-disable unicorn/numeric-separators-style */
import { expect, describe, test } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/milesight/wts506/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex, unit: "" }];
  payload = decoderRun(file_path, { payload });
  const battery = payload.find((item) => item.variable === "battery");
  const temperature = payload.find((item) => item.variable === "temperature");
  const humidity = payload.find((item) => item.variable === "humidity");
  const pressure = payload.find((item) => item.variable === "pressure");
  const wind_direction = payload.find((item) => item.variable === "wind_direction");
  const wind_speed = payload.find((item) => item.variable === "wind_speed");
  const rainfall_total = payload.find((item) => item.variable === "rainfall_total");
  const rainfall_counter = payload.find((item) => item.variable === "rainfall_counter");

  // Error parsing
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    battery,
    temperature,
    humidity,
    pressure,
    wind_direction,
    wind_speed,
    rainfall_total,
    rainfall_counter,
    parse_error,
  };
}

describe("Unit tests", () => {
  const payloadHex = "01756403671001046871058446050673aa27079292010877c41325";
  const result = preparePayload(payloadHex);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check, if variable exists", () => {
    expect(result.humidity).toBeTruthy();
    expect(result.temperature).toBeTruthy();
    expect(result.battery).toBeTruthy();
    expect(result.pressure).toBeTruthy();
    expect(result.wind_direction).toBeTruthy();
    expect(result.wind_speed).toBeTruthy();
    expect(result.rainfall_total).toBeTruthy();
    expect(result.rainfall_counter).toBeTruthy();
  });

  test("Check, variable values", () => {
    expect(result.battery?.value).toBe(100);
    expect(result.temperature?.value).toBe(27.2);
    expect(result.humidity?.value).toBe(56.5);
    expect(result.pressure?.value).toBe(1015.4);
    expect(result.wind_direction?.value).toBe(135);
    expect(result.wind_speed?.value).toBe(40.2);
    expect(result.rainfall_total?.value).toBe(50.6);
    expect(result.rainfall_counter?.value).toBe(37);
  });

  test("Check, if unit", () => {
    expect(result.battery?.unit).toBe("%");
    expect(result.temperature?.unit).toBe("°C");
    expect(result.humidity?.unit).toBe("RH");
    expect(result.pressure?.unit).toBe("hPa");
    expect(result.wind_direction?.unit).toBe("°");
    expect(result.wind_speed?.unit).toBe("m/s");
    expect(result.rainfall_total?.unit).toBe("mm");
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
