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
    payload = [{ variable: "payload", value: "017564055B053F02DA016A02", unit: "", metadata: {} }];
  });

  test("Check all output variables for acceleration", () => {
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
});

describe("Shall not be parsed", () => {
  beforeEach(() => {
    payload = [{ variable: "shallnotpass", value: "invalid_payload" }];
  });

  test("Output Result", () => {
    const result = eval(transpiledCode);
    expect(result).toEqual(undefined);
  });
});

describe("Invalid payload", () => {
  beforeEach(() => {
    payload = [{ variable: "payload", value: "invalid_payload", unit: "", metadata: {} }];
  });

  // console.info(payload);
  test("Output Result", () => {
    const result = eval(transpiledCode);
    expect(result).toEqual([{ variable: "parse_error", value: "Invalid payload size" }]);
  });
});
