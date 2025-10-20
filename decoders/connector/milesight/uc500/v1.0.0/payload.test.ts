/* eslint-disable unicorn/numeric-separators-style */
import { expect, describe, test } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/milesight/uc500/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex, unit: "" }];
  payload = decoderRun(file_path, { payload });
  const battery = payload.find((item) => item.variable === "battery");
  const gpio_input_1 = payload.find((item) => item.variable === "gpio_input_1");
  const gpio_counter_1 = payload.find((item) => item.variable === "gpio_counter_1");
  const analog_input_1 = payload.find((item) => item.variable === "analog_input_1");
  const analog_input_1_min = payload.find((item) => item.variable === "analog_input_1_min");
  const analog_input_1_max = payload.find((item) => item.variable === "analog_input_1_max");
  const analog_input_1_avg = payload.find((item) => item.variable === "analog_input_1_avg");
  const modbus_chn_3 = payload.find((item) => item.variable === "modbus_chn_3");
  const modbus_chn_1_alarm = payload.find((item) => item.variable === "modbus_chn_1_alarm");
  const sdi12_3 = payload.find((item) => item.variable === "sdi12_3");

  // Error parsing
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    battery,
    gpio_input_1,
    gpio_counter_1,
    analog_input_1,
    analog_input_1_min,
    analog_input_1_max,
    analog_input_1_avg,
    modbus_chn_3,
    modbus_chn_1_alarm,
    sdi12_3,
    payload,
    parse_error,
  };
}

describe("battery", () => {
  const payloadHex = "017564";
  const result = preparePayload(payloadHex);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.battery?.value).toBe(100);
  });
});

describe("gpio_input_1", () => {
  const payloadHex = "030001";
  const result = preparePayload(payloadHex);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.gpio_input_1?.value).toBe("on");
  });
});

describe("gpio_counter_1", () => {
  const payloadHex = "03C870170000";
  const result = preparePayload(payloadHex);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.gpio_counter_1?.value).toBe(6000);
  });
});

describe("adc", () => {
  const payloadHex = "0502983A000000000000";
  const result = preparePayload(payloadHex);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.analog_input_1?.value).toBe(15);
    expect(result.analog_input_1_min?.value).toBe(0);
    expect(result.analog_input_1_max?.value).toBe(0);
    expect(result.analog_input_1_avg?.value).toBe(0);
  });

  test("Check variable unit", () => {
    expect(result.analog_input_1?.unit).toBe("V");
    expect(result.analog_input_1_min?.unit).toBe("V");
    expect(result.analog_input_1_max?.unit).toBe("V");
    expect(result.analog_input_1_avg?.unit).toBe("V");
  });
});

describe("modbus_chn_3", () => {
  const payloadHex = "FF0E092610270000";
  const result = preparePayload(payloadHex);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.modbus_chn_3?.value).toBe(10000);
  });
});

describe("modbus_chn_1_alarm", () => {
  const payloadHex = "FF1507";
  const result = preparePayload(payloadHex);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.modbus_chn_1_alarm?.value).toBe("read error");
  });
});

describe("sdi12_3", () => {
  const payloadHex = "08DB02612B312E362B302B32352E370D0A00000000000000000000000000000000000000000000";
  const result = preparePayload(payloadHex);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.sdi12_3?.value).toBe("a+1.6+0+25.7\r\n");
  });
});

describe("Shall not be parsed", () => {
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
