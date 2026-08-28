import { describe, expect, test, beforeEach } from "vitest";
import type { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/ie-tecnologia/sm-wt/v1.0.0/payload.ts";

/**
 * Teste 1: Payload SHT40 (temperatura + umidade + rssi)
 */
describe("SM-WT — Sensor SHT40 (temperatura + umidade)", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const sht40_json = JSON.stringify({
      id: "1",
      t_canal1: "24.09",
      u_canal1: "59.48",
      rssi_wifi: "-72.00",
    });
    const payload: DataToSend[] = [
      { variable: "payload", value: sht40_json },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 4 variáveis", () => {
    expect(result.length).toBe(4);
  });

  test("Device ID é string", () => {
    const item = result.find((x: any) => x.variable === "device_id");
    expect(item).toBeDefined();
    expect(item!.value).toBe("1");
  });

  test("Temperatura", () => {
    const item = result.find((x: any) => x.variable === "temperature");
    expect(item).toBeDefined();
    expect(item!.value).toBe(24.09);
    expect(item!.unit).toBe("°C");
  });

  test("Umidade", () => {
    const item = result.find((x: any) => x.variable === "humidity");
    expect(item).toBeDefined();
    expect(item!.value).toBe(59.48);
    expect(item!.unit).toBe("%rH");
  });

  test("RSSI Wi-Fi", () => {
    const item = result.find((x: any) => x.variable === "rssi_wifi");
    expect(item).toBeDefined();
    expect(item!.value).toBe(-72);
    expect(item!.unit).toBe("dBm");
  });

  test("Todas as variáveis têm group", () => {
    for (const item of result) {
      expect((item as any).group).toBeDefined();
    }
  });
});

/**
 * Teste 2: Payload DS18B20 (somente temperatura)
 */
describe("SM-WT — Sensor DS18B20 (somente temperatura)", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const ds18b20_json = JSON.stringify({
      id: "2",
      t_canal1: "31.50",
    });
    const payload: DataToSend[] = [
      { variable: "payload", value: ds18b20_json },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 2 variáveis", () => {
    expect(result.length).toBe(2);
  });

  test("Temperatura", () => {
    const item = result.find((x: any) => x.variable === "temperature");
    expect(item).toBeDefined();
    expect(item!.value).toBe(31.5);
    expect(item!.unit).toBe("°C");
  });

  test("Não tem umidade", () => {
    const item = result.find((x: any) => x.variable === "humidity");
    expect(item).toBeUndefined();
  });
});

/**
 * Teste 3: JSON puro via HTTP POST direto
 */
describe("SM-WT — JSON puro via HTTP POST direto", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { t_canal1: "24.09", u_canal1: "59.48", rssi_wifi: "-75.00" } as any,
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 3 variáveis", () => {
    expect(result.length).toBe(3);
  });

  test("Temperatura parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "temperature");
    expect(item!.value).toBe(24.09);
  });

  test("RSSI parseado corretamente", () => {
    const item = result.find((x: any) => x.variable === "rssi_wifi");
    expect(item!.value).toBe(-75);
    expect(item!.unit).toBe("dBm");
  });
});

/**
 * Teste 4 (obrigatório): Shall not pass
 */
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