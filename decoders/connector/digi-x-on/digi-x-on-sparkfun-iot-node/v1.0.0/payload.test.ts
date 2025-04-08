import { readFileSync } from "fs";
import { join } from "path";
import * as ts from "typescript";
import { beforeEach, describe, expect, test } from "vitest";

import { DataToSend } from "@tago-io/sdk/lib/types";

// Load and transpile the JS decoder code
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

    const aqiVar = payload.find((item) => item.variable === "AQI");
    expect(aqiVar).toBeDefined();
    expect(typeof aqiVar?.value).toBe("number");
  });

  test("Handles unknown sensor gracefully", () => {
    payload = [{ variable: "payload", value: "FFFF1234" }];
    (globalThis as any).payload = payload;

    eval(transpiled);

    const unknown = payload.find((item) => item.variable === "unknown_sensor");
    expect(unknown).toBeDefined();
    expect(unknown?.value).toBe("FF");
  });
});

describe("Allow normal variables to pass", () => {
  beforeEach(() => {
    payload = [
      { variable: "shallnotbedecoded", value: "04096113950292" },
      { variable: "fport", value: 9 },
    ];
    (globalThis as any).payload = payload;
  });

  test("Non-payload variables are passed through unchanged", () => {
    eval(transpiled);

    expect(payload).toEqual(
      expect.arrayContaining([
        { variable: "shallnotbedecoded", value: "04096113950292" },
        { variable: "fport", value: 9 },
      ])
    );
  });
});
