import { readFileSync } from "fs";
import { join } from "path";
import * as ts from "typescript";
import { beforeEach, describe, expect, test } from "vitest";

import { DataToSend } from "@tago-io/sdk/lib/types";

const file = readFileSync(join(__dirname, "./payload.js"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];
let device: { params: { key: string; value: string }[] };

describe("Device Payload Validation", () => {
  beforeEach(() => {
    payload = [{ variable: "payload", value: "056062880040020600030305" }];
    device = { params: [{ key: "beacon_decoder", value: "simple" }] };
  });

  test("Check all output variables for acceleration", () => {
    const result = eval(transpiledCode);

    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "payload", value: "056062880040020600030305" })]));
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "type", value: 5 })]));
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "cause", value: "System Request (application) Reset" })]));
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "mcu_firmware_iteration", value: "026" })]));
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "ble_firmware_iteration", value: "533" })]));
  });
});

describe("Device Payload Validation", () => {
  beforeEach(() => {
    payload = [{ variable: "payload", value: "0a4c5e95a001" }];
    device = { params: [{ key: "beacon_decoder", value: "simple" }] };
  });

  test("Check all output variables for acceleration", () => {
    const result = eval(transpiledCode);

    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "payload", value: "0a4c5e95a001" })]));
  });
});
