import { describe, expect, test } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/lansitec/wifi-indoor-bluetooth-gateway/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload: {
    variable: string;
    value: string;
    unit?: string;
    metadata?: {};
  }[] = [{ variable: "payload", value: payloadHex }];

  payload = decoderRun(file_path, { payload });

  const type = payload.find((item) => item.variable === "type");
  const messageType = payload.find((item) => item.variable === "messageType");
  const deviceTypeId = payload.find((item) => item.variable === "deviceTypeId");
  const number = payload.find((item) => item.variable === "number");

  const data1 = payload.find((item) => item.variable === "data1");
  const rssi1 = payload.find((item) => item.variable === "rssi1");
  const data2 = payload.find((item) => item.variable === "data2");
  const rssi2 = payload.find((item) => item.variable === "rssi2");
  const data3 = payload.find((item) => item.variable === "data3");
  const rssi3 = payload.find((item) => item.variable === "rssi3");

  return {
    payload,
    type,
    messageType,
    deviceTypeId,
    number,
    data1,
    rssi1,
    data2,
    rssi2,
    data3,
    rssi3,
  };
}

describe("Bluetooth device message unit tests", () => {
  const payloadHex = "7103061A4C000215AABBB3061A4C000215AABCB4061A4C000215AABDB5";

  const result = preparePayload(payloadHex);

  test("Check variable values", () => {
    expect(result.type?.value).toBe("BluetoothDeviceMessage");
    expect(result.messageType?.value).toBe("0x7");
    expect(result.deviceTypeId?.value).toBe(1);
    expect(result.number?.value).toBe(3);

    expect(result.data1?.value).toBe("061A4C000215AABB");
    expect(result.rssi1?.value).toBe("-77dBm");

    expect(result.data2?.value).toBe("061A4C000215AABC");
    expect(result.rssi2?.value).toBe("-76dBm");

    expect(result.data3?.value).toBe("061A4C000215AABD");
    expect(result.rssi3?.value).toBe("-75dBm");
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
