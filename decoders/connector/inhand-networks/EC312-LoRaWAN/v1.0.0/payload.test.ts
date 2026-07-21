import { readFileSync } from "fs";
import { join } from "path";
import * as ts from "typescript";
import { beforeEach, describe, expect, test } from "vitest";

import { DataToSend } from "@tago-io/sdk";

const file = readFileSync(join(__dirname, "./payload.ts"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

describe("EC312-LoRaWAN connector", () => {
  beforeEach(() => {
    payload = [
      { variable: "data", value: "AaKz", group: "g1" },
      { variable: "fport", value: 2, group: "g1" },
    ];
  });

  test("Adds hex version of the raw payload", () => {
    const result = eval(transpiledCode);
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ variable: "payload_hex", value: "01a2b3" })])
    );
  });
});

describe("EC312-LoRaWAN connector - shall not parse unrelated payload", () => {
  beforeEach(() => {
    payload = [{ variable: "shallnotpass", value: "04096113950292" }];
  });

  test("Unrelated payload is left untouched", () => {
    const result = eval(transpiledCode);
    expect(result).toEqual([{ variable: "shallnotpass", value: "04096113950292" }]);
  });
});