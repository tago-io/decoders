import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/milesight/em300-cl/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex }];
  payload = decoderRun(file_path, { payload });

  const battery = payload.find((item) => item.variable === "battery");
  const liquid = payload.find((item) => item.variable === "liquid");
  const liquid_alarm = payload.find((item) => item.variable === "liquid_alarm");
  const calibration_result = payload.find((item) => item.variable === "calibration_result");
  const ipso_version = payload.find((item) => item.variable === "ipso_version");
  const hardware_version = payload.find((item) => item.variable === "hardware_version");
  const firmware_version = payload.find((item) => item.variable === "firmware_version");
  const tsl_version = payload.find((item) => item.variable === "tsl_version");
  const device_status = payload.find((item) => item.variable === "device_status");
  const lorawan_class = payload.find((item) => item.variable === "lorawan_class");
  const reset_event = payload.find((item) => item.variable === "reset_event");
  const sn = payload.find((item) => item.variable === "sn");

  return {
    payload,
    battery,
    liquid,
    liquid_alarm,
    calibration_result,
    ipso_version,
    hardware_version,
    firmware_version,
    tsl_version,
    device_status,
    lorawan_class,
    reset_event,
    sn,
  };
}

describe("EM300-CL - Battery and Liquid Uncalibrated", () => {
  // 017564 03ED00
  const payloadHex = "01756403ED00";
  const result = preparePayload(payloadHex);

  test("Battery", () => {
    expect(result.battery?.value).toBe(100);
  });

  test("Liquid uncalibrated", () => {
    expect(result.liquid?.value).toBe("uncalibrated");
  });
});

describe("EM300-CL - Liquid Full", () => {
  // 03ED01
  const payloadHex = "03ED01";
  const result = preparePayload(payloadHex);

  test("Liquid full", () => {
    expect(result.liquid?.value).toBe("full");
  });
});

describe("EM300-CL - Liquid Critical Alert", () => {
  // 03ED02
  const payloadHex = "03ED02";
  const result = preparePayload(payloadHex);

  test("Liquid critical alert", () => {
    expect(result.liquid?.value).toBe("critical liquid level alert");
  });
});

describe("EM300-CL - Liquid Error", () => {
  // 03EDFF
  const payloadHex = "03EDFF";
  const result = preparePayload(payloadHex);

  test("Liquid error", () => {
    expect(result.liquid?.value).toBe("error");
  });
});

describe("EM300-CL - Liquid Alarm Released", () => {
  // 83ED0100
  const payloadHex = "83ED0100";
  const result = preparePayload(payloadHex);

  test("Liquid full", () => {
    expect(result.liquid?.value).toBe("full");
  });

  test("Alarm released", () => {
    expect(result.liquid_alarm?.value).toBe("critical liquid level alarm release");
  });
});

describe("EM300-CL - Liquid Alarm Triggered", () => {
  // 83ED0201
  const payloadHex = "83ED0201";
  const result = preparePayload(payloadHex);

  test("Liquid critical alert", () => {
    expect(result.liquid?.value).toBe("critical liquid level alert");
  });

  test("Alarm triggered", () => {
    expect(result.liquid_alarm?.value).toBe("critical liquid level alarm");
  });
});

describe("EM300-CL - Calibration Success", () => {
  // 04EE01
  const payloadHex = "04EE01";
  const result = preparePayload(payloadHex);

  test("Calibration success", () => {
    expect(result.calibration_result?.value).toBe("success");
  });
});

describe("EM300-CL - Calibration Failed", () => {
  // 04EE00
  const payloadHex = "04EE00";
  const result = preparePayload(payloadHex);

  test("Calibration failed", () => {
    expect(result.calibration_result?.value).toBe("failed");
  });
});

describe("EM300-CL - Shall not be parsed", () => {
  let payload = [
    { variable: "shallnotpass", value: "04096113950292" },
    { variable: "fport", value: 9 },
  ];
  payload = decoderRun(file_path, { payload });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([
      { variable: "shallnotpass", value: "04096113950292" },
      { variable: "fport", value: 9 },
    ]);
  });
});
