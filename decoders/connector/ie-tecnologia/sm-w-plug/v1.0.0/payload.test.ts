import { describe, expect, test, beforeEach } from "vitest";
import type { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/ie-tecnologia/sm-w-plug/v1.0.0/payload.ts";

const SM_W_PLUG_EXAMPLE_JSON = JSON.stringify({
  id: "001",
  pa: "1234.56",
  qa: "234.56",
  sa: "1250.00",
  uarms: "220.50",
  iarms: "5.32",
  pft: "0.98",
  pga: "123.45",
  freq: "59.98",
  epa_c: "4567.89",
  rele: "1",
  rssi_wifi: "-63.00",
});

describe("SM-W Plug — Payload completo via variável 'payload'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "payload", value: SM_W_PLUG_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 12 variáveis", () => {
    expect(result.length).toBe(12);
  });

  test("Device ID é string", () => {
    const item = result.find((x: any) => x.variable === "device_id");
    expect(item).toBeDefined();
    expect(item!.value).toBe("001");
  });

  test("Potência Ativa", () => {
    const item = result.find((x: any) => x.variable === "active_power");
    expect(item).toBeDefined();
    expect(item!.value).toBe(1234.56);
    expect(item!.unit).toBe("W");
  });

  test("Tensão", () => {
    const item = result.find((x: any) => x.variable === "voltage");
    expect(item).toBeDefined();
    expect(item!.value).toBe(220.5);
    expect(item!.unit).toBe("V");
  });

  test("Frequência", () => {
    const item = result.find((x: any) => x.variable === "frequency");
    expect(item).toBeDefined();
    expect(item!.value).toBe(59.98);
    expect(item!.unit).toBe("Hz");
  });

  test("Consumo de energia", () => {
    const item = result.find((x: any) => x.variable === "energy_consumption");
    expect(item).toBeDefined();
    expect(item!.value).toBe(4567.89);
    expect(item!.unit).toBe("kWh");
  });

  test("Estado do relé ligado", () => {
    const item = result.find((x: any) => x.variable === "relay_state");
    expect(item).toBeDefined();
    expect(item!.value).toBe(1);
  });

  test("RSSI Wi-Fi", () => {
    const item = result.find((x: any) => x.variable === "rssi_wifi");
    expect(item).toBeDefined();
    expect(item!.value).toBe(-63);
    expect(item!.unit).toBe("dBm");
  });

  test("Todas as variáveis têm group", () => {
    for (const item of result) {
      expect((item as any).group).toBeDefined();
    }
  });
});

describe("SM-W Plug — Payload via variável 'data'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "data", value: SM_W_PLUG_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 12 variáveis", () => {
    expect(result.length).toBe(12);
  });

  test("Tensão parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "voltage");
    expect(item!.value).toBe(220.5);
  });
});

describe("SM-W Plug — JSON puro via HTTP POST direto", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { pa: "1234.56", uarms: "220.50", freq: "59.98", rele: "1", rssi_wifi: "-63.00" } as any,
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 5 variáveis", () => {
    expect(result.length).toBe(5);
  });

  test("Tensão parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "voltage");
    expect(item!.value).toBe(220.5);
  });

  test("Estado do relé", () => {
    const item = result.find((x: any) => x.variable === "relay_state");
    expect(item!.value).toBe(1);
  });
});

describe("SM-W Plug — x-www-form-urlencoded (JSON como chave do objeto)", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const jsonAsKey: any = {};
    jsonAsKey[SM_W_PLUG_EXAMPLE_JSON] = "";
    const payload: DataToSend[] = [jsonAsKey];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 12 variáveis", () => {
    expect(result.length).toBe(12);
  });

  test("Tensão parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "voltage");
    expect(item).toBeDefined();
    expect(item!.value).toBe(220.5);
  });

  test("Estado do relé", () => {
    const item = result.find((x: any) => x.variable === "relay_state");
    expect(item).toBeDefined();
    expect(item!.value).toBe(1);
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