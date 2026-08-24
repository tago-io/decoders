import { readFileSync } from "fs";
import { join } from "path";
import * as ts from "typescript";
import { beforeEach, describe, expect, test } from "vitest";

import { DataToSend } from "@tago-io/sdk";

const file = readFileSync(join(__dirname, "./payload.ts"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

describe("IG502 connector - TagoIO-style array format", () => {
  beforeEach(() => {
    payload = [
      {
        variable: "payload",
        value: JSON.stringify([
          { variable: "temperature", value: 25.3, unit: "C" },
          { variable: "humidity", value: 60.5, unit: "%" },
          { variable: "power", value: 1 },
        ]),
        group: "g1",
      },
    ];
  });

  test("Parses variable/value objects into TagoIO variables", () => {
    const result = eval(transpiledCode);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "temperature", value: 25.3, unit: "C", group: "g1" }),
        expect.objectContaining({ variable: "humidity", value: 60.5, unit: "%", group: "g1" }),
        expect.objectContaining({ variable: "power", value: 1, group: "g1" }),
      ])
    );
  });
});

describe("IG502 connector - Device Supervisor group message format", () => {
  beforeEach(() => {
    payload = [
      {
        variable: "payload",
        value: JSON.stringify({
          timestamp: 1694567890,
          values: {
            "Modbus TCP PLC": {
              temperature: { raw_data: 253 },
              running: { raw_data: 1 },
            },
          },
        }),
        group: "g2",
      },
    ];
  });

  test("Parses measuring points with timestamp", () => {
    const result = eval(transpiledCode);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "temperature", value: 253, time: new Date(1694567890 * 1000) }),
        expect.objectContaining({ variable: "running", value: 1 }),
      ])
    );
  });
});

describe("IG502 connector - shall not parse unrelated payload", () => {
  beforeEach(() => {
    payload = [{ variable: "shallnotpass", value: "04096113950292" }];
  });

  test("Unrelated payload is left untouched", () => {
    const result = eval(transpiledCode);
    expect(result).toEqual([{ variable: "shallnotpass", value: "04096113950292" }]);
  });
});

describe("IG502 connector - non-JSON payload", () => {
  beforeEach(() => {
    payload = [{ variable: "payload", value: "not-json-at-all" }];
  });

  test("Non-JSON payload is left untouched", () => {
    const result = eval(transpiledCode);
    expect(result).toEqual([{ variable: "payload", value: "not-json-at-all" }]);
  });
});
