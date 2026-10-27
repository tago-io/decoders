import { describe, expect, test, beforeEach } from "vitest";
import type { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/ie-tecnologia/sm-3elw/v1.0.0/payload.ts";

const SM3WL_EXAMPLE_JSON = JSON.stringify({
  id: "1",
  pa: "0.01",
  pb: "-0.01",
  pc: "-0.01",
  pt: "0.00",
  qa: "-0.04",
  qb: "-0.01",
  qc: "-0.01",
  qt: "-0.04",
  sa: "0.04",
  sb: "0.00",
  sc: "0.00",
  st: "0.02",
  uarms: "120.75",
  ubrms: "0.10",
  ucrms: "0.04",
  iarms: "0.00",
  ibrms: "0.00",
  icrms: "0.00",
  itrms: "0.00",
  pfa: "0.25",
  pfb: "1.00",
  pfc: "1.00",
  pft: "0.00",
  pga: "-89.99",
  pgb: "0.00",
  pgc: "-89.99",
  freq: "60.05",
  epa_c: "0.00",
  epb_c: "0.00",
  epc_c: "0.00",
  ept_c: "0.00",
  eqa_c: "0.00",
  eqb_c: "0.00",
  eqc_c: "0.00",
  eqt_c: "0.00",
  epa_g: "0.00",
  epb_g: "0.00",
  epc_g: "0.00",
  ept_g: "0.00",
  eqa_g: "0.00",
  eqb_g: "0.00",
  eqc_g: "0.00",
  eqt_g: "0.00",
  delta_epa_c: "0.00",
  delta_epb_c: "0.00",
  delta_epc_c: "0.00",
  delta_ept_c: "0.00",
  delta_eqa_c: "0.00",
  delta_eqb_c: "0.00",
  delta_eqc_c: "0.00",
  delta_eqt_c: "0.00",
  delta_epa_g: "0.00",
  delta_epb_g: "0.00",
  delta_epc_g: "0.00",
  delta_ept_g: "0.00",
  delta_eqa_g: "0.00",
  delta_eqb_g: "0.00",
  delta_eqc_g: "0.00",
  delta_eqt_g: "0.00",
  yuaub: "270.00",
  yuauc: "270.00",
  yubuc: "0.00",
  tpsd: "41.69",
  tec: "1",
  rssi_wifi: "-58",
});

describe("SM-3ELW — Payload completo via variável 'payload'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "payload", value: SM3WL_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna array com 66 variáveis", () => {
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(66);
  });

  test("Device ID é string", () => {
    const item = result.find((x: any) => x.variable === "device_id");
    expect(item).toBeDefined();
    expect(item!.value).toBe("1");
  });

  test("Tensão Fase A", () => {
    const item = result.find((x: any) => x.variable === "voltage_a");
    expect(item).toBeDefined();
    expect(item!.value).toBe(120.75);
    expect(item!.unit).toBe("V");
  });

  test("Frequência", () => {
    const item = result.find((x: any) => x.variable === "frequency");
    expect(item).toBeDefined();
    expect(item!.value).toBe(60.05);
    expect(item!.unit).toBe("Hz");
  });

  test("Ângulo de fase negativo", () => {
    const item = result.find((x: any) => x.variable === "phase_angle_a");
    expect(item).toBeDefined();
    expect(item!.value).toBe(-89.99);
  });

  test("Temperatura do equipamento", () => {
    const item = result.find(
      (x: any) => x.variable === "device_temperature"
    );
    expect(item).toBeDefined();
    expect(item!.value).toBe(41.69);
    expect(item!.unit).toBe("°C");
  });

  test("Tipo de conexão", () => {
    const item = result.find(
      (x: any) => x.variable === "connection_type"
    );
    expect(item).toBeDefined();
    expect(item!.value).toBe(1);
  });

  test("RSSI Wi-Fi", () => {
    const item = result.find((x: any) => x.variable === "rssi_wifi");
    expect(item).toBeDefined();
    expect(item!.value).toBe(-58);
    expect(item!.unit).toBe("dBm");
  });

  test("Todas as variáveis têm group", () => {
    for (const item of result) {
      expect((item as any).group).toBeDefined();
      expect(typeof (item as any).group).toBe("string");
    }
  });
});

describe("SM-3ELW — Payload via variável 'data'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "data", value: SM3WL_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 66 variáveis", () => {
    expect(result.length).toBe(66);
  });

  test("Tensão Fase A parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "voltage_a");
    expect(item!.value).toBe(120.75);
  });
});

describe("SM-3ELW — JSON puro via HTTP POST direto", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      {
        uarms: "120.75",
        freq: "60.05",
        tpsd: "41.69",
        tec: "1",
        rssi_wifi: "-58",
      } as any,
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 5 variáveis", () => {
    expect(result.length).toBe(5);
  });

  test("Tensão Fase A", () => {
    const item = result.find((x: any) => x.variable === "voltage_a");
    expect(item!.value).toBe(120.75);
  });

  test("RSSI Wi-Fi", () => {
    const item = result.find((x: any) => x.variable === "rssi_wifi");
    expect(item!.value).toBe(-58);
  });
});

describe("SM-3ELW — x-www-form-urlencoded (JSON como chave do objeto)", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const jsonAsKey: any = {};
    jsonAsKey[SM3WL_EXAMPLE_JSON] = "";
    const payload: DataToSend[] = [jsonAsKey];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 66 variáveis", () => {
    expect(result.length).toBe(66);
  });

  test("Tensão Fase A parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "voltage_a");
    expect(item).toBeDefined();
    expect(item!.value).toBe(120.75);
  });

  test("Temperatura parseada corretamente", () => {
    const item = result.find(
      (x: any) => x.variable === "device_temperature"
    );
    expect(item).toBeDefined();
    expect(item!.value).toBe(41.69);
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