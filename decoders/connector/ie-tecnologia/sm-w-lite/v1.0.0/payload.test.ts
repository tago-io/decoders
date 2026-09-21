import { describe, expect, test, beforeEach } from "vitest";
import type { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/ie-tecnologia/sm-w-lite/v1.0.0/payload.ts";

const SM_W_LITE_EXAMPLE_JSON = JSON.stringify({
  id: "1",
  pa: "-0.03",
  qa: "-0.02",
  sa: "0.03",
  uarms: "125.80",
  iarms: "0.00",
  pft: "1.00",
  pga: "-89.99",
  freq: "60.01",
  epa_c: "0.00",
  epa_g: "0.00",
  tpsd: "30.80",
  rssi_wifi: "-64.00",
});

describe("SM-W Lite — Payload completo via variável 'payload'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "payload", value: SM_W_LITE_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 13 variáveis", () => {
    expect(result.length).toBe(13);
  });

  test("Device ID é string", () => {
    const item = result.find((x: any) => x.variable === "device_id");
    expect(item).toBeDefined();
    expect(item!.value).toBe("1");
  });

  test("Potência Ativa", () => {
    const item = result.find((x: any) => x.variable === "active_power");
    expect(item).toBeDefined();
    expect(item!.value).toBe(-0.03);
    expect(item!.unit).toBe("W");
  });

  test("Tensão", () => {
    const item = result.find((x: any) => x.variable === "voltage");
    expect(item).toBeDefined();
    expect(item!.value).toBe(125.8);
    expect(item!.unit).toBe("V");
  });

  test("Frequência", () => {
    const item = result.find((x: any) => x.variable === "frequency");
    expect(item).toBeDefined();
    expect(item!.value).toBe(60.01);
    expect(item!.unit).toBe("Hz");
  });

  test("Ângulo de fase negativo", () => {
    const item = result.find((x: any) => x.variable === "phase_angle");
    expect(item).toBeDefined();
    expect(item!.value).toBe(-89.99);
    expect(item!.unit).toBe("°");
  });

  test("Temperatura do equipamento", () => {
    const item = result.find((x: any) => x.variable === "device_temperature");
    expect(item).toBeDefined();
    expect(item!.value).toBe(30.8);
    expect(item!.unit).toBe("°C");
  });

  test("RSSI Wi-Fi", () => {
    const item = result.find((x: any) => x.variable === "rssi_wifi");
    expect(item).toBeDefined();
    expect(item!.value).toBe(-64);
    expect(item!.unit).toBe("dBm");
  });

  test("Fator de Potência", () => {
    const item = result.find((x: any) => x.variable === "power_factor");
    expect(item).toBeDefined();
    expect(item!.value).toBe(1);
  });

  test("Todas as variáveis têm group", () => {
    for (const item of result) {
      expect((item as any).group).toBeDefined();
    }
  });
});

describe("SM-W Lite — Payload via variável 'data'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "data", value: SM_W_LITE_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 13 variáveis", () => {
    expect(result.length).toBe(13);
  });

  test("Tensão parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "voltage");
    expect(item!.value).toBe(125.8);
  });
});

describe("SM-W Lite — JSON puro via HTTP POST direto", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { pa: "-0.03", uarms: "125.80", iarms: "0.00", pft: "1.00", freq: "60.01", tpsd: "30.80" } as any,
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 6 variáveis", () => {
    expect(result.length).toBe(6);
  });

  test("Tensão parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "voltage");
    expect(item!.value).toBe(125.8);
  });

  test("Frequência parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "frequency");
    expect(item!.value).toBe(60.01);
  });
});

describe("SM-W Lite — x-www-form-urlencoded (JSON como chave do objeto)", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const jsonAsKey: any = {};
    jsonAsKey[SM_W_LITE_EXAMPLE_JSON] = "";
    const payload: DataToSend[] = [jsonAsKey];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 13 variáveis", () => {
    expect(result.length).toBe(13);
  });

  test("Tensão parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "voltage");
    expect(item).toBeDefined();
    expect(item!.value).toBe(125.8);
  });

  test("Temperatura parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "device_temperature");
    expect(item).toBeDefined();
    expect(item!.value).toBe(30.8);
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