import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/dragino/lse01/v1.0.0/payload.ts";

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex, unit: "" }];
  payload = decoderRun(file_path, { payload });
  const battery = payload.find((item) => item.variable === "battery");
  const temperature = payload.find((item) => item.variable === "temperature");
  const soilMoisture = payload.find((item) => item.variable === "soil_moisture");
  const soilTemperature = payload.find((item) => item.variable === "soil_temperature");
  const soilConductivity = payload.find((item) => item.variable === "soil_conductivity");
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return { payload, battery, temperature, soilMoisture, soilTemperature, soilConductivity, parse_error };
}

describe("LSE01 decoder unit test", () => {
  const payloadHexSoil = "0B45000005DC010500C8";
  const result = preparePayload(payloadHexSoil);

  test("Output Result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check if variable exists", () => {
    expect(result.battery).toBeTruthy();
    expect(result.temperature).toBeTruthy();
    expect(result.soilMoisture).toBeTruthy();
    expect(result.soilTemperature).toBeTruthy();
    expect(result.soilConductivity).toBeTruthy();
  });

  test("Check output values", () => {
    expect(result.battery?.value).toBe(2885);
    expect(result.temperature?.value).toBe(0);
    expect(result.soilMoisture?.value).toBe(15);
    expect(result.soilTemperature?.value).toBe(2.61);
    expect(result.soilConductivity?.value).toBe(200);
  });

  test("Check variable unit", () => {
    expect(result.battery?.unit).toBe("mV");
    expect(result.temperature?.unit).toBe("°C");
    expect(result.soilMoisture?.unit).toBe("%");
    expect(result.soilTemperature?.unit).toBe("°C");
    expect(result.soilConductivity?.unit).toBe("uS/cm");
  });
});

describe("LSE01 - error handling", () => {
  const payloadHexSoil = "0B4500110DWE";
  const { parse_error } = preparePayload(payloadHexSoil);

  test("Output should be an error", () => {
    expect(parse_error?.value).toBe("INCORRECT_HEXADECIMAL_PAYLOAD_LENGTH");
  });
});

describe("LSE01 - shall not be parsed", () => {
  let payload = [{ variable: "shallnotpass", value: "04096113950292" }];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "shallnotpass", value: "04096113950292" }]);
  });
});
