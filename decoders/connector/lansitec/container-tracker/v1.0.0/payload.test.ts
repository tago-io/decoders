import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/lansitec/container-tracker/v1.0.0/payload.ts" as const;

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
  const snrEnable = payload.find((item) => item.variable === "snrEnable");
  const voltage = payload.find((item) => item.variable === "voltage");
  const rssi = payload.find((item) => item.variable === "rssi");
  const snr = payload.find((item) => item.variable === "snr");
  const gnssState = payload.find((item) => item.variable === "gnssState");
  const moveState = payload.find((item) => item.variable === "moveState");
  const temperature = payload.find((item) => item.variable === "temperature");
  const movement = payload.find((item) => item.variable === "movement");

  return {
    type,
    snrEnable,
    voltage,
    rssi,
    snr,
    gnssState,
    moveState,
    temperature,
    movement,
  };
}

describe("Container tracker heartbeat unit tests", () => {
  const payloadHex = "20643E033E00001D004800000000";
  const result = preparePayload(payloadHex);

  test("Check variable values", () => {
    expect(result.type?.value).toBe("Heartbeat");
    expect(result.snrEnable?.value).toBe("No SNR field");
    expect(result.voltage?.value).toBe(2.5);
    expect(result.rssi?.value).toBe(-62);
    expect(result.snr?.value).toBe(8.3);
    expect(result.gnssState?.value).toBe("Off");
    expect(result.moveState?.value).toBe(0);
    expect(result.temperature?.value).toBe("29℃");
    expect(result.movement?.value).toBe(360);
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
