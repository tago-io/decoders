import { describe, test, expect, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { DataToSend } from "@tago-io/sdk/lib/types";
import * as ts from "typescript";

const file = readFileSync(join(__dirname, "./payload.ts"));
const transpiledCode = ts.transpile(file.toString());

let payload: DataToSend[] = [];

describe("WT201 Payload Validation", () => {
  beforeEach(() => {
    payload = [];
  });

  test("Check all output variables", () => {
    payload = [{ variable: "payload", value: "036702010467A60005E70006E80007BC00", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "036702010467A60005E70006E80007BC00", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "fan_mode", value: "auto" }),
        expect.objectContaining({ variable: "fan_status", value: "standby" }),
        expect.objectContaining({ variable: "plan_event", value: "not executed" }),
        expect.objectContaining({ variable: "temperature", value: 25.8, unit: "°C" }),
        expect.objectContaining({ variable: "temperature_ctl_mode", value: "heat" }),
        expect.objectContaining({ variable: "temperature_ctl_status", value: "standby" }),
        expect.objectContaining({ variable: "temperature_target", value: 16.6, unit: "°C" }),
      ])
    );
  });

  test("Check all output variables - temperature", () => {
    payload = [{ variable: "payload", value: "8367FB0009", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "8367FB0009", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "temperature", value: 25.1, unit: "°C" }),
        expect.objectContaining({ variable: "temperature_alarm", value: "threshold alarm" }),
      ])
    );
  });

  test("Check all output variables - history", () => {
    payload = [{ variable: "payload", value: "20CE5C470A65D09EC091", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "20CE5C470A65D09EC091", unit: "", metadata: {} }),

        expect.objectContaining({ variable: "fan_mode", value: "auto" }),
        expect.objectContaining({ variable: "fan_status", value: "standby", time: new Date(1695172444 * 1000) }),
        expect.objectContaining({ variable: "system_status", value: "on", time: new Date(1695172444 * 1000) }),
        expect.objectContaining({ variable: "temperature", value: 27, unit: "°C", time: new Date(1695172444 * 1000) }),
        expect.objectContaining({ variable: "temperature_ctl_mode", value: "heat", time: new Date(1695172444 * 1000) }),
        expect.objectContaining({ variable: "temperature_ctl_status", value: "standby", time: new Date(1695172444 * 1000) }),
        expect.objectContaining({ variable: "temperature_target", value: 16.6, unit: "°C", time: new Date(1695172444 * 1000) }),
      ])
    );
  });

  test("Check all output variables - list temperatures", () => {
    payload = [{ variable: "payload", value: "FFCB0D1101FFCA158004", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "FFCB0D1101FFCA158004", unit: "", metadata: {} }),
        expect.objectContaining({ variable: "ob_mode", value: "heat" }),
        expect.objectContaining({ variable: "temperature_ctl_mode_enable", value: "heat, cool, auto" }),
        expect.objectContaining({ variable: "temperature_ctl_status_enable", value: "stage-1 heat, aux heat, stage-1 cool" }),
        expect.objectContaining({ variable: "wires", value: "Y1, GH, OB, AUX" }),
      ])
    );
  });

  test("Check all output variables - plan schedule", () => {
    payload = [{ variable: "payload", value: "FFC900000000B302FFC9020101280000", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "FFC900000000B302FFC9020101280000", unit: "", metadata: {} }),
        expect.objectContaining({
          variable: "plan_schedule",
          value:
            '[{"type":"wake","index":1,"plan_enable":"disable","week_recycle":"","time":"11:31"},{"type":"home","index":2,"plan_enable":"enable","week_recycle":"Wed., Fri.","time":"0:00"}]',
          metadata: {
            plan_schedule: [
              {
                index: 1,
                plan_enable: "disable",
                time: "11:31",
                type: "wake",
                week_recycle: "",
              },
              {
                index: 2,
                plan_enable: "enable",
                time: "0:00",
                type: "home",
                week_recycle: "Wed., Fri.",
              },
            ],
          },
        }),
      ])
    );
  });

  test("Check all output variables - plan settings", () => {
    payload = [{ variable: "payload", value: "FFC80303014E36", unit: "", metadata: {} }];
    const result = eval(transpiledCode);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ variable: "payload", value: "FFC80303014E36", unit: "", metadata: {} }),
        expect.objectContaining({
          variable: "plan_settings",
          value: '[{"type":"sleep","temperature_ctl_mode":"auto","fan_mode":"on","temperature_target":78,"temperature_unit":"℃","temperature_error":5.4}]',
          metadata: {
            plan_settings: [
              {
                fan_mode: "on",
                temperature_ctl_mode: "auto",
                temperature_error: 5.4,
                temperature_target: 78,
                temperature_unit: "℃",
                type: "sleep",
              },
            ],
          },
        }),
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
