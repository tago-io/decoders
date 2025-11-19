import { describe, test, expect, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DataToSend } from "@tago-io/sdk/lib/types";
import * as ts from "typescript";

const file = readFileSync(join(__dirname, "./payload.ts"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

describe("Blecon Payload Validation", () => {
  beforeEach(() => {
    payload = [
      {
        time: "2025-10-08T15:22:45.315Z",
        value:
          "bf66757074696d6519028a6762617474657279190b10666576656e74739fbf626964056474696d65c11a68e680ce6474797065781b74656d70657261747572655f68756d69646974795f7570646174656b74656d7065726174757265f94e476868756d6964697479f9517affbf626964066474696d65c11a68e6810a6474797065781b74656d70657261747572655f68756d69646974795f7570646174656b74656d7065726174757265f94e476868756d6964697479f95184ffbf626964076474696d65c11a68e681466474797065781b74656d70657261747572655f68756d69646974795f7570646174656b74656d7065726174757265f94e466868756d6964697479f9517bffbf626964086474696d65c11a68e681826474797065781b74656d70657261747572655f68756d69646974795f7570646174656b74656d7065726174757265f94e466868756d6964697479f9517bffbf626964096474696d65c11a68e681be6474797065781b74656d70657261747572655f68756d69646974795f7570646174656b74656d7065726174757265f94e456868756d6964697479f9517bffffff",
        variable: "payload",
        location: {
          type: "Point",
          coordinates: [0.1296013, 52.234879],
        },
        metadata: {
          converted_payload: {
            uptime: 650,
            battery: 2832,
            events: [
              {
                id: 5,
                time: "2025-10-08T15:18:38+00:00",
                type: "temperature_humidity_update",
                temperature: 25.109375,
                humidity: 43.8125,
              },
              {
                id: 6,
                time: "2025-10-08T15:19:38+00:00",
                type: "temperature_humidity_update",
                temperature: 25.109375,
                humidity: 44.125,
              },
              {
                id: 7,
                time: "2025-10-08T15:20:38+00:00",
                type: "temperature_humidity_update",
                temperature: 25.09375,
                humidity: 43.84375,
              },
              {
                id: 8,
                time: "2025-10-08T15:21:38+00:00",
                type: "temperature_humidity_update",
                temperature: 25.09375,
                humidity: 43.84375,
              },
              {
                id: 9,
                time: "2025-10-08T15:22:38+00:00",
                type: "temperature_humidity_update",
                temperature: 25.078125,
                humidity: 43.84375,
              },
            ],
          },
        },
      },
    ];
  });

  test("Check all output variables for acceleration", () => {
    const result = eval(transpiledCode);

    expect(result).toEqual([
      { location: { lat: 52.234879, lng: 0.1296013 }, time: "2025-10-08T15:22:45.315Z", value: 650, variable: "uptime" },
      { location: { lat: 52.234879, lng: 0.1296013 }, time: "2025-10-08T15:22:45.315Z", value: 2832, variable: "battery" },
      { location: { lat: 52.234879, lng: 0.1296013 }, metadata: { index: 0 }, time: "2025-10-08T15:18:38+00:00", value: 25.109375, variable: "temperature" },
      { location: { lat: 52.234879, lng: 0.1296013 }, metadata: { index: 0 }, time: "2025-10-08T15:18:38+00:00", value: 43.8125, variable: "humidity" },
      { location: { lat: 52.234879, lng: 0.1296013 }, metadata: { index: 1 }, time: "2025-10-08T15:19:38+00:00", value: 25.109375, variable: "temperature" },
      { location: { lat: 52.234879, lng: 0.1296013 }, metadata: { index: 1 }, time: "2025-10-08T15:19:38+00:00", value: 44.125, variable: "humidity" },
      { location: { lat: 52.234879, lng: 0.1296013 }, metadata: { index: 2 }, time: "2025-10-08T15:20:38+00:00", value: 25.09375, variable: "temperature" },
      { location: { lat: 52.234879, lng: 0.1296013 }, metadata: { index: 2 }, time: "2025-10-08T15:20:38+00:00", value: 43.84375, variable: "humidity" },
      { location: { lat: 52.234879, lng: 0.1296013 }, metadata: { index: 3 }, time: "2025-10-08T15:21:38+00:00", value: 25.09375, variable: "temperature" },
      { location: { lat: 52.234879, lng: 0.1296013 }, metadata: { index: 3 }, time: "2025-10-08T15:21:38+00:00", value: 43.84375, variable: "humidity" },
      { location: { lat: 52.234879, lng: 0.1296013 }, metadata: { index: 4 }, time: "2025-10-08T15:22:38+00:00", value: 25.078125, variable: "temperature" },
      { location: { lat: 52.234879, lng: 0.1296013 }, metadata: { index: 4 }, time: "2025-10-08T15:22:38+00:00", value: 43.84375, variable: "humidity" },
    ]);
  });
});
