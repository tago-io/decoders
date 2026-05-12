import { describe, expect, test } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/lansitec/cat1-compact-bluetooth-gateway/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload: {
    variable: string;
    value: string;
    unit: string;
    metadata: {};
  }[] = [{ variable: "payload", value: payloadHex, unit: "", metadata: {} }];

  payload = decoderRun(file_path, { payload });

  const type = payload.find((item) => item.variable === "type");
  const beaconType = payload.find((item) => item.variable === "beaconType");
  const beaconCount = payload.find((item) => item.variable === "beaconCount");
  const beacon1 = payload.find((item) => item.variable === "beacon1");
  const rssi1 = payload.find((item) => item.variable === "rssi1");
  const beacon2 = payload.find((item) => item.variable === "beacon2");
  const rssi2 = payload.find((item) => item.variable === "rssi2");

  return {
    type,
    beaconType,
    beaconCount,
    beacon1,
    rssi1,
    beacon2,
    rssi2,
  };
}

describe("Beacon unit tests", () => {
  const payloadHex = "4002002E00129E002F00138F0000000000";
  const result = preparePayload(payloadHex);

  test("Check variable values", () => {
    expect(result.type?.value).toBe("BeaconMessage");
    expect(result.beaconType?.value).toBe("PositioningBeacon");
    expect(result.beaconCount?.value).toBe(2);
    expect(result.beacon1?.value).toBe("002E0012");
    expect(result.rssi1?.value).toBe("-98dBm");
    expect(result.beacon2?.value).toBe("002F0013");
    expect(result.rssi2?.value).toBe("-113dBm");
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
