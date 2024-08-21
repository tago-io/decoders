import { describe, test, expect, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DataToSend } from "@tago-io/sdk/lib/types";
import * as ts from "typescript";

const file = readFileSync(join(__dirname, "./payload.ts"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

describe("EM400-MUD Payload Validation", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Check all output variables", () => {
    payload = [{ variable: "payload", value: "01755C0367010104824408050001", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "01755C0367010104824408050001", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "battery", value: 92, unit: "%" }),
        expect.objectContaining({ variable: "temperature", value: 25.7, unit: "°C" }),
        expect.objectContaining({ variable: "distance", value: 2116, unit: "mm" }),
        expect.objectContaining({ variable: "position", value: "tilt" }),
      ])
    );
  });

  test("Check all output variables - environmental", () => {
    payload = [{ variable: "payload", value: "8367e800018482410601", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "8367e800018482410601", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "temperature", value: 23.2, unit: "°C" }),
        expect.objectContaining({ variable: "temperature_abnormal", value: true }),
        expect.objectContaining({ variable: "distance", value: 1601, unit: "mm" }),
        expect.objectContaining({ variable: "distance_alarming", value: true }),
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
