import { describe, test, expect, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DataToSend } from "@tago-io/sdk/lib/types";
import * as ts from "typescript";

const file = readFileSync(join(__dirname, "./payload.ts"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

describe("WS558 Payload Validation", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Check all output variables", () => {
    payload = [{ variable: "payload", value: "0831000105816407C902000374B208068301000000048001000000", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "0831000105816407C902000374B208068301000000048001000000", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "voltage", value: 222.6, unit: "V" }),
        expect.objectContaining({ variable: "active_power", value: 1, unit: "W" }),
        expect.objectContaining({ variable: "power_factor", value: 100, unit: "%" }),
        expect.objectContaining({ variable: "total_current", value: 2, unit: "mA" }),
        expect.objectContaining({ variable: "power_consumption", value: 1, unit: "W*h" }),
        expect.objectContaining({ variable: "switch_1", value: "on", unit: "" }),
        expect.objectContaining({ variable: "switch_2", value: "off", unit: "" }),
        expect.objectContaining({ variable: "switch_3", value: "off", unit: "" }),
        expect.objectContaining({ variable: "switch_4", value: "off", unit: "" }),
        expect.objectContaining({ variable: "switch_5", value: "off", unit: "" }),
        expect.objectContaining({ variable: "switch_6", value: "off", unit: "" }),
        expect.objectContaining({ variable: "switch_7", value: "off", unit: "" }),
        expect.objectContaining({ variable: "switch_8", value: "off", unit: "" }),
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
