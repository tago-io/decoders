import { describe, test, expect, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DataToSend } from "@tago-io/sdk/lib/types";
import * as ts from "typescript";

const file = readFileSync(join(__dirname, "./payload.ts"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

describe("EM400-MUD Payload Validation", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Check all output variables", () => {
    payload = [
      {
        variable: "payload",
        value:
          "020001005f00000001303130313031313036373439443139303534363930303331383638353038303634383037333530343630303433323234323133313130383938363034313231303232373030363238353709000e01756403670b0104823b01050001",
        unit: "",
        metadata: {},
      },
    ];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          variable: "additional_information",
          value: "additional_information",
          metadata: {
            startFlag: 2,
            id: 1,
            length: 95,
            flag: 0,
            frameCnt: 0,
            protocolVersion: 1,
            firmwareVersion: "0101",
            hardwareVersion: "0110",
            sn: "6749D19054690031",
            imei: "868508064807350",
            imsi: "460043224213110",
            iccid: "89860412102270062857",
            csq: 9,
            data_length: 14,
          },
        }),

        expect.objectContaining({ variable: "battery", value: 100, unit: "%" }),
        expect.objectContaining({ variable: "temperature", value: 26.7, unit: "°C" }),
        expect.objectContaining({ variable: "distance", value: 315, unit: "mm" }),
        expect.objectContaining({ variable: "position", value: "tilt" }),
      ])
    );
  });

  test("Shall not be parsed", () => {
    payload = [{ variable: "shallnotpass", value: "invalid_payload" }];
    const result = eval(transpiledCode);

    expect(result).toEqual(undefined);
  });
});
