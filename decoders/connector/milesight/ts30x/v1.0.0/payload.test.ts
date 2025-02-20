import { readFileSync } from "fs";
import { join } from "path";
import * as ts from "typescript";
import { beforeEach, describe, expect, test } from "vitest";

import { DataToSend } from "@tago-io/sdk/lib/types";

const file = readFileSync(join(__dirname, "./payload.ts"), "utf8");
const transpiledCode = ts.transpile(file);

let payload: DataToSend[] = [];

describe("Normal variable", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Shall not be parsed", () => {
    payload = [{ variable: "shallnotpass", value: "invalid_payload" }];

    expect(payload).toEqual(expect.arrayContaining([expect.objectContaining({ variable: "shallnotpass", value: "invalid_payload" })]));
  });
});

describe("ts30x Payload Validation", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Uplink 1", () => {
    payload = [
      {
        variable: "payload",
        value: "0175640367F100040001",
      },
    ];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "battery", value: 100 }),
        expect.objectContaining({ variable: "temperature_chn1", value: 24.1 }),
        expect.objectContaining({ variable: "magnet_chn2", value: "opened" }),
      ])
    );
  });

  test("Uplink 2", () => {
    payload = [
      {
        variable: "payload",
        value: "0175640367FB0004670101",
      },
    ];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "battery", value: 100 }),
        expect.objectContaining({ variable: "temperature_chn1", value: 25.1 }),
        expect.objectContaining({ variable: "temperature_chn2", value: 25.7 }),
      ])
    );
  });

  test("Uplink 3", () => {
    payload = [
      {
        variable: "payload",
        value: "017514030001040001",
      },
    ];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "battery", value: 20 }),
        expect.objectContaining({ variable: "magnet_chn1", value: "opened" }),
        expect.objectContaining({ variable: "magnet_chn1", value: "opened" }),
      ])
    );
  });

  test("Uplink 4", () => {
    payload = [
      {
        variable: "payload",
        value: "01756403672701836727010004670801",
      },
    ];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "battery", value: 100 }),
        expect.objectContaining({ variable: "temperature_chn1", value: 29.5 }),
        expect.objectContaining({ variable: "temperature_chn1_alarm", value: "threshold release" }),
        expect.objectContaining({ variable: "temperature_chn2", value: 26.4 }),
      ])
    );
  });

  test("Uplink 5", () => {
    payload = [
      {
        variable: "payload",
        value: "0175640367F1000467F7008467F70001",
      },
    ];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "battery", value: 100 }),
        expect.objectContaining({ variable: "temperature_chn1", value: 24.1 }),
        expect.objectContaining({ variable: "temperature_chn2_alarm", value: "threshold" }),
        expect.objectContaining({ variable: "temperature_chn2", value: 24.7 }),
      ])
    );
  });

  test("Uplink 6", () => {
    payload = [
      {
        variable: "payload",
        value: "94D70401820002",
      },
    ];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "temperature_chn2", value: 26 }),
        expect.objectContaining({ variable: "temperature_chn2_change", value: 1.3 }),
        expect.objectContaining({ variable: "temperature_chn2_alarm", value: "mutation" }),
      ])
    );
  });

  test("Uplink 7", () => {
    payload = [
      {
        variable: "payload",
        value: "20CEC79AFA6444BDFFF600",
      },
    ];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "temperature_chn1", value: -6.7, time: 1694145223 }),
        expect.objectContaining({ variable: "temperature_chn2", value: 24.6, time: 1694145223 }),
      ])
    );
  });
});
