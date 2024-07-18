import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/lansitec/nb-iot-container-tracker/v1.0.0/payload.ts" as const;

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
  const batteryVoltage = payload.find(
    (item) => item.variable === "batteryVoltage"
  );
  const batteryLevel = payload.find((item) => item.variable === "batteryLevel");
  const bleReceivingCount = payload.find(
    (item) => item.variable === "bleReceivingCount"
  );
  const gnssOnCount = payload.find((item) => item.variable === "gnssOnCount");
  const temperature = payload.find((item) => item.variable === "temperature");
  const movementDuration = payload.find(
    (item) => item.variable === "movementDuration"
  );
  const messageId = payload.find((item) => item.variable === "messageId");

  return {
    type,
    batteryVoltage,
    batteryLevel,
    bleReceivingCount,
    gnssOnCount,
    temperature,
    movementDuration,
    messageId,
  };
}

describe("Nb-iot container tracker heartbeat unit tests", () => {
  const payloadHex = "20F3804000200B01000023000400000000000100000000";
  const result = preparePayload(payloadHex);

  test("Check variable values", () => {
    expect(result.type?.value).toBe("HeartbeatMessage");
    expect(result.batteryVoltage?.value).toBe(3.2);
    expect(result.batteryLevel?.value).toBe(11);
    expect(result.bleReceivingCount?.value).toBe(1);
    expect(result.gnssOnCount?.value).toBe(0);
    expect(result.temperature?.value).toBe("35°C");
    expect(result.movementDuration?.value).toBe(20);
    expect(result.messageId?.value).toBe(1);
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
