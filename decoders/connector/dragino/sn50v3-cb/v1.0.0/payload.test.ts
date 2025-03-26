import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/dragino/sn50v3-cb/v1.0.0/payload.ts";

describe("Dragino SN50v3-CB Payload Decoder for MQTT", () => {
  let payload = [
    {
      "1": [0, 0, 1, -409.5, "2000/01/01 07:14:11"],
      "2": [0, 0, 1, -409.5, "2000/01/01 06:59:11"],
      "3": [0, 0, 2, -409.5, "2000/01/01 06:44:11"],
      "4": [0, 0, 1, -409.5, "2000/01/01 06:29:11"],
      "5": [0, 0, 2, -409.5, "2000/01/01 06:14:11"],
      "6": [0, 0, 1, -409.5, "2000/01/01 05:59:11"],
      "7": [0, 0, 1, -409.5, "2000/01/01 05:44:11"],
      "8": [0, 0, 1, -409.5, "2000/01/01 05:29:11"],
      IMEI: "111222333444555",
      IMSI: "123456789012345",
      Model: "SN50V3-NB",
      mod: 1,
      battery: 3.59,
      signal: 26,
      time: "2000/01/01 00:54:34",
      DS18B20_Temp: -409.5,
      digital_in: 0,
      interrupt: 0,
      interrupt_level: 0,
      adc1: 2,
      temperature: 0,
      humidity: 0,
      metadata: {
        mqtt_topic: "temperature",
      },
    },
  ];
  payload = decoderRun(file_path, { payload });

  console.log(payload);

  test("Output Result", () => {
    expect(payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "imei", value: "111222333444555" }),
        expect.objectContaining({ variable: "imsi", value: "123456789012345" }),
        expect.objectContaining({ variable: "model", value: "SN50V3-NB" }),
        expect.objectContaining({ variable: "mod", value: 1 }),
        expect.objectContaining({ variable: "battery", value: 3.59, unit: "mV" }),
        expect.objectContaining({ variable: "signal", value: 26, unit: "dBm" }),
        expect.objectContaining({ variable: "time", value: "2000/01/01 00:54:34" }),
        expect.objectContaining({ variable: "ds18b20_temp", value: -409.5, unit: "°C" }),
        expect.objectContaining({ variable: "digital_in", value: 0 }),
        expect.objectContaining({ variable: "interrupt", value: 0 }),
        expect.objectContaining({ variable: "interrupt_level", value: 0 }),
        expect.objectContaining({ variable: "adc1", value: 2 }),
        expect.objectContaining({ variable: "temperature", value: 0.0 }),
        expect.objectContaining({ variable: "humidity", value: 0.0 }),
        expect.objectContaining({ variable: "1", value: JSON.stringify([0.0, 0.0, 1, -409.5, "2000/01/01 07:14:11"]) }),
        expect.objectContaining({ variable: "2", value: JSON.stringify([0.0, 0.0, 1, -409.5, "2000/01/01 06:59:11"]) }),
        expect.objectContaining({ variable: "3", value: JSON.stringify([0.0, 0.0, 2, -409.5, "2000/01/01 06:44:11"]) }),
        expect.objectContaining({ variable: "4", value: JSON.stringify([0.0, 0.0, 1, -409.5, "2000/01/01 06:29:11"]) }),
        expect.objectContaining({ variable: "5", value: JSON.stringify([0.0, 0.0, 2, -409.5, "2000/01/01 06:14:11"]) }),
        expect.objectContaining({ variable: "6", value: JSON.stringify([0.0, 0.0, 1, -409.5, "2000/01/01 05:59:11"]) }),
        expect.objectContaining({ variable: "7", value: JSON.stringify([0.0, 0.0, 1, -409.5, "2000/01/01 05:44:11"]) }),
        expect.objectContaining({ variable: "8", value: JSON.stringify([0.0, 0.0, 1, -409.5, "2000/01/01 05:29:11"]) }),
        expect.objectContaining({ variable: "metadata", value: JSON.stringify({ mqtt_topic: "temperature" }) }),
      ])
    );
  });
});

