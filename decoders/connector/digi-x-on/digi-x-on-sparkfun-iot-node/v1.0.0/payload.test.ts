import { readFileSync } from "fs";
import { join } from "path";
import * as ts from "typescript";
import { beforeEach, describe, expect, test } from "vitest";

import { DataToSend } from "@tago-io/sdk/lib/types";

// Load the JS decoder code
const decoderFile = readFileSync(join(__dirname, "./payload.js"), "utf8");
const transpiled = ts.transpile(decoderFile);

let payload: DataToSend[] = [];

(globalThis as any).payload = payload;

describe("SparkFun Decoder (toTagoFormat)", () => {
  beforeEach(() => {
    payload = [{ variable: "payload", value: "05127A" }];
    (globalThis as any).payload = payload;
  });

  test("Decodes AQI sensor (0x05) with value", () => {
    eval(transpiled);

    const aqiVar = payload.find(item => item.variable === "AQI");
    expect(aqiVar).toBeDefined();
    expect(typeof aqiVar?.value).toBe("number");
  });

  test("Handles unknown sensor gracefully", () => {
    payload = [{ variable: "payload", value: "FFFF1234" }];
    (globalThis as any).payload = payload;

    eval(transpiled);

    const unknown = payload.find(item => item.variable === "unknown_sensor");
    expect(unknown).toBeDefined();
    expect(unknown?.value).toBe("FF");
  });

  test("Handles empty or missing payload", () => {
    payload = [{ variable: "foo", value: "1234" }];
    (globalThis as any).payload = payload;

    eval(transpiled);

    const error = payload.find(item => item.variable === "parser_error");
    expect(error).toBeDefined();
    expect(error?.value).toMatch(/No Payload/i);
  });
});
