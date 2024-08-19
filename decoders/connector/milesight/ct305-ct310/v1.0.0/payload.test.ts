import { describe, test, expect, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DataToSend } from "@tago-io/sdk/lib/types";
import * as ts from "typescript";

const file = readFileSync(join(__dirname, "./payload.ts"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

describe("CT305 Payload Validation", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Check all output variables", () => {
    payload = [{ variable: "payload", value: "FF0BFFFF0101FF166746D38802580000FF090100FF0A0101FF0F00FFFF0101", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "FF0BFFFF0101FF166746D38802580000FF090100FF0A0101FF0F00FFFF0101", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "firmware_version", value: "v1.1" }),
        expect.objectContaining({ variable: "hardware_version", value: "v1.0" }),
        expect.objectContaining({ variable: "ipso_version", value: "v0.1" }),
        expect.objectContaining({ variable: "lorawan_class", value: "ClassA" }),
        expect.objectContaining({ variable: "power_status", value: "on" }),
        expect.objectContaining({ variable: "sn", value: "6746d38802580000" }),
        expect.objectContaining({ variable: "tsl_version", value: "v1.1" }),
      ])
    );
  });

  test("Check all output variables - current_chn1_total", () => {
    payload = [{ variable: "payload", value: "039710270000", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "039710270000", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "current_chn1_total", value: 100 }),
      ])
    );
  });

  test("Check all output variables - current_chn1", () => {
    payload = [{ variable: "payload", value: "0499B80B00000000", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "0499B80B00000000", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "current_chn1", value: 3 }),
      ])
    );
  });

  test("Check all output variables - current_chn1_alarm", () => {
    payload = [{ variable: "payload", value: "0499FFFF", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "0499FFFF", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "current_chn1_alarm", value: "read failed" }),
      ])
    );
  });

  test("Check all output variables - list of current_chn1_alarm", () => {
    payload = [{ variable: "payload", value: "8499B80BD007C40905", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "8499B80BD007C40905", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "current_chn1_alarm", value: "threshold alarm, over range alarm" }),
        expect.objectContaining({ variable: "current_chn1", value: 2.5 }),
        expect.objectContaining({ variable: "current_chn1_max", value: 3.0 }),
        expect.objectContaining({ variable: "current_chn1_min", value: 2.0 }),
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
