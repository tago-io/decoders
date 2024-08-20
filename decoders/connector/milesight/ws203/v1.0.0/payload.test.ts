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

        expect.objectContaining({ variable: "humidity", value: 50.5, unit: "%RH", time: new Date(1688624046 * 1000) }),
        expect.objectContaining({ variable: "occupancy", value: "vacant", time: new Date(1688624046 * 1000) }),
        expect.objectContaining({ variable: "report_type", value: "period", time: new Date(1688624046 * 1000) }),
        expect.objectContaining({ variable: "temperature", value: 29.2, unit: "°C", time: new Date(1688624046 * 1000) }),

        expect.objectContaining({ variable: "humidity", value: 50.5, unit: "%RH", time: new Date(1688624220 * 1000) }),
        expect.objectContaining({ variable: "occupancy", value: "occupied", time: new Date(1688624220 * 1000) }),
        expect.objectContaining({ variable: "report_type", value: "pir occupancy", time: new Date(1688624220 * 1000) }),
        expect.objectContaining({ variable: "temperature", value: 30.8, unit: "°C", time: new Date(1688624220 * 1000) }),
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
