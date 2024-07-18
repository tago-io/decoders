import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/lansitec/precision-platinum-sensor/v1.0.0/payload.ts" as const;

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
  const number = payload.find((item) => item.variable === "number");
  const battery = payload.find((item) => item.variable === "battery");
  const rssi = payload.find((item) => item.variable === "rssi");
  const temp1 = payload.find((item) => item.variable === "temp1");
  const crc = payload.find((item) => item.variable === "crc");

  return {
    type,
    number,
    battery,
    rssi,
    temp1,
    crc,
  };
}

describe("Periodical temperature and humidity unit tests", () => {
  const payloadHex = "31645007d00000";
  const result = preparePayload(payloadHex);

  test("Check variable values", () => {
    expect(result.type?.value).toBe("Temperature");
    expect(result.number?.value).toBe(1);
    expect(result.battery?.value).toBe(100);
    expect(result.rssi?.value).toBe(-80);
    expect(result.temp1?.value).toBe("20℃");
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