describe("Dragino SN50v3-CB Payload Decoding for JSON", () => {
  let payload = [
    {
      variable: "payload_raw",
      value:
        '{"IMEI": "222333444555666","IMSI": "234567890123456","Model": "DTN-300-FSN7-DC","mod": 8,"battery": 3.60,"signal": 24,"time": "2025/03/15 16:55:01","adc2": 2,"DS18B20_Temp": -409.5,"interrupt": 0,"interrupt_level": 0,"interrupt_pa4": 0,"interrupt_level_pa4": 0,"interrupt_pa8": 0,"interrupt_level_pa8": 0}',
    },
  ];
  payload = decoderRun(file_path, { payload });

  test("Output Result", () => {
    expect(payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "imei", value: "222333444555666" }),
        expect.objectContaining({ variable: "imsi", value: "234567890123456" }),
        expect.objectContaining({ variable: "model", value: "DTN-300-FSN7-DC" }),
        expect.objectContaining({ variable: "mod", value: 8 }),
        expect.objectContaining({ variable: "battery", value: 3.6, unit: "mV" }),
        expect.objectContaining({ variable: "signal", value: 24, unit: "dBm" }),
        expect.objectContaining({ variable: "time", value: "2025/03/15 16:55:01" }),
        expect.objectContaining({ variable: "adc2", value: 2 }),
        expect.objectContaining({ variable: "ds18b20_temp", value: -409.5, unit: "°C" }),
        expect.objectContaining({ variable: "interrupt", value: 0 }),
        expect.objectContaining({ variable: "interrupt_level", value: 0 }),
        expect.objectContaining({ variable: "interrupt_pa4", value: 0 }),
        expect.objectContaining({ variable: "interrupt_level_pa4", value: 0 }),
        expect.objectContaining({ variable: "interrupt_pa8", value: 0 }),
        expect.objectContaining({ variable: "interrupt_level_pa8", value: 0 }),
      ])
    );
  });
});

describe("Dragino SN50v3-CB Payload Decoding for complex JSON with historical data", () => {
  let payload = [
    {
      variable: "payload_raw",
      value:
        '{"IMEI":"333444555666777","IMSI":"345678901234567","Model":"SN50V3-CB","mod":1,"battery":3.21,"signal":20,"time":"2024-12-09T09:35:21Z","latitude":0.000000,"longitude":0.000000,"gps_time":"1970-01-01T00:00:00Z","DS18B20_Temp":25.6,"digital_in":0,"interrupt":0,"interrupt_level":0,"adc1":0,"temperature":25.5,"humidity":51.8,"1":[24.4,52.3,0,25.0,"2024-12-09T09:17:50Z"],"2":[24.0,52.5,0,25.5,"2024-12-09T09:02:50Z"],"3":[23.8,53.1,1,25.8,"2024-12-09T08:47:50Z"],"4":[204.8,1.0,0,0.4,"2024-12-09T07:47:05Z"],"5":[204.8,1.0,0,0.4,"2024-12-09T07:32:05Z"],"6":[23.3,54.2,0,0.4,"2024-12-09T06:09:17Z"],"7":[23.1,53.9,0,0.4,"2024-12-09T05:54:17Z"],"8":[22.5,54.8,0,0.4,"2024-12-09T05:39:17Z"]}',
    },
  ];
  payload = decoderRun(file_path, { payload });

  test("Output Result", () => {
    expect(payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "imei", value: "333444555666777" }),
        expect.objectContaining({ variable: "imsi", value: "345678901234567" }),
        expect.objectContaining({ variable: "model", value: "SN50V3-CB" }),
        expect.objectContaining({ variable: "mod", value: 1 }),
        expect.objectContaining({ variable: "battery", value: 3.21, unit: "mV" }),
        expect.objectContaining({ variable: "signal", value: 20, unit: "dBm" }),
        expect.objectContaining({ variable: "time", value: "2024-12-09T09:35:21Z" }),
        expect.objectContaining({ variable: "latitude", value: 0.0 }),
        expect.objectContaining({ variable: "longitude", value: 0.0 }),
        expect.objectContaining({ variable: "gps_time", value: "1970-01-01T00:00:00Z" }),
        expect.objectContaining({ variable: "ds18b20_temp", value: 25.6, unit: "°C" }),
        expect.objectContaining({ variable: "digital_in", value: 0 }),
        expect.objectContaining({ variable: "interrupt", value: 0 }),
        expect.objectContaining({ variable: "interrupt_level", value: 0 }),
        expect.objectContaining({ variable: "adc1", value: 0 }),
        expect.objectContaining({ variable: "temperature", value: 25.5 }),
        expect.objectContaining({ variable: "humidity", value: 51.8 }),
        expect.objectContaining({ variable: "1", value: JSON.stringify([24.4, 52.3, 0, 25.0, "2024-12-09T09:17:50Z"]) }),
        expect.objectContaining({ variable: "2", value: JSON.stringify([24.0, 52.5, 0, 25.5, "2024-12-09T09:02:50Z"]) }),
        expect.objectContaining({ variable: "3", value: JSON.stringify([23.8, 53.1, 1, 25.8, "2024-12-09T08:47:50Z"]) }),
        expect.objectContaining({ variable: "4", value: JSON.stringify([204.8, 1.0, 0, 0.4, "2024-12-09T07:47:05Z"]) }),
        expect.objectContaining({ variable: "5", value: JSON.stringify([204.8, 1.0, 0, 0.4, "2024-12-09T07:32:05Z"]) }),
        expect.objectContaining({ variable: "6", value: JSON.stringify([23.3, 54.2, 0, 0.4, "2024-12-09T06:09:17Z"]) }),
        expect.objectContaining({ variable: "7", value: JSON.stringify([23.1, 53.9, 0, 0.4, "2024-12-09T05:54:17Z"]) }),
        expect.objectContaining({ variable: "8", value: JSON.stringify([22.5, 54.8, 0, 0.4, "2024-12-09T05:39:17Z"]) }),
      ])
    );
  });
});

