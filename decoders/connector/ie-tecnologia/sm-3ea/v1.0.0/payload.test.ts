import { describe, expect, test, beforeEach } from "vitest";
import type { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/ie-tecnologia/sm-3ea/v1.0.0/payload.ts";

const SM_3EA_EXAMPLE_JSON = JSON.stringify({
  id: "AC:15:18:F4:9A:A4",
  ia: 14.03,
  ib: 0.0,
  ic: 0.0,
  tec: "1",
  rssi_wifi: -50,
});

describe("SM-3EA — Payload completo via variável 'payload'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "payload", value: SM_3EA_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 6 variáveis", () => {
    expect(result.length).toBe(6);
  });

  test("Device ID é string (MAC address)", () => {
    const item = result.find((x: any) => x.variable === "device_id");
    expect(item).toBeDefined();
    expect(item!.value).toBe("AC:15:18:F4:9A:A4");
  });

  test("Corrente Fase A", () => {
    const item = result.find((x: any) => x.variable === "current_a");
    expect(item).toBeDefined();
    expect(item!.value).toBe(14.03);
    expect(item!.unit).toBe("mA");
  });

  test("Corrente Fase B", () => {
    const item = result.find((x: any) => x.variable === "current_b");
    expect(item).toBeDefined();
    expect(item!.value).toBe(0);
    expect(item!.unit).toBe("mA");
  });

  test("Corrente Fase C", () => {
    const item = result.find((x: any) => x.variable === "current_c");
    expect(item).toBeDefined();
    expect(item!.value).toBe(0);
    expect(item!.unit).toBe("mA");
  });

  test("Tipo de conexão", () => {
    const item = result.find((x: any) => x.variable === "connection_type");
    expect(item).toBeDefined();
    expect(item!.value).toBe(1);
  });

  test("RSSI Wi-Fi", () => {
    const item = result.find((x: any) => x.variable === "rssi_wifi");
    expect(item).toBeDefined();
    expect(item!.value).toBe(-50);
    expect(item!.unit).toBe("dBm");
  });

  test("Todas as variáveis têm group", () => {
    for (const item of result) {
      expect((item as any).group).toBeDefined();
    }
  });
});

describe("SM-3EA — Payload via variável 'data'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "data", value: SM_3EA_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 6 variáveis", () => {
    expect(result.length).toBe(6);
  });

  test("Corrente Fase A parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "current_a");
    expect(item!.value).toBe(14.03);
  });
});

describe("SM-3EA — JSON puro via HTTP POST direto", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { ia: 14.03, ib: 0.0, ic: 0.0, rssi_wifi: -50 } as any,
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 4 variáveis", () => {
    expect(result.length).toBe(4);
  });

  test("Corrente Fase A parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "current_a");
    expect(item!.value).toBe(14.03);
    expect(item!.unit).toBe("mA");
  });

  test("RSSI parseado corretamente", () => {
    const item = result.find((x: any) => x.variable === "rssi_wifi");
    expect(item!.value).toBe(-50);
  });
});

describe("SM-3EA — x-www-form-urlencoded (JSON como chave do objeto)", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const jsonAsKey: any = {};
    jsonAsKey[SM_3EA_EXAMPLE_JSON] = "";
    const payload: DataToSend[] = [jsonAsKey];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 6 variáveis", () => {
    expect(result.length).toBe(6);
  });

  test("Corrente Fase A parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "current_a");
    expect(item).toBeDefined();
    expect(item!.value).toBe(14.03);
  });

  test("RSSI parseado corretamente", () => {
    const item = result.find((x: any) => x.variable === "rssi_wifi");
    expect(item).toBeDefined();
    expect(item!.value).toBe(-50);
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