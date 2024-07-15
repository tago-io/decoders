import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/lansitec/contact-tracing-badge/v1.0.1/payload.ts" as const;

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
  const revision = payload.find((item) => item.variable === "revision");
  const chgstate = payload.find((item) => item.variable === "chgstate");
  const crc = payload.find((item) => item.variable === "crc");
  const mode = payload.find((item) => item.variable === "mode");
  const buzzerAndvibrator = payload.find(
    (item) => item.variable === "buzzerAndvibrator"
  );
  const range = payload.find((item) => item.variable === "range");
  const BleTxPower = payload.find((item) => item.variable === "BleTxPower");
  const threshold = payload.find((item) => item.variable === "threshold");
  const friendnum = payload.find((item) => item.variable === "friendnum");

  return {
    type,
    ver,
    vol,
    rssi,
    snr,
    revision,
    chgstate,
    crc,
    mode,
    buzzerAndvibrator,
    range,
    BleTxPower,
    threshold,
    friendnum,
  };
}

describe("Contact tracing badge heartbeat unit tests", () => {
  const payloadHex = "215f0409c4010600000695";
  const result = preparePayload(payloadHex);

  test("Check variable values", () => {
    expect(result.type?.value).toBe("Heartbeat");
    expect(result.ver?.value).toBe(1);
    expect(result.vol?.value).toBe(95);
    expect(result.rssi?.value).toBe(4);
    expect(result.snr?.value).toBe(25);
    expect(result.revision?.value).toBe(1);
    expect(result.chgstate?.value).toBe("Charge completed");
    expect(result.crc?.value).toBe(0);
    expect(result.mode?.value).toBe("no action");
    expect(result.buzzerAndvibrator?.value).toBe(
      "vibrator enable and buzzer full"
    );
    expect(result.range?.value).toBe("-58dBm~-72dBm");
    expect(result.BleTxPower?.value).toBe(4);
    expect(result.threshold?.value).toBe(-77);
    expect(result.friendnum?.value).toBe(0);
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