describe("Dragino SN50v3-CB Payload Decoding for Hexadecimal", () => {
  let payload = [
    {
      variable: "payload_raw",
      value: "f444555666777888f4567890123456784c6e0cba16010104000000000100fe01fd6756bb09000000000000000000000000",
    },
  ];

  payload = decoderRun(file_path, { payload });

  test("Output Result", () => {
    expect(payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "device_id", value: "444555666777888" }),
        expect.objectContaining({ variable: "sim_card_id", value: "456789012345678" }),
        expect.objectContaining({ variable: "version", value: "SN50v3-CB, 76=1.1.0" }),
        expect.objectContaining({ variable: "battery", value: 3.258, unit: "V" }),
        expect.objectContaining({ variable: "signal", value: 22 }),
        expect.objectContaining({ variable: "model", value: 1 }),
        expect.objectContaining({ variable: "temperature", value: 26, unit: "°C" }),
        expect.objectContaining({ variable: "pa4_level", value: 0 }),
        expect.objectContaining({ variable: "interrupt", value: 0 }),
        expect.objectContaining({ variable: "interrupt_level", value: 0 }),
        expect.objectContaining({ variable: "adc", value: 1 }),
        expect.objectContaining({ variable: "temperature_sht", value: 25.4, unit: "°C" }),
        expect.objectContaining({ variable: "humidity_sht", value: 50.9, unit: "%rh" }),
        expect.objectContaining({ variable: "timestamp", value: "2024-12-09T09:40:25.000Z" }),
        expect.objectContaining({ variable: "latitude", value: null }),
        expect.objectContaining({ variable: "longitude", value: null }),
        expect.objectContaining({ variable: "gps_timestamp", value: null }),
      ])
    );
  });
});

describe("Dragino SN50v3-CB Payload Decoding for Hexadecimal with latitude/longitude/gps_timestamp", () => {
  let payload = [
    {
      variable: "payload_raw",
      value: "f555666777888999f4678901234567894c6e0cba16010104000000000100fe01fd6756bb09015a775a06CF35D66682595d",
    },
  ];

  payload = decoderRun(file_path, { payload });

  test("Output Result", () => {
    expect(payload).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "latitude", value: 22.70601 }),
        expect.objectContaining({ variable: "longitude", value: 114.24303 }),
        expect.objectContaining({ variable: "gps_timestamp", value: "2024-07-01T07:23:09.000Z" }),
      ])
    );
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
