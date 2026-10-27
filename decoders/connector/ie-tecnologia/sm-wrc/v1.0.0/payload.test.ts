import { describe, expect, test, beforeEach } from "vitest";
import type { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/ie-tecnologia/sm-wrc/v1.0.0/payload.ts";

const SM_WRC_EXAMPLE_JSON = JSON.stringify({
  id: "4",
  er: "0",
  rssi: "-64.00",
});

describe("SM-WRC — Payload completo via variável 'payload'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "payload", value: SM_WRC_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 3 variáveis", () => {
    expect(result.length).toBe(3);
  });

  test("Device ID é string", () => {
    const item = result.find((x: any) => x.variable === "device_id");
    expect(item).toBeDefined();
    expect(item!.value).toBe("4");
  });

  test("Estado do relé desligado", () => {
    const item = result.find((x: any) => x.variable === "relay_state");
    expect(item).toBeDefined();
    expect(item!.value).toBe(0);
  });

  test("RSSI Wi-Fi", () => {
    const item = result.find((x: any) => x.variable === "rssi_wifi");
    expect(item).toBeDefined();
    expect(item!.value).toBe(-64);
    expect(item!.unit).toBe("dBm");
  });

  test("Todas as variáveis têm group", () => {
    for (const item of result) {
      expect((item as any).group).toBeDefined();
    }
  });
});

describe("SM-WRC — Relé ligado", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const relay_on = JSON.stringify({
      id: "4",
      er: "1",
      rssi: "-50.00",
    });
    const payload: DataToSend[] = [
      { variable: "payload", value: relay_on },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Estado do relé ligado", () => {
    const item = result.find((x: any) => x.variable === "relay_state");
    expect(item).toBeDefined();
    expect(item!.value).toBe(1);
  });
});

describe("SM-WRC — Payload via variável 'data'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "data", value: SM_WRC_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 3 variáveis", () => {
    expect(result.length).toBe(3);
  });

  test("Estado do relé parseado corretamente", () => {
    const item = result.find((x: any) => x.variable === "relay_state");
    expect(item!.value).toBe(0);
  });
});

describe("SM-WRC — JSON puro via HTTP POST direto", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { er: "0", rssi: "-64.00" } as any,
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 2 variáveis", () => {
    expect(result.length).toBe(2);
  });

  test("Estado do relé parseado", () => {
    const item = result.find((x: any) => x.variable === "relay_state");
    expect(item!.value).toBe(0);
  });
});

describe("SM-WRC — x-www-form-urlencoded (JSON como chave do objeto)", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const jsonAsKey: any = {};
    jsonAsKey[SM_WRC_EXAMPLE_JSON] = "";
    const payload: DataToSend[] = [jsonAsKey];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 3 variáveis", () => {
    expect(result.length).toBe(3);
  });

  test("Estado do relé parseado", () => {
    const item = result.find((x: any) => x.variable === "relay_state");
    expect(item).toBeDefined();
    expect(item!.value).toBe(0);
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