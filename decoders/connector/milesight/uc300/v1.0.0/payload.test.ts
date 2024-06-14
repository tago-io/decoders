import { describe, test, it, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/milesight/uc300/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex, unit: "", metadata: {} }];
  payload = decoderRun(file_path, { payload });
  const counter = payload.find((item) => item.variable === "counter");
  const gpio_in = payload.find((item) => item.variable === "gpio_in");
  const gpio_out = payload.find((item) => item.variable === "gpio_out");
  const adc = payload.find((item) => item.variable === "adc");
  const adv = payload.find((item) => item.variable === "adv");
  const pt100 = payload.find((item) => item.variable === "pt100");
  const adc_1 = payload.find((item) => item.variable === "adc_1");
  const adc_2 = payload.find((item) => item.variable === "adc_2");
  const adv_1 = payload.find((item) => item.variable === "adv_1");
  const adv_2 = payload.find((item) => item.variable === "adv_2");
  const modbus = payload.find((item) => item.variable === "modbus");
  // Error parsing
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    counter,
    gpio_in,
    gpio_out,
    adc,
    adv,
    pt100,
    adc_1,
    adc_2,
    adv_1,
    adv_2,
    modbus,
    parse_error,
  };
}

describe("Unit test ", () => {
  it("should decode the payload correctly", () => {
    const payloadHex = "03C80A00000004C814000000050000060000070101080101";
    const result = preparePayload(payloadHex);

    expect(result.counter?.value).toBe("true");
    expect(result.counter?.metadata).toEqual({ "1": 10, "2": 20 });
    expect(result.gpio_in?.value).toBe("true");
    expect(result.gpio_in?.metadata).toEqual({ "3": "off", "4": "off" });
    expect(result.gpio_out?.value).toBe("true");
    expect(result.gpio_out?.metadata).toEqual({ "1": "on", "2": "on" });
  });

  it("should decode the payload correctly", () => {
    const payloadHex = "0B02900100000C0290010000";
    const result = preparePayload(payloadHex);

    expect(result.adc?.value).toBe("true");
    expect(result.adc?.metadata).toEqual({ "1": 4, "2": 4 });
  });

  it("should decode the payload correctly", () => {
    const payloadHex = "0D02480100000E0249010000";
    const result = preparePayload(payloadHex);

    expect(result.adv?.value).toBe("true");
    expect(result.adv?.metadata).toEqual({ "1": 3.28, "2": 3.29 });
  });

  it("should decode the payload correctly", () => {
    const payloadHex = "096702010A670201";
    const result = preparePayload(payloadHex);

    expect(result.pt100?.value).toBe("true");
    expect(result.pt100?.metadata).toEqual({ "1": 25.8, "2": 25.8 });
  });

  it("should decode the payload correctly", () => {
    const payloadHex = "0BE200440044004400440CE20044004400440044";
    const result = preparePayload(payloadHex);

    expect(result.adc_1?.value).toBe(4);
    expect(result.adc_1?.metadata).toEqual({ avg: 4, max: 4, min: 4 });
    expect(result.adc_2?.value).toBe(4);
    expect(result.adc_2?.metadata).toEqual({ avg: 4, max: 4, min: 4 });
  });

  it("should decode the payload correctly", () => {
    const payloadHex = "0DE28F425C428F428D420EE29442664294429342";
    const result = preparePayload(payloadHex);

    expect(result.adv_1?.value).toBe(3.28);
    expect(result.adv_1?.metadata).toEqual({ avg: 3.28, max: 3.18, min: 3.28 });
    expect(result.adv_2?.value).toBe(3.29);
    expect(result.adv_2?.metadata).toEqual({ avg: 3.29, max: 3.2, min: 3.29 });
  });

  it("should decode the payload correctly", () => {
    const payloadHex =
      "ff190002020b00ff190102020200ff190202020d00ff190302026100ff190402023900ff190502023700ff190602022400ff190702021900ff190802022500ff190902023600ff190a02021700ff190b02021c00ff190c02022400ff190d02022700ff190e02022d00ff190f02022f00ff191002020b00ff191102022500ff191202024000ff191302024300ff191402024700ff191502024d00ff191602025000ff191702025600ff191802025900ff191902025d00ff191a02026000ff191b02022d00ff191c02028d00ff191d02021200ff191e02021800ff191f02020900";
    const result = preparePayload(payloadHex);

    expect(result.modbus?.value).toBe("true");
    expect(result.modbus?.metadata).toEqual({
      "1": 11,
      "2": 2,
      "3": 13,
      "4": 97,
      "5": 57,
      "6": 55,
      "7": 36,
      "8": 25,
      "9": 37,
      "10": 54,
      "11": 23,
      "12": 28,
      "13": 36,
      "14": 39,
      "15": 45,
      "16": 47,
      "17": 11,
      "18": 37,
      "19": 64,
      "20": 67,
      "21": 71,
      "22": 77,
      "23": 80,
      "24": 86,
      "25": 89,
      "26": 93,
      "27": 96,
      "28": 45,
      "29": 141,
      "30": 18,
      "31": 24,
      "32": 9,
    });
  });
});

describe("Shall not be parsed", () => {
  let payload = [{ variable: "shallnotpass", value: "04096113950292" }];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "shallnotpass", value: "04096113950292" }]);
  });
});
