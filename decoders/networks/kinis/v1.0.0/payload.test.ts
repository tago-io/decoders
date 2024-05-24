import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DataToSend } from "@tago-io/sdk/lib/types";
import * as ts from "typescript";

const file = readFileSync(join(__dirname, "./payload.ts"));
const transpiledCode = ts.transpile(file.toString());

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
let payload: DataToSend[] = [];

describe("Test Suite for Servern-WLD", () => {
  beforeEach(() => {
    payload = [
      { variable: "type", value: "DEVICE_RAW", serie: "serie1" },
      { variable: "mode", value: "mode1", serie: "serie1" },
      { variable: "version", value: "v1.0.0", serie: "serie1" },
      {
        variable: "data",
        value: JSON.stringify({
          MSG_DATE: "2022-01-01",
          MSG_ID: 1,
          RAW_DATA: "raw_data",
          LOC_DATE: "2022-01-01",
          LOC_ID: 1,
          LONG: 123.456,
          LAT: 78.91,
          ALT: 11.12,
          LOC_CLASS: "class1",
          MSG_IDS: [1, 2, 3],
          SENSORS: {},
          CHECKED: "checked",
        }),
        serie: "serie1",
      },
    ];
  });

  test("Check all output variables for given payload and port", () => {
    const result = eval(transpiledCode);

    console.log(result);

    expect(result).toEqual(
      expect.arrayContaining([
        { variable: "type", value: "DEVICE_RAW", serie: "serie1" },
        { variable: "mode", value: "mode1", serie: "serie1" },
        { variable: "version", value: "v1.0.0", serie: "serie1" },
        { variable: "msg_date", value: "2022-01-01", serie: "serie1" },
        { variable: "msg_id", value: 1, serie: "serie1" },
        { variable: "payload_raw", value: "raw_data", serie: "serie1" },
      ])
    );
  });
});
