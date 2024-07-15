import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/lansitec/asset-management-tracker-5400mah/v1.0.1/payload.ts" as const;

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
  const ver = payload.find((item) => item.variable === "ver");
  const vol = payload.find((item) => item.variable === "vol");
  const rssi = payload.find((item) => item.variable === "rssi");
  const snr = payload.find((item) => item.variable === "snr");
  const gpsstate = payload.find((item) => item.variable === "gpsstate");
  const vibstate = payload.find((item) => item.variable === "vibstate");
  const chgstate = payload.find((item) => item.variable === "chgstate");
  const crc = payload.find((item) => item.variable === "crc");

  return {
    type,
    ver,
    vol,
    rssi,
    snr,
    gpsstate,
    vibstate,
    chgstate,
    crc,
  };
}

describe("Asset management tracker heartbeat unit tests", () => {
  const payloadHex = "215f5ff44810500000";
  const result = preparePayload(payloadHex);

  test("Check variable values", () => {
    expect(result.type?.value).toBe("Heartbeat");
    expect(result.ver?.value).toBe(1);
    expect(result.vol?.value).toBe(95);
    expect(result.rssi?.value).toBe(-95);
    expect(result.snr?.value).toBe(-30);
    expect(result.gpsstate?.value).toBe("boot GPS");
    expect(result.vibstate?.value).toBe(0);
    expect(result.chgstate?.value).toBe("power cable connected, charging");
    expect(result.crc?.value).toBe(0);
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
