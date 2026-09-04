import { describe, expect, test, beforeEach } from "vitest";
import type { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/ie-tecnologia/sm-3w-lite/v1.0.0/payload.ts";

/**
 * Payload de exemplo da documentação do SM-3W Lite.
 */
const SM3W_EXAMPLE_JSON = JSON.stringify({
  id: "12345678901234567890123",
  pa: "0.00",
  pb: "0.00",
  pc: "0.00",
  pt: "0.00",
  qa: "0.00",
  qb: "0.00",
  qc: "0.00",
  qt: "0.00",
  sa: "0.00",
  sb: "0.00",
  sc: "0.00",
  st: "0.00",
  uarms: "120.15",
  ubrms: "0.31",
  ucrms: "0.29",
  iarms: "0.00",
  ibrms: "0.00",
  icrms: "0.00",
  itrms: "0.00",
  pfa: "1.00",
  pfb: "1.00",
  pfc: "1.00",
  pft: "1.00",
  pga: "-90.02",
  pgb: "0.00",
  pgc: "-90.02",
  freq: "60.00",
  epa_c: "0.00",
  epb_c: "0.00",
  epc_c: "0.00",
  ept_c: "0.00",
  epa_g: "0.00",
  epb_g: "0.00",
  epc_g: "0.00",
  ept_g: "0.00",
  yuaub: "269.97",
  yuauc: "269.97",
  yubuc: "0.00",
  tpsd: "30.08",
});

/**
 * Teste 1: Payload completo via variável "payload"
 */
describe("SM-3W Lite — Payload completo via variável 'payload'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "payload", value: SM3W_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna array com 40 variáveis", () => {
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(40);
  });

  test("Device ID é string", () => {
    const item = result.find((x: any) => x.variable === "device_id");
    expect(item).toBeDefined();
    expect(item!.value).toBe("12345678901234567890123");
  });

  test("Tensão Fase A", () => {
    const item = result.find((x: any) => x.variable === "voltage_a");
    expect(item).toBeDefined();
    expect(item!.value).toBe(120.15);
    expect(item!.unit).toBe("V");
  });

  test("Frequência", () => {
    const item = result.find((x: any) => x.variable === "frequency");
    expect(item).toBeDefined();
    expect(item!.value).toBe(60);
    expect(item!.unit).toBe("Hz");
  });

  test("Ângulo de fase negativo", () => {
    const item = result.find((x: any) => x.variable === "phase_angle_a");
    expect(item).toBeDefined();
    expect(item!.value).toBe(-90.02);
    expect(item!.unit).toBe("°");
  });

  test("Temperatura do equipamento", () => {
    const item = result.find((x: any) => x.variable === "device_temperature");
    expect(item).toBeDefined();
    expect(item!.value).toBe(30.08);
    expect(item!.unit).toBe("°C");
  });

  test("Todas as variáveis têm group", () => {
    for (const item of result) {
      expect((item as any).group).toBeDefined();
      expect(typeof (item as any).group).toBe("string");
    }
  });
});

/**
 * Teste 2: Payload via variável "data"
 */
describe("SM-3W Lite — Payload via variável 'data'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "data", value: SM3W_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna array com 40 variáveis", () => {
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(40);
  });

  test("Tensão Fase A parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "voltage_a");
    expect(item).toBeDefined();
    expect(item!.value).toBe(120.15);
  });
});

/**
 * Teste 3: Valores realistas de operação
 */
describe("SM-3W Lite — Valores realistas", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const realistic_json = JSON.stringify({
      id: "98765432109876543210987",
      pa: "1523.45",
      pb: "1480.20",
      pc: "1510.80",
      pt: "4514.45",
      qa: "320.10",
      qb: "310.50",
      qc: "315.30",
      qt: "945.90",
      sa: "1556.70",
      sb: "1512.40",
      sc: "1543.30",
      st: "4612.40",
      uarms: "127.20",
      ubrms: "126.80",
      ucrms: "127.50",
      iarms: "12.23",
      ibrms: "11.92",
      icrms: "12.10",
      itrms: "36.25",
      pfa: "0.98",
      pfb: "0.98",
      pfc: "0.98",
      pft: "0.98",
      pga: "-11.48",
      pgb: "-11.48",
      pgc: "-11.48",
      freq: "59.98",
      epa_c: "15230.50",
      epb_c: "14980.30",
      epc_c: "15120.70",
      ept_c: "45331.50",
      epa_g: "0.00",
      epb_g: "0.00",
      epc_g: "0.00",
      ept_g: "0.00",
      yuaub: "120.05",
      yuauc: "240.10",
      yubuc: "120.05",
      tpsd: "42.30",
    });

    const payload: DataToSend[] = [
      { variable: "payload", value: realistic_json },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 40 variáveis", () => {
    expect(result.length).toBe(40);
  });

  test("Potência ativa total", () => {
    const item = result.find((x: any) => x.variable === "active_power_total");
    expect(item!.value).toBe(4514.45);
    expect(item!.unit).toBe("W");
  });

  test("Corrente total", () => {
    const item = result.find((x: any) => x.variable === "current_total");
    expect(item!.value).toBe(36.25);
    expect(item!.unit).toBe("A");
  });

  test("Consumo de energia total", () => {
    const item = result.find(
      (x: any) => x.variable === "energy_consumption_total"
    );
    expect(item!.value).toBe(45331.5);
    expect(item!.unit).toBe("kWh");
  });

  test("Temperatura do equipamento", () => {
    const item = result.find(
      (x: any) => x.variable === "device_temperature"
    );
    expect(item!.value).toBe(42.3);
  });
});

/**
 * Teste 4: JSON puro via HTTP POST (envio direto do dispositivo)
 */
describe("SM-3W Lite — JSON puro via HTTP POST direto", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { pa: "100.50", uarms: "127.20", freq: "59.98", tpsd: "32.10" } as any,
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 4 variáveis", () => {
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(4);
  });

  test("Tensão Fase A parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "voltage_a");
    expect(item).toBeDefined();
    expect(item!.value).toBe(127.2);
    expect(item!.unit).toBe("V");
  });

  test("Frequência parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "frequency");
    expect(item).toBeDefined();
    expect(item!.value).toBe(59.98);
    expect(item!.unit).toBe("Hz");
  });

  test("Temperatura parseada corretamente", () => {
    const item = result.find(
      (x: any) => x.variable === "device_temperature"
    );
    expect(item).toBeDefined();
    expect(item!.value).toBe(32.1);
    expect(item!.unit).toBe("°C");
  });
});

/**
 * Teste 5 (obrigatório): Shall not pass
 * Prova que o decoder não modifica dados que não são dele.
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