import { describe, test, expect, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DataToSend } from "@tago-io/sdk/lib/types";
import * as ts from "typescript";

const file = readFileSync(join(__dirname, "./payload.ts"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

describe("WS302 Payload Validation", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Check all output variables", () => {
    payload = [{ variable: "payload", value: "017564055B053F02DA016A02", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "017564055B053F02DA016A02", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "battery", value: 100, unit: "%" }),
        expect.objectContaining({ variable: "laf", value: 57.5 }),
        expect.objectContaining({ variable: "laeq", value: 47.4 }),
        expect.objectContaining({ variable: "lafmax", value: 61.8 }),
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
