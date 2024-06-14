import { describe, test, it, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/milesight/at101/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex, unit: "", metadata: {} }];
  payload = decoderRun(file_path, { payload });

  const battery = payload.find((item) => item.variable === "battery");
  const temperature = payload.find((item) => item.variable === "temperature");
  const location = payload.find((item) => item.variable === "location");
  const motion_status = payload.find((item) => item.variable === "motion_status");
  const geofence_status = payload.find((item) => item.variable === "geofence_status");
  const position = payload.find((item) => item.variable === "position");
  const historical_location = payload.find((item) => item.variable === "historical_location");
  const wifi = payload.find((item) => item.variable === "wifi");
  const temperature_abnormal = payload.find((item) => item.variable === "temperature_abnormal");
  // Error parsing
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    battery,
    temperature,
    location,
    motion_status,
    geofence_status,
    position,
    historical_location,
    temperature_abnormal,
    wifi,
    parse_error,
  };
}

describe("Device information unit tests", () => {
  const payloadHex = "01756403671B01050000048836BF7701F000090722";
  const result = preparePayload(payloadHex);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.battery?.value).toBe(100);
    expect(result.geofence_status?.value).toBe("unset");
    expect(result.location?.value).toBe("24.62495,118.030576");
    expect(result.location?.metadata).toEqual({ lat: 24.62495, lng: 118.030576 });
    expect(result.motion_status?.value).toBe("moving");
    expect(result.position?.value).toBe("normal");
    expect(result.temperature?.value).toBe(28.3);
  });
});

describe("AT101 Decoder", () => {
  it("should decode the payload correctly", () => {
    const payloadHex = "01756403671B0105000106D9081CC316222DF9C30206D90824E124F6A667B60206D90824E124F54DE3BC0206D90824E124F57971B20206D90824E124F319A8C802";
    const result = preparePayload(payloadHex);

    expect(result.battery?.value).toBe(100);
    expect(result.position?.value).toBe("tilt");
    expect(result.temperature?.value).toBe(28.3);
    expect(result.wifi?.value).toBe("1c:c3:16:22:2d:f9");
    expect(result.wifi?.metadata).toEqual({ rssi: -61, group: 8 });
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
