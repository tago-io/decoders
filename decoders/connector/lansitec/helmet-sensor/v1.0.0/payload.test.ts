import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/lansitec/helmet-sensor/v1.0.0/payload.ts" as const;

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
  const battery = payload.find((item) => item.variable === "battery");
  const rssi = payload.find((item) => item.variable === "rssi");
  const snr = payload.find((item) => item.variable === "snr");
  const bleReceivingNumber = payload.find(
    (item) => item.variable === "bleReceivingNumber"
  );
  const gnssSearchingNumber = payload.find(
    (item) => item.variable === "gnssSearchingNumber"
  );
  const chargeTime = payload.find((item) => item.variable === "chargeTime");
  const wearTime = payload.find((item) => item.variable === "wearTime");
  const moveState = payload.find((item) => item.variable === "moveState");
  const temperature = payload.find((item) => item.variable === "temperature");

  return {
    type,
    battery,
    rssi,
    snr,
    bleReceivingNumber,
    gnssSearchingNumber,
    chargeTime,
    wearTime,
    moveState,
    temperature,
  };
}

describe("Helmet sensor heartbeat unit tests", () => {
  const payloadHex = "20643E033E006C000000";
  const result = preparePayload(payloadHex);

  test("Check variable values", () => {
    expect(result.type?.value).toBe("Heartbeat");
    expect(result.battery?.value).toBe(100);
    expect(result.rssi?.value).toBe(-62);
    expect(result.snr?.value).toBe(8.3);
    expect(result.bleReceivingNumber?.value).toBe(0);
    expect(result.gnssSearchingNumber?.value).toBe(108);
    expect(result.chargeTime?.value).toBe(0);
    expect(result.wearTime?.value).toBe(0);
    expect(result.moveState?.value).toBe(0);
    expect(result.temperature?.value).toBe(0);
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
