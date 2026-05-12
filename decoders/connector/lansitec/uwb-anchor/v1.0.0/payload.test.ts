import { describe, expect, test } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/lansitec/uwb-anchor/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload: {
    variable: string;
    value: string;
    unit?: string;
    metadata?: {};
  }[] = [{ variable: "payload", value: payloadHex }];

  payload = decoderRun(file_path, { payload });

  const type = payload.find((item) => item.variable === "type");
  const batteryVoltage = payload.find((item) => item.variable === "batteryVoltage");
  const uwbPositioningCount = payload.find((item) => item.variable === "uwbPositioningCount");
  const temperature = payload.find((item) => item.variable === "temperature");

  return {
    payload,
    type,
    batteryVoltage,
    uwbPositioningCount,
    temperature,
  };
}

describe("UWB heartbeat unit tests", () => {
  const payloadHex = "2000000000290000000000110000000000000000";
  const result = preparePayload(payloadHex);

  test("Check variable values", () => {
    expect(result.type?.value).toBe("HeartbeatMessage");
    expect(result.batteryVoltage?.value).toBe("4.1V");
    expect(result.uwbPositioningCount?.value).toBe(0);
    expect(result.temperature?.value).toBe("17°C");
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
    expect(payload).toEqual([{ variable: "shallnotpass", value: "04096113950292" }]);
  });
});
