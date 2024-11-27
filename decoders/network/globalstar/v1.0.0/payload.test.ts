import { describe, test, expect, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DataToSend } from "@tago-io/sdk/lib/types";
import * as ts from "typescript";

const file = readFileSync(join(__dirname, "./payload.ts"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

describe("Globalstar Payload Validation", () => {
  beforeEach(() => {
    payload = [
      {
        variable: "globalstar_payload",
        value:
          '[{"bn":"urn:dev:DVNUUID:737b588b-547e-45d3-96d0-f79723291bf1:","bt":1713193637,"n":"battery","u":"%","vs":"32.0"},{"n":"accelerationX","u":"m/s2","v":0.39},{"n":"accelerationY","u":"m/s2","v":3.64},{"n":"accelerationZ","u":"m/s2","v":9.46},{"n":"latitude","u":"lat","v":51.90725},{"n":"longitude","u":"lon","v":4.48934}]',
        unit: "",
        metadata: {},
      },
    ];
  });

  test("Check all output variables for acceleration", () => {
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "battery", value: "32.0", unit: "%", time: new Date(1713193637 * 1000) }),
        expect.objectContaining({ variable: "accelerationX", value: 0.39, unit: "m/s2", time: new Date(1713193637 * 1000) }),
        expect.objectContaining({ variable: "accelerationY", value: 3.64, unit: "m/s2", time: new Date(1713193637 * 1000) }),
        expect.objectContaining({ variable: "accelerationZ", value: 9.46, unit: "m/s2", time: new Date(1713193637 * 1000) }),
        expect.objectContaining({ variable: "latitude", value: 51.90725, unit: "lat", time: new Date(1713193637 * 1000) }),
        expect.objectContaining({ variable: "longitude", value: 4.48934, unit: "lon", time: new Date(1713193637 * 1000) }),
      ])
    );
  });
});
