import { describe, expect, it, test } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/globalsat/kt-520/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "sensors_raw_data", value: payloadHex, unit: "" } as any];
  payload = decoderRun(file_path, { payload });
  const period_between_gps_acq = payload.find((item) => item.variable === "period_between_gps_acq");
  const location = payload.find((item) => item.variable === "location");
  // Error parsing
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    period_between_gps_acq,
    location,
    parse_error,
  };
}

describe("kt520 Decoder", () => {
  it("should decode the payload correctly", () => {
    const payloadHex = "EAE2513343D06C80010000000600020001000000000000";
    const result = preparePayload(payloadHex);

    expect(result.payload[0]).toMatchObject({ variable: "period_between_gps_acq", value: 60, unit: "minutes", time: expect.any(Number) });
    expect(result.payload[1]).toMatchObject({
      variable: "location",
      value: "24.9964,121.4874",
      location: { lat: 24.9964, lng: 121.4874 },
      time: expect.any(Number),
    });
    expect(result.payload[2]).toMatchObject({
      variable: "location",
      value: "24.9964,121.4874",
      location: { lat: 24.9964, lng: 121.4874 },
      time: expect.any(Number),
    });
    expect(result.payload[3]).toMatchObject({
      variable: "location",
      value: "24.9964,121.4873",
      location: { lat: 24.9964, lng: 121.4873 },
      time: expect.any(Number),
    });
    expect(result.payload[4]).toMatchObject({
      variable: "location",
      value: "24.9964,121.4874",
      location: { lat: 24.9964, lng: 121.4874 },
      time: expect.any(Number),
    });
  });

  it("should decode the payload correctly", () => {
    const payloadHex = "EEC4413363D0700009000A0008002C0008000C00000000";
    const result = preparePayload(payloadHex);

    expect(result.payload[0]).toMatchObject({ variable: "period_between_gps_acq", value: 60, unit: "minutes", time: expect.any(Number) });
    expect(result.payload[1]).toMatchObject({
      variable: "location",
      value: "24.9968,-13.3531",
      location: { lat: 24.9968, lng: -13.3531 },
      time: expect.any(Number),
    });
    expect(result.payload[2]).toMatchObject({
      variable: "location",
      value: "24.9970,-13.3535",
      location: { lat: 24.997, lng: -13.3535 },
      time: expect.any(Number),
    });
    expect(result.payload[3]).toMatchObject({
      variable: "location",
      value: "24.9958,-13.3529",
      location: { lat: 24.9958, lng: -13.3529 },
      time: expect.any(Number),
    });
    expect(result.payload[4]).toMatchObject({
      variable: "location",
      value: "24.9957,-13.3535",
      location: { lat: 24.9957, lng: -13.3535 },
      time: expect.any(Number),
    });
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
