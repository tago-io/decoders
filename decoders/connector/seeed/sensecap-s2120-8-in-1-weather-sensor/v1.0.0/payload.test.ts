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
