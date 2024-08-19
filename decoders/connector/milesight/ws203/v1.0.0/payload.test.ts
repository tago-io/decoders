import { describe, test, expect, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DataToSend } from "@tago-io/sdk/lib/types";
import * as ts from "typescript";

const file = readFileSync(join(__dirname, "./payload.ts"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

describe("WS203 Payload Validation", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Check all output variables", () => {
    payload = [{ variable: "payload", value: "01756403673401046865050000", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "01756403673401046865050000", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "battery", value: 100, unit: "%" }),
        expect.objectContaining({ variable: "humidity", value: 50.5 }),
        expect.objectContaining({ variable: "occupancy", value: "vacant" }),
        expect.objectContaining({ variable: "temperature", value: 30.8 }),
      ])
    );
  });

  test("Check all output variables - temperature, temperature_abnormal", () => {
    payload = [{ variable: "payload", value: "8367220101", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "8367220101", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "temperature", value: 29 }),
        expect.objectContaining({ variable: "temperature_abnormal", value: "abnormal" }),
      ])
    );
  });

  test("Check all output variables - history", () => {
    payload = [{ variable: "payload", value: "20CEAE5BA664040024016520CE5C5CA6640301340165", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "20CEAE5BA664040024016520CE5C5CA6640301340165", unit: "", metadata: {} }),
        expect.objectContaining({
          variable: "history",
          value:
            '[{"timestamp":1688624046,"report_type":"period","occupancy":"vacant","temperature":29.2,"humidity":50.5},{"timestamp":1688624220,"report_type":"pir occupancy","occupancy":"occupied","temperature":30.8,"humidity":50.5}]',
          metadata: [
            {
              humidity: 50.5,
              occupancy: "vacant",
              report_type: "period",
              temperature: 29.2,
              timestamp: 1688624046,
            },
            {
              humidity: 50.5,
              occupancy: "occupied",
              report_type: "pir occupancy",
              temperature: 30.8,
              timestamp: 1688624220,
            },
          ],
        }),
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
