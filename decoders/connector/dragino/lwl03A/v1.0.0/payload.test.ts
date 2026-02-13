import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/dragino/lwl03A/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string, port: number) {
  let payload = [
    { variable: "payload", value: payloadHex },
    { variable: "fport", value: port },
  ];
  payload = decoderRun(file_path, { payload });

  const water_leak_status = payload.find((item) => item.variable === "water_leak_status");
  const water_leak_times = payload.find((item) => item.variable === "water_leak_times");
  const last_water_leak_duration = payload.find((item) => item.variable === "last_water_leak_duration");
  const tdc_interval = payload.find((item) => item.variable === "tdc_interval");
  const alarm = payload.find((item) => item.variable === "alarm");
  const time = payload.find((item) => item.variable === "time");
  const sensor_model = payload.find((item) => item.variable === "sensor_model");
  const firmware_version = payload.find((item) => item.variable === "firmware_version");
  const frequency_band = payload.find((item) => item.variable === "frequency_band");
  const sub_band = payload.find((item) => item.variable === "sub_band");
  const bat_v = payload.find((item) => item.variable === "bat_v");
  const datalog = payload.find((item) => item.variable === "datalog");
  const tdc = payload.find((item) => item.variable === "tdc");
  const disalarm = payload.find((item) => item.variable === "disalarm");
  const keep_status = payload.find((item) => item.variable === "keep_status");
  const keep_time = payload.find((item) => item.variable === "keep_time");
  const leak_alarm_time = payload.find((item) => item.variable === "leak_alarm_time");

  return {
    payload,
    water_leak_status,
    water_leak_times,
    last_water_leak_duration,
    tdc_interval,
    alarm,
    time,
    sensor_model,
    firmware_version,
    frequency_band,
    sub_band,
    bat_v,
    datalog,
    tdc,
    disalarm,
    keep_status,
    keep_time,
    leak_alarm_time,
  };
}

describe("LWL03A Port 2 - Sensor Data (No Leak)", () => {
  // 11 bytes: flags + leak_times(3) + duration(3) + timestamp(4)
  const payloadHex = "00000000000000678901BC";
  const port = 2;
  const result = preparePayload(payloadHex, port);

  test("Water leak status", () => {
    expect(result.water_leak_status?.value).toBe("NO LEAK");
  });

  test("Alarm", () => {
    expect(result.alarm?.value).toBe("FALSE");
  });

  test("TDC interval", () => {
    expect(result.tdc_interval?.value).toBe("NO");
  });

  test("Water leak times", () => {
    expect(result.water_leak_times?.value).toBe(0);
  });

  test("Time exists", () => {
    expect(result.time?.value).toBeDefined();
  });
});

describe("LWL03A Port 2 - Sensor Data (Leak Detected) - Wiki Example", () => {
  // From wiki: "01 00 00 0A 00 00 0A 63 5C D2 F2"
  // Status=0x01 (LEAK), leak_times=10, duration=10sec, timestamp=1667056370
  const payloadHex = "0100000A00000A635CD2F2";
  const port = 2;
  const result = preparePayload(payloadHex, port);

  test("Water leak status", () => {
    expect(result.water_leak_status?.value).toBe("LEAK");
  });

  test("Alarm", () => {
    expect(result.alarm?.value).toBe("FALSE");
  });

  test("TDC interval", () => {
    expect(result.tdc_interval?.value).toBe("NO");
  });

  test("Water leak times", () => {
    expect(result.water_leak_times?.value).toBe(10);
  });

  test("Last water leak duration", () => {
    expect(result.last_water_leak_duration?.value).toBe(10);
    expect(result.last_water_leak_duration?.unit).toBe("sec");
  });

  test("Time exists", () => {
    expect(result.time?.value).toBeDefined();
  });
});

describe("LWL03A Port 3 - Datalog - Wiki Example", () => {
  // From wiki: same format as port 2, can have multiple 11-byte entries
  const payloadHex = "0100000A00000A635CD2F2";
  const port = 3;
  const result = preparePayload(payloadHex, port);

  test("Sensor model", () => {
    expect(result.sensor_model?.value).toBe("LWL03A");
  });

  test("Datalog contains data", () => {
    expect(result.datalog?.value).toContain("[");
    expect(result.datalog?.value).toContain(",");
    expect(result.datalog?.value).toContain("]");
  });
});

describe("LWL03A Port 4 - Configuration", () => {
  // 8 bytes: tdc(3) + disalarm(1) + keep_status(1) + keep_time(2) + leak_alarm_time(1)
  const payloadHex = "02BF20010100783C";
  const port = 4;
  const result = preparePayload(payloadHex, port);

  test("Sensor model", () => {
    expect(result.sensor_model?.value).toBe("LWL03A");
  });

  test("TDC", () => {
    expect(result.tdc?.value).toBe(180000);
  });

  test("Disalarm", () => {
    expect(result.disalarm?.value).toBe(1);
  });

  test("Keep status", () => {
    expect(result.keep_status?.value).toBe(1);
  });

  test("Keep time", () => {
    expect(result.keep_time?.value).toBe(120);
  });

  test("Leak alarm time", () => {
    expect(result.leak_alarm_time?.value).toBe(60);
  });
});

describe("LWL03A Port 5 - Device Info", () => {
  const payloadHex = "14011001FF0D12";
  const port = 5;
  const result = preparePayload(payloadHex, port);

  test("Sensor model", () => {
    expect(result.sensor_model?.value).toBe("LWL03A");
  });

  test("Firmware version", () => {
    expect(result.firmware_version?.value).toBe("1.1.0");
  });

  test("Frequency band", () => {
    expect(result.frequency_band?.value).toBe("EU868");
  });

  test("Sub band", () => {
    expect(result.sub_band?.value).toBe("NULL");
  });

  test("Battery voltage", () => {
    expect(result.bat_v?.value).toBe(3.346);
    expect(result.bat_v?.unit).toBe("V");
  });
});

describe("LWL03A - Shall not be parsed", () => {
  let payload = [
    { variable: "shallnotpass", value: "04096113950292" },
    { variable: "fport", value: 99 },
  ];
  payload = decoderRun(file_path, { payload });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([
      { variable: "shallnotpass", value: "04096113950292" },
      { variable: "fport", value: 99 },
    ]);
  });
});
