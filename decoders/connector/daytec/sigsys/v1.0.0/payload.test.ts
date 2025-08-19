import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/daytec/sigsys/v1.0.0/payload.ts" as const;

//TEST1 - Normal Expected String
function preparePayload(payloadstr: string) {
  let payload: {
    variable: string;
    value: string;
    metadata: {};
  }[] = [{ variable: "payload", value: payloadstr, metadata: {} }];
  payload = decoderRun(file_path, { payload });
  // decodeUplink variables
  const device_mode = payload.find((item) => item.variable === "device_mode");
  const device_update_tolerance = payload.find((item) => item.variable === "device_update_tolerance");
  const slot1_data_1 = payload.find((item) => item.variable === "slot1_data_1");
  const device_serial_number = payload.find((item) => item.variable === "device_serial_number");

  return {
    device_mode,
    device_update_tolerance,
    slot1_data_1,
    device_serial_number,
  };
}

describe("SigSys Input Test 1", () => {
  const payloadstr = "2,3,0,1,OFF,1,4,0,000000,000000,000000,000000,000000,000000,000000,000000,1,1,1,1,0.0762,OPN,3.9027,15,1.8,SS0001,-26.22951,28.13108";
  const result = preparePayload(payloadstr);

  test("Check variable values", () => {
    expect(result.device_mode?.value).toBe("M3-Power Cycle(Change)");
    expect(result.device_update_tolerance?.value).toBe("1");
    expect(result.slot1_data_1?.value).toBe("000000");
    expect(result.device_serial_number?.value).toBe("SS0001");
  });
});

//TEST2 - Normal Expected String
function preparePayload2(payloadstr: string) {
  let payload: {
    variable: string;
    value: string;
    metadata: {};
  }[] = [{ variable: "payload", value: payloadstr, metadata: {} }];
  payload = decoderRun(file_path, { payload });
  // decodeUplink variables
  const device_mode = payload.find((item) => item.variable === "device_mode");
  const device_update_tolerance = payload.find((item) => item.variable === "device_update_tolerance");
  const slot2_data_1 = payload.find((item) => item.variable === "slot2_data_1");
  const device_serial_number = payload.find((item) => item.variable === "device_serial_number");
  const device_gnss_setting = payload.find((item) => item.variable === "device_gnss_setting");
  const device_slot_1 = payload.find((item) => item.variable === "device_slot_1");
  const device_slot_2 = payload.find((item) => item.variable === "device_slot_2");
  return {
    device_mode,
    device_update_tolerance,
    slot2_data_1,
    device_serial_number,
    device_gnss_setting,
    device_slot_1,
    device_slot_2,
  };
}

describe("SigSys Input Test 2", () => {
  const payloadstr = "2,4,0,1,OFF,100,4,9,000000,000000,000000,000000,8888,000000,000000,000000,1,1,1,1,0.0762,OPN,3.9027,15,1.8,SS0005,-26.22951,28.13108";
  const result = preparePayload2(payloadstr);

  test("Check variable values", () => {
    expect(result.device_mode?.value).toBe("M4-Power Cycle(Time + Change)");
    expect(result.device_update_tolerance?.value).toBe("100");
    expect(result.slot2_data_1?.value).toBe("8888");
    expect(result.device_serial_number?.value).toBe("SS0005");
    expect(result.device_gnss_setting?.value).toBe("OFF");
    expect(result.device_slot_1?.value).toBe("EXP4-ANALOG PRO");
    expect(result.device_slot_2?.value).toBe("EXP9-RELAY");
  });
});

//TEST3 - Incorrect first Character
describe("Shall not be parsed", () => {
  let payload = [
    { variable: "payload", value: "0,3,0,1,OFF,1,4,0,000000,000000,000000,000000,000000,000000,000000,000000,1,1,1,1,0.0762,OPN,3.9027,15,1.8,SS0001,-26.22951,28.13108" },
  ];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "parse_error", value: "String Not Valid" }]);
  });
});

//TEST4 - Incorrect first Character
describe("Shall not be parsed", () => {
  let payload = [
    { variable: "payload", value: "0,3,0,1,OFF,1,4,0,000000,000000,000000,000000,000000,000000,000000,000000,1,1,1,1,0.0762,OPN,3.9027,15,1.8,SS0001,-26.22951,28.13108" },
  ];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "parse_error", value: "String Not Valid" }]);
  });
});

//TEST5 - Short string length
describe("Shall not be parsed", () => {
  let payload = [{ variable: "payload", value: "2,1,0,1,ON,1,4,0,,,,,,,,,,,,,,,3.8188,15,2.3,SS0007,-0.0,0.0" }];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "parse_error", value: "String Length Not Valid" }]);
  });
});

//TEST6 - Randon String
describe("Shall not be parsed", () => {
  let payload = [{ variable: "shallnotpass", value: "04096113950292" }];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "parse_error", value: "Payload Not Valid" }]);
  });
});
