import { describe, expect, test, beforeEach } from "vitest";
import type { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/ie-tecnologia/sm-wa/v1.0.0/payload.ts";

const SM_WA_EXAMPLE_JSON = JSON.stringify({
  id: "1",
  ppl: "3.14",
  vazao: "1.23",
  consumo: "45.67",
  rssi_wifi: "-60.50",
});

describe("SM-WA — Payload completo via variável 'payload'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "payload", value: SM_WA_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna array com 5 variáveis", () => {
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(5);
  });

  test("Device ID é string", () => {
    const item = result.find((x: any) => x.variable === "device_id");
    expect(item).toBeDefined();
    expect(item!.value).toBe("1");
  });

  test("Pulsos por litro", () => {
    const item = result.find((x: any) => x.variable === "pulses_per_liter");
    expect(item).toBeDefined();
    expect(item!.value).toBe(3.14);
    expect(item!.unit).toBe("pulsos/L");
  });

  test("Vazão instantânea", () => {
    const item = result.find((x: any) => x.variable === "flow_rate");
    expect(item).toBeDefined();
    expect(item!.value).toBe(1.23);
    expect(item!.unit).toBe("L/min");
  });

  test("Consumo total acumulado", () => {
    const item = result.find((x: any) => x.variable === "total_consumption");
    expect(item).toBeDefined();
    expect(item!.value).toBe(45.67);
    expect(item!.unit).toBe("L");
  });

  test("RSSI Wi-Fi negativo", () => {
    const item = result.find((x: any) => x.variable === "rssi_wifi");
    expect(item).toBeDefined();
    expect(item!.value).toBe(-60.5);
    expect(item!.unit).toBe("dBm");
  });

  test("Todas as variáveis têm group", () => {
    for (const item of result) {
      expect((item as any).group).toBeDefined();
    }
  });
});

describe("SM-WA — Payload via variável 'data'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "data", value: SM_WA_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 5 variáveis", () => {
    expect(result.length).toBe(5);
  });

  test("Vazão parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "flow_rate");
    expect(item!.value).toBe(1.23);
  });
});

describe("SM-WA — JSON puro via HTTP POST direto", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { ppl: "3.14", vazao: "1.23", consumo: "45.67", rssi_wifi: "-60.50" } as any,
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 4 variáveis", () => {
    expect(result.length).toBe(4);
  });

  test("Consumo parseado corretamente", () => {
    const item = result.find((x: any) => x.variable === "total_consumption");
    expect(item!.value).toBe(45.67);
    expect(item!.unit).toBe("L");
  });
});

describe("Shall not be parsed", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "shallnotpass", value: "04096113950292" },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Output Result", () => {
    expect(Array.isArray(result)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(result).toEqual([
      { variable: "shallnotpass", value: "04096113950292" },
    ]);
  });
});