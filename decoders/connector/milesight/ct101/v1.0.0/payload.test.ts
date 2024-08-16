import { describe, test, expect, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DataToSend } from "@tago-io/sdk/lib/types";
import * as ts from "typescript";

const file = readFileSync(join(__dirname, "./payload.ts"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

describe("CT101 Payload Validation", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Check all output variables ", () => {
    payload = [{ variable: "payload", value: "FF0BFFFF0101FF166746D38802580000FF090100FF0A0101FF0F00", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "FF0BFFFF0101FF166746D38802580000FF090100FF0A0101FF0F00", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "firmware_version", value: "v1.1" }),
        expect.objectContaining({ variable: "hardware_version", value: "v1.0" }),
        expect.objectContaining({ variable: "ipso_version", value: "v0.1" }),
        expect.objectContaining({ variable: "power", value: "on" }),
        expect.objectContaining({ variable: "sn", value: "6746d38802580000" }),
      ])
    );
  });

  test("Check payload and total current", () => {
    payload = [{ variable: "payload", value: "039710270000", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "039710270000", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "total_current", value: 100 }),
      ])
    );
  });

  test("Check payload and current", () => {
    payload = [{ variable: "payload", value: "0498B80B00000000", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "0498B80B00000000", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "current", value: 30 }),
      ])
    );
  });

  test("Check payload and alarm", () => {
    payload = [{ variable: "payload", value: "0498FFFF", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "0498FFFF", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "alarm", value: "read failed" }),
      ])
    );
  });

  test("Check payload and alarms", () => {
    payload = [{ variable: "payload", value: "8498B80BD007C40905", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "8498B80BD007C40905", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "alarm", value: "threshold alarm, over range alarm" }),
        expect.objectContaining({ variable: "current", value: 25 }),
        expect.objectContaining({ variable: "current_max", value: 30 }),
        expect.objectContaining({ variable: "current_min", value: 20 }),
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
