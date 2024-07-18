import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/lansitec/compact-bluetooth-gateway/v1.0.1/payload.ts" as const;

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
  const version = payload.find((item) => item.variable === "version");
  const chargeState = payload.find((item) => item.variable === "chargeState");

  return {
    type,
    battery,
    rssi,
    snr,
    version,
    chargeState,
  };
}

describe("Compact bluetooth gateway heartbeat unit tests", () => {
  const payloadHex = "21643E033E006C00";
  const result = preparePayload(payloadHex);

  test("Check variable values", () => {
    expect(result.type?.value).toBe("Heartbeat");
    expect(result.battery?.value).toBe(100);
    expect(result.rssi?.value).toBe(-62);
    expect(result.snr?.value).toBe(8.3);
    expect(result.version?.value).toBe(108);
    expect(result.chargeState?.value).toBe("Not charging");
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
