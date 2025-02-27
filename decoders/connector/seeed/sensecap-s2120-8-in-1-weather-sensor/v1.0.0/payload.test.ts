import { readFileSync } from "fs";
import { join } from "path";
import * as ts from "typescript";
import { beforeEach, describe, expect, test } from "vitest";

import { DataToSend } from "@tago-io/sdk/lib/types";

const file = readFileSync(join(__dirname, "./payload.ts"), "utf8");
const transpiledCode = ts.transpile(file);

let payload: DataToSend[] = [];

describe("Normal TagoIO Format data, should pass normally", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Shall not be parsed", () => {
    payload = [{ variable: "shallnotpass", value: "invalid_payload" }];

    expect(payload).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "shallnotpass", value: "invalid_payload" })]));
  });
});

describe("Payload Validation", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Uplink", () => {
    payload = [
      {
        variable: "payload",
        value: "4a00364c000012f80000084b00ea0000000027c74c000a00000000",
      },
      { variable: "port", value: 3, group: "1739373742546" },
    ];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "4a00364c000012f80000084b00ea0000000027c74c000a00000000" }),
        expect.objectContaining({ variable: "port", value: 3 }),
        expect.objectContaining({ variable: "air_temperature", value: 5.4 }),
        expect.objectContaining({ variable: "air_humidity", value: 76 }),
        expect.objectContaining({ variable: "light_intensity", value: 4856 }),
        expect.objectContaining({ variable: "uv_index", value: 0 }),
        expect.objectContaining({ variable: "wind_speed", value: 0.8 }),
        expect.objectContaining({ variable: "wind_direction_sensor", value: 234 }),
        expect.objectContaining({ variable: "rain_gauge", value: 0 }),
        expect.objectContaining({ variable: "barometric_pressure", value: 101830 }),
        expect.objectContaining({ variable: "_peak_wind_gust", value: 1 }),
        expect.objectContaining({ variable: "rain_accumulation", value: 0 }),
      ])
    );
  });
});

describe("Payload Validation", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Uplink", () => {
    payload = [
      {
        variable: "metadata",
        metadata: {
          adr_allowed: false,
          cf_list_enabled: false,
          multi_buy: 1,
          organization_id: "11111111111111111111111111",
          preferred_hotspots: [],
          rx_delay: 1,
          rx_delay_actual: 1,
          rx_delay_state: "rx_delay_established",
        },
        group: "1740592361707",
      },
      { variable: "dc_balance", value: 111111, group: "1740592361707" },
      { variable: "dc_nonce", value: 1, group: "1740592361707" },
      { variable: "hotspot_0_channel", value: 1, group: "1740592361707" },
      { variable: "hotspot_0_frequency", value: 111, group: "1740592361707" },
      { variable: "hotspot_0_id", value: "112bBU5niCQiadzc5xsHsvMPXxec9e7edLcEEDX6J3JJF1ktc5BC", group: "1740592361707" },
      { variable: "hotspot_0_location", location: { lat: 51.0981283544156, lng: -4.153831860190878 }, group: "1740592361707" },
      { variable: "hotspot_0_name", value: "huge-navy-orangutan", group: "1740592361707" },
      { variable: "hotspot_0_reported_at", value: 1740592361222, group: "1740592361707" },
      { variable: "hotspot_0_rssi", value: -11, group: "1740592361707" },
      { variable: "hotspot_0_snr", value: 1, group: "1740592361707" },
      { variable: "hotspot_0_spreading", value: "111111", group: "1740592361707" },
      { variable: "hotspot_0_status", value: "success", group: "1740592361707" },
      { variable: "hotspot_0_hold_time", value: 1, group: "1740592361707" },
      { variable: "app_eui", value: "1111111111111", group: "1740592361707" },
      { variable: "devaddr", value: "48000999", group: "1740592361707" },
      {
        variable: "downlink_url",
        value: "https://console.helium.com/api/v1/down/11111111111111111111111",
        group: "1740592361707",
      },
      { variable: "fcnt", value: 4, group: "1740592361707" },
      { variable: "name", value: "Weather statiXX", group: "1740592361707" },
      { variable: "payload", value: "4a004b510000011c0000184b01020000000027914c001c000005f4", group: "1740592361707" },
      { variable: "port", value: 3, group: "1740592361707" },
      { variable: "reported_at", value: 1740592362222, group: "1740592361707" },
      { variable: "dev_eui", value: "2CF7F1C0443XXXXX", group: "1740592361707" },
      { variable: "raw_packet", value: "ABCAAEiABAADuiaeSZE1aqJfUsWHZ3GfVDF3B/ye/FwjSSketOMikg==", group: "1740592361707" },
      { variable: "replay", value: false, group: "1740592361707" },
      { variable: "type", value: "uplink", group: "1740592361707" },
    ];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "4a004b510000011c0000184b01020000000027914c001c000005f4", group: "1740592361707" }),
        expect.objectContaining({ variable: "port", value: 3, group: "1740592361707" }),
        expect.objectContaining({ variable: "air_temperature", value: 7.5, group: "1740592361707" }),
        expect.objectContaining({ variable: "air_humidity", value: 81, group: "1740592361707" }),
        expect.objectContaining({ variable: "light_intensity", value: 284, group: "1740592361707" }),
        expect.objectContaining({ variable: "uv_index", value: 0, group: "1740592361707" }),
        expect.objectContaining({ variable: "wind_speed", value: 2.4, group: "1740592361707" }),
        expect.objectContaining({ variable: "wind_direction_sensor", value: 258, group: "1740592361707" }),
        expect.objectContaining({ variable: "rain_gauge", value: 0, group: "1740592361707" }),
        expect.objectContaining({ variable: "barometric_pressure", value: 101290, group: "1740592361707" }),
        expect.objectContaining({ variable: "_peak_wind_gust", value: 2.8, group: "1740592361707" }),
        expect.objectContaining({ variable: "rain_accumulation", value: 1.524, group: "1740592361707" }),
      ])
    );
  });
});
