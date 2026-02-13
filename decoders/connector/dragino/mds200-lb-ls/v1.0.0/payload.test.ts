import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/dragino/mds200-lb-ls/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string, port: number) {
  let payload = [
    { variable: "payload", value: payloadHex },
    { variable: "FPort", value: port },
  ];
  payload = decoderRun(file_path, { payload });

  const bat_v = payload.find((item) => item.variable === "bat_v");
  const distance_1 = payload.find((item) => item.variable === "distance_1");
  const distance_2 = payload.find((item) => item.variable === "distance_2");
  const dalarm_count = payload.find((item) => item.variable === "dalarm_count");
  const distance_alarm = payload.find((item) => item.variable === "distance_alarm");
  const interrupt_alarm = payload.find((item) => item.variable === "interrupt_alarm");
  const sensor_model = payload.find((item) => item.variable === "sensor_model");
  const firmware_version = payload.find((item) => item.variable === "firmware_version");
  const frequency_band = payload.find((item) => item.variable === "frequency_band");
  const sub_band = payload.find((item) => item.variable === "sub_band");
  const tdc = payload.find((item) => item.variable === "tdc");
  const atdc = payload.find((item) => item.variable === "atdc");
  const alarm_min = payload.find((item) => item.variable === "alarm_min");
  const alarm_max = payload.find((item) => item.variable === "alarm_max");
  const pnackmd = payload.find((item) => item.variable === "pnackmd");
  const datalog = payload.find((item) => item.variable === "datalog");

  return {
    payload,
    bat_v,
    distance_1,
    distance_2,
    dalarm_count,
    distance_alarm,
    interrupt_alarm,
    sensor_model,
    firmware_version,
    frequency_band,
    sub_band,
    tdc,
    atdc,
    alarm_min,
    alarm_max,
    pnackmd,
    datalog,
  };
}

describe("MDS200-LB/LS Port 2 - Sensor Data Test 1", () => {
  const payloadHex = "0D00007300A44E";
  const port = 2;
  const result = preparePayload(payloadHex, port);

  test("Battery voltage", () => {
    expect(result.bat_v?.value).toBe(3.328);
  });

  test("Distance 1", () => {
    expect(result.distance_1?.value).toBe(115);
  });

  test("Distance 2", () => {
    expect(result.distance_2?.value).toBe(164);
  });

  test("Dalarm count", () => {
    expect(result.dalarm_count?.value).toBe(19);
  });

  test("Distance alarm", () => {
    expect(result.distance_alarm?.value).toBe(1);
  });

  test("Interrupt alarm", () => {
    expect(result.interrupt_alarm?.value).toBe(0);
  });
});

describe("MDS200-LB/LS Port 2 - Sensor Data Test 2", () => {
  const payloadHex = "0D00007300A44A";
  const port = 2;
  const result = preparePayload(payloadHex, port);

  test("Battery voltage", () => {
    expect(result.bat_v?.value).toBe(3.328);
  });

  test("Distance 1", () => {
    expect(result.distance_1?.value).toBe(115);
  });

  test("Distance 2", () => {
    expect(result.distance_2?.value).toBe(164);
  });

  test("Dalarm count", () => {
    expect(result.dalarm_count?.value).toBe(18);
  });

  test("Distance alarm", () => {
    expect(result.distance_alarm?.value).toBe(1);
  });

  test("Interrupt alarm", () => {
    expect(result.interrupt_alarm?.value).toBe(0);
  });
});

describe("MDS200-LB/LS Port 2 - Sensor Data Test 3", () => {
  const payloadHex = "0D02007300A446";
  const port = 2;
  const result = preparePayload(payloadHex, port);

  test("Battery voltage", () => {
    expect(result.bat_v?.value).toBe(3.33);
  });

  test("Distance 1", () => {
    expect(result.distance_1?.value).toBe(115);
  });

  test("Distance 2", () => {
    expect(result.distance_2?.value).toBe(164);
  });

  test("Dalarm count", () => {
    expect(result.dalarm_count?.value).toBe(17);
  });

  test("Distance alarm", () => {
    expect(result.distance_alarm?.value).toBe(1);
  });

  test("Interrupt alarm", () => {
    expect(result.interrupt_alarm?.value).toBe(0);
  });
});

describe("MDS200-LB/LS Port 3 - Datalog", () => {
  // Simulated 11-byte datalog entry
  const payloadHex = "0D00007300A44E67890ABC";
  const port = 3;
  const result = preparePayload(payloadHex, port);

  test("Pnackmd flag", () => {
    expect(result.pnackmd?.value).toBe("False");
  });

  test("Datalog contains data", () => {
    expect(result.datalog?.value).toContain("[");
    expect(result.datalog?.value).toContain(",");
    expect(result.datalog?.value).toContain("]");
  });
});

describe("MDS200-LB/LS Port 4 - Configuration", () => {
  const payloadHex = "02BF200100000064";
  const port = 4;
  const result = preparePayload(payloadHex, port);

  test("TDC", () => {
    expect(result.tdc?.value).toBe(180000);
  });

  test("ATDC", () => {
    expect(result.atdc?.value).toBe(1);
  });

  test("Alarm min", () => {
    expect(result.alarm_min?.value).toBe(0);
  });

  test("Alarm max", () => {
    expect(result.alarm_max?.value).toBe(100);
  });
});

describe("MDS200-LB/LS Port 5 - Device Info", () => {
  const payloadHex = "2B011001000CD3";
  const port = 5;
  const result = preparePayload(payloadHex, port);

  test("Sensor model", () => {
    expect(result.sensor_model?.value).toBe("MDS200-LB");
  });

  test("Firmware version", () => {
    expect(result.firmware_version?.value).toBe(110);
  });

  test("Frequency band", () => {
    expect(result.frequency_band?.value).toBe("EU868");
  });

  test("Sub band", () => {
    expect(result.sub_band?.value).toBe(0);
  });

  test("Battery voltage", () => {
    expect(result.bat_v?.value).toBe(3.283);
  });
});

describe("MDS200-LB/LS - Shall not be parsed", () => {
  let payload = [
    { variable: "shallnotpass", value: "04096113950292" },
    { variable: "FPort", value: 9 },
  ];
  payload = decoderRun(file_path, { payload });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([
      { variable: "shallnotpass", value: "04096113950292" },
      { variable: "FPort", value: 9 },
    ]);
  });
});
