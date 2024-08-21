import { describe, test, expect, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DataToSend } from "@tago-io/sdk/lib/types";
import * as ts from "typescript";

const file = readFileSync(join(__dirname, "./payload.ts"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

describe("SmartOne C Payload Validation", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Check all output variables", () => {
    payload = [{ variable: "globalstar_payload", value: "002B5372BFF12F0A02", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "globalstar_payload", value: "002B5372BFF12F0A02", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "battery_state", value: "Good" }),
        expect.objectContaining({ variable: "gps_data_valid", value: "Valid" }),
        expect.objectContaining({ variable: "missed_input_1", value: 0 }),
        expect.objectContaining({ variable: "missed_input_2", value: 0 }),
        expect.objectContaining({ variable: "gps_fail_counter", value: 0 }),
        expect.objectContaining({
          variable: "location",
          value: "30.46356439590454,-90.0813889503479",
          location: { type: "Point", coordinates: [-90.0813889503479, 30.46356439590454] },
        }),
        expect.objectContaining({ variable: "message_type", value: "Location Message" }),
      ])
    );
  });

  test("Check all output variables - location", () => {
    payload = [{ variable: "globalstar_payload", value: "C02B5387BFF129090C", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "globalstar_payload", value: "C02B5387BFF129090C", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "battery_state", value: "Good" }),
        expect.objectContaining({ variable: "gps_data_valid", value: "Valid" }),
        expect.objectContaining({ variable: "missed_input_1", value: 0 }),
        expect.objectContaining({ variable: "missed_input_2", value: 0 }),
        expect.objectContaining({ variable: "gps_fail_counter", value: 3 }),
        expect.objectContaining({
          variable: "location",
          value: "30.463789701461792,-90.08151769638062",
          location: { type: "Point", coordinates: [-90.08151769638062, 30.463789701461792] },
        }),
        expect.objectContaining({ variable: "message_type", value: "Location Message" }),
      ])
    );
  });

  test("Shall not be parsed", () => {
    payload = [{ variable: "shallnotpass", value: "invalid_payload" }];
    const result = eval(transpiledCode);

    expect(result).toEqual(undefined);
  });

  test("Invalid Payload", () => {
    payload = [{ variable: "payload", value: "invalid_payload", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual([{ variable: "parse_error", value: "Invalid payload size" }]);
  });
});
