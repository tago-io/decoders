import { describe, expect, test, beforeEach } from "vitest";
import type { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/ie-tecnologia/sm-wl/v1.0.0/payload.ts";

const SM_WL_EXAMPLE_JSON = JSON.stringify({
  id: "3",
  pa: "0.02",
  qa: "-0.03",
  sa: "-0.00",
  uarms: "125.73",
  iarms: "0.01",
  pfa: "0.50",
  pga: "-90.01",
  freq: "60.00",
  epa_c: "0.00",
  eqa_c: "0.00",
  epa_g: "0.00",
  eqa_g: "0.00",
  delta_epa_c: "0.00",
  delta_eqa_c: "0.00",
  delta_epa_g: "0.00",
  delta_eqa_g: "0.00",
  tpsd: "35.16",
  rssi_wifi: "-51",
});

describe("SM-WL — Payload completo via variável 'payload'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "payload", value: SM_WL_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 19 variáveis", () => {
    expect(result.length).toBe(19);
  });

  test("Device ID é string", () => {
    const item = result.find((x: any) => x.variable === "device_id");
    expect(item).toBeDefined();
    expect(item!.value).toBe("3");
  });

  test("Potência Ativa", () => {
    const item = result.find((x: any) => x.variable === "active_power");
    expect(item).toBeDefined();
    expect(item!.value).toBe(0.02);
    expect(item!.unit).toBe("W");
  });

  test("Potência Reativa negativa", () => {
    const item = result.find((x: any) => x.variable === "reactive_power");
    expect(item).toBeDefined();
    expect(item!.value).toBe(-0.03);
    expect(item!.unit).toBe("VAr");
  });

  test("Tensão", () => {
    const item = result.find((x: any) => x.variable === "voltage");
    expect(item).toBeDefined();
    expect(item!.value).toBe(125.73);
    expect(item!.unit).toBe("V");
  });

  test("Frequência", () => {
    const item = result.find((x: any) => x.variable === "frequency");
    expect(item).toBeDefined();
    expect(item!.value).toBe(60);
    expect(item!.unit).toBe("Hz");
  });

  test("Consumo energia reativa", () => {
    const item = result.find((x: any) => x.variable === "energy_consumption_reactive");
    expect(item).toBeDefined();
    expect(item!.value).toBe(0);
    expect(item!.unit).toBe("kVArh");
  });

  test("Delta consumo ativa", () => {
    const item = result.find((x: any) => x.variable === "delta_consumption_active");
    expect(item).toBeDefined();
    expect(item!.value).toBe(0);
    expect(item!.unit).toBe("kWh");
  });

  test("Temperatura do equipamento", () => {
    const item = result.find((x: any) => x.variable === "device_temperature");
    expect(item).toBeDefined();
    expect(item!.value).toBe(35.16);
    expect(item!.unit).toBe("°C");
  });

  test("RSSI Wi-Fi", () => {
    const item = result.find((x: any) => x.variable === "rssi_wifi");
    expect(item).toBeDefined();
    expect(item!.value).toBe(-51);
    expect(item!.unit).toBe("dBm");
  });

  test("Todas as variáveis têm group", () => {
    for (const item of result) {
      expect((item as any).group).toBeDefined();
    }
  });
});

describe("SM-WL — Payload via variável 'data'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "data", value: SM_WL_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 19 variáveis", () => {
    expect(result.length).toBe(19);
  });

  test("Tensão parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "voltage");
    expect(item!.value).toBe(125.73);
  });
});

describe("SM-WL — JSON puro via HTTP POST direto", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { pa: "0.02", uarms: "125.73", iarms: "0.01", pfa: "0.50", freq: "60.00", delta_epa_c: "0.00", tpsd: "35.16" } as any,
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 7 variáveis", () => {
    expect(result.length).toBe(7);
  });

  test("Tensão parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "voltage");
    expect(item!.value).toBe(125.73);
  });

  test("Delta consumo ativa parseado", () => {
    const item = result.find((x: any) => x.variable === "delta_consumption_active");
    expect(item!.value).toBe(0);
  });
});

describe("SM-WL — x-www-form-urlencoded (JSON como chave do objeto)", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const jsonAsKey: any = {};
    jsonAsKey[SM_WL_EXAMPLE_JSON] = "";
    const payload: DataToSend[] = [jsonAsKey];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 19 variáveis", () => {
    expect(result.length).toBe(19);
  });

  test("Tensão parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "voltage");
    expect(item).toBeDefined();
    expect(item!.value).toBe(125.73);
  });

  test("Temperatura parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "device_temperature");
    expect(item).toBeDefined();
    expect(item!.value).toBe(35.16);
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