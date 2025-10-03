/* eslint-disable unicorn/numeric-separators-style */
import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/netvox/r718pb15a/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex, port) {
  let payload = [
    { variable: "payload", value: payloadHex, unit: "" },
    { variable: "fport", value: port, unit: "" },
  ] as any;
  payload = decoderRun(file_path, { payload });

  const parse_error = payload.find((item) => item.variable === "parse_error");
  const battery = payload.find((item) => item.variable === "battery");
  const cmd = payload.find((item) => item.variable === "cmd");
  const status = payload.find((item) => item.variable === "status");
  const battery_voltage = payload.find((item) => item.variable === "battery_voltage");
  const soil_vwc = payload.find((item) => item.variable === "soil_vwc");
  const soil_temperature = payload.find((item) => item.variable === "soil_temperature");
  const water_level = payload.find((item) => item.variable === "water_level");
  const soil_ec = payload.find((item) => item.variable === "soil_ec");

  return {
    payload,
    battery,
    cmd,
    status,
    parse_error,
    battery_voltage,
    soil_vwc,
    soil_temperature,
    water_level,
    soil_ec,
  };
}

describe("Port 6, 0x01, unit tests", () => {
  const payloadHex = "01580A2406850A96FFFF01";
  const port = 6;
  const result = preparePayload(payloadHex, port);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  console.log(result.payload);

  /* 

  {
    variable: 'device_name',
    value: 'R718PB15A',
    group: '1759497957448-1ni',
    time: '2025-10-03T13:25:57.448Z'
  },
  {
    variable: 'battery_voltage',
    value: 3.6,
    unit: 'V',
    group: '1759497957448-1ni',
    time: '2025-10-03T13:25:57.448Z',
    metadata: { status: 'normal' }
  },
  {
    variable: 'soil_vwc',
    value: 16.69,
    unit: '%',
    group: '1759497957448-1ni',
    time: '2025-10-03T13:25:57.448Z'
  },
  {
    variable: 'soil_temperature',
    value: 27.1,
    unit: '°C',
    group: '1759497957448-1ni',
    time: '2025-10-03T13:25:57.448Z'
  },
  {
    variable: 'water_level',
    value: 65535,
    unit: 'mm',
    group: '1759497957448-1ni',
    time: '2025-10-03T13:25:57.448Z'
  },
  {
    variable: 'soil_ec',
    value: 0.1,
    unit: 'mS/cm',
    group: '1759497957448-1ni',
    time: '2025-10-03T13:25:57.448Z'
  }
    */

  test("Check variable values", () => {
    expect(result.battery_voltage?.value).toBe(3.6);
    expect(result.soil_vwc?.value).toBe(16.69);
    expect(result.soil_temperature?.value).toBe(27.1);
    expect(result.water_level?.value).toBe(65535);
    expect(result.soil_ec?.value).toBe(0.1);
  });
});

// describe("Port 6, 0x02, unit tests", () => {
//   const payloadHex = "014A022401010000000000";
//   const port = 6;
//   const result = preparePayload(payloadHex, port);

//   test("Output result is type: array", () => {
//     expect(Array.isArray(result.payload)).toBe(true);
//   });

//   test("Check variable values", () => {
//     expect(result.battery?.value).toBe(3.6);
//     expect(result.multiplier2?.value).toBe(1);
//     expect(result.multiplier3?.value).toBe(1);
//   });
// });

// describe("Port 7, 0x81, unit tests", () => {
//   const payloadHex = "81BB010000000000000000";
//   const port = 7;
//   const result = preparePayload(payloadHex, port);

//   test("Output Result", () => {
//     expect(Array.isArray(result.payload)).toBe(true);
//   });

//   test("results", () => {
//     expect(result.cmd?.value).toBe("config_report_rsp");
//     expect(result.status?.value).toBe("failure");
//   });
// });

// describe("Port 7, 0x82, unit tests", () => {
//   const payloadHex = "824A003C003C0064000000";
//   const port = 7;
//   const result = preparePayload(payloadHex, port);

//   test("Output Result", () => {
//     expect(Array.isArray(result.payload)).toBe(true);
//   });

//   test("results", () => {
//     expect(result.cmd?.value).toBe("read_config_report_rsp");
//     expect(result.min_time?.value).toBe(60);
//     expect(result.max_time?.value).toBe(60);
//     expect(result.current_change?.value).toBe(100);
//   });
// });
