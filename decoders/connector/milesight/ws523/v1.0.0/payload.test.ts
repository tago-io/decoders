import { describe, test, expect, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DataToSend } from "@tago-io/sdk/lib/types";
import * as ts from "typescript";

const file = readFileSync(join(__dirname, "./payload.ts"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

describe("WS523 Payload Validation", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Check all output variables", () => {
    payload = [{ variable: "payload", value: "08700105812C07C94A0003743009068309660000048007000000", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "08700105812C07C94A0003743009068309660000048007000000", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "voltage", value: 235.2, unit: "V" }),
        expect.objectContaining({ variable: "active_power", value: 7, unit: "W" }),
        expect.objectContaining({ variable: "power_factor", value: 0.44 }),
        expect.objectContaining({ variable: "power_consumption", value: 26121, unit: "W*h" }),
        expect.objectContaining({ variable: "current", value: 74, unit: "mA" }),
        expect.objectContaining({ variable: "socket_status", value: "open" }),
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
