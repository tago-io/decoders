import { describe, expect, test, beforeEach } from "vitest";
import type { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/ie-tecnologia/sm-3egw/v1.0.0/payload.ts";

const SM3EGW_EXAMPLE_JSON = JSON.stringify({
  id: "12345678901234567890123",
  pa: "-0.07",
  pb: "-0.03",
  pc: "-0.03",
  pt: "-0.07",
  qa: "-0.07",
  qb: "-0.03",
  qc: "-0.03",
  qt: "-0.07",
  sa: "0.07",
  sb: "0.00",
  sc: "0.00",
  st: "0.00",
  uarms: "129.22",
  ubrms: "0.22",
  ucrms: "0.22",
  iarms: "0.00",
  ibrms: "0.00",
  icrms: "0.00",
  itrms: "0.00",
  pfa: "1.00",
  pfb: "1.00",
  pfc: "1.00",
  pft: "1.00",
  pga: "-89.98",
  pgb: "0.00",
  pgc: "0.00",
  freq: "59.95",
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
  yuaub: "270.01",
  yuauc: "270.01",
  yubuc: "0.00",
  tpsd: "28.63",
  tec: "1",
  rssi_wifi: "-46",
  rssi_gsm: "-999",
});

describe("SM-3EGW — Payload completo via variável 'payload'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "payload", value: SM3EGW_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna array com 67 variáveis", () => {
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(67);
  });

  test("Device ID é string", () => {
    const item = result.find((x: any) => x.variable === "device_id");
    expect(item).toBeDefined();
    expect(item!.value).toBe("12345678901234567890123");
  });

  test("Tensão Fase A", () => {
    const item = result.find((x: any) => x.variable === "voltage_a");
    expect(item).toBeDefined();
    expect(item!.value).toBe(129.22);
    expect(item!.unit).toBe("V");
  });

  test("Frequência", () => {
    const item = result.find((x: any) => x.variable === "frequency");
    expect(item).toBeDefined();
    expect(item!.value).toBe(59.95);
    expect(item!.unit).toBe("Hz");
  });

  test("Ângulo de fase negativo", () => {
    const item = result.find((x: any) => x.variable === "phase_angle_a");
    expect(item).toBeDefined();
    expect(item!.value).toBe(-89.98);
  });

  test("Consumo energia reativa total", () => {
    const item = result.find(
      (x: any) => x.variable === "energy_consumption_reactive_total"
    );
    expect(item).toBeDefined();
    expect(item!.value).toBe(0);
    expect(item!.unit).toBe("kVArh");
  });

  test("Delta consumo ativa A", () => {
    const item = result.find(
      (x: any) => x.variable === "delta_consumption_active_a"
    );
    expect(item).toBeDefined();
    expect(item!.value).toBe(0);
    expect(item!.unit).toBe("kWh");
  });

  test("Temperatura do equipamento", () => {
    const item = result.find(
      (x: any) => x.variable === "device_temperature"
    );
    expect(item).toBeDefined();
    expect(item!.value).toBe(28.63);
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
    expect(item!.value).toBe(-46);
    expect(item!.unit).toBe("dBm");
  });

  test("RSSI GSM", () => {
    const item = result.find((x: any) => x.variable === "rssi_gsm");
    expect(item).toBeDefined();
    expect(item!.value).toBe(-999);
    expect(item!.unit).toBe("dBm");
  });

  test("Todas as variáveis têm group", () => {
    for (const item of result) {
      expect((item as any).group).toBeDefined();
      expect(typeof (item as any).group).toBe("string");
    }
  });
});

describe("SM-3EGW — Payload via variável 'data'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "data", value: SM3EGW_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 67 variáveis", () => {
    expect(result.length).toBe(67);
  });

  test("Tensão Fase A parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "voltage_a");
    expect(item!.value).toBe(129.22);
  });
});

describe("SM-3EGW — JSON puro via HTTP POST direto", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      {
        uarms: "127.20",
        freq: "59.98",
        tpsd: "32.10",
        tec: "1",
        rssi_wifi: "-50",
        rssi_gsm: "-999",
      } as any,
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 6 variáveis", () => {
    expect(result.length).toBe(6);
  });

  test("Tensão Fase A", () => {
    const item = result.find((x: any) => x.variable === "voltage_a");
    expect(item!.value).toBe(127.2);
  });

  test("Tipo de conexão", () => {
    const item = result.find(
      (x: any) => x.variable === "connection_type"
    );
    expect(item!.value).toBe(1);
  });

  test("RSSI GSM", () => {
    const item = result.find((x: any) => x.variable === "rssi_gsm");
    expect(item!.value).toBe(-999);
  });
});

describe("SM-3EGW — x-www-form-urlencoded (JSON como chave do objeto)", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const jsonAsKey: any = {};
    jsonAsKey[SM3EGW_EXAMPLE_JSON] = "";
    const payload: DataToSend[] = [jsonAsKey];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 67 variáveis", () => {
    expect(result.length).toBe(67);
  });

  test("Tensão Fase A parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "voltage_a");
    expect(item).toBeDefined();
    expect(item!.value).toBe(129.22);
  });

  test("Temperatura parseada corretamente", () => {
    const item = result.find(
      (x: any) => x.variable === "device_temperature"
    );
    expect(item).toBeDefined();
    expect(item!.value).toBe(28.63);
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