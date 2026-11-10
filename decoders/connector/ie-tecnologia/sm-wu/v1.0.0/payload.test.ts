import { describe, expect, test, beforeEach } from "vitest";
import type { DataToSend } from "@tago-io/sdk";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/ie-tecnologia/sm-wu/v1.0.0/payload.ts";

const SM_WU_EXAMPLE_JSON = JSON.stringify({
  id: "1",
  d: "241",
  nivel: "33",
  volume: "115",
});

describe("SM-WU — Payload completo via variável 'payload'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "payload", value: SM_WU_EXAMPLE_JSON },
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

  test("Distância", () => {
    const item = result.find((x: any) => x.variable === "distance");
    expect(item).toBeDefined();
    expect(item!.value).toBe(241);
    expect(item!.unit).toBe("cm");
  });

  test("Nível", () => {
    const item = result.find((x: any) => x.variable === "level");
    expect(item).toBeDefined();
    expect(item!.value).toBe(33);
    expect(item!.unit).toBe("cm");
  });

  test("Volume", () => {
    const item = result.find((x: any) => x.variable === "volume");
    expect(item).toBeDefined();
    expect(item!.value).toBe(115);
    expect(item!.unit).toBe("L");
  });

  test("Todas as variáveis têm group", () => {
    for (const item of result) {
      expect((item as any).group).toBeDefined();
    }
  });
});

describe("SM-WU — Payload via variável 'data'", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { variable: "data", value: SM_WU_EXAMPLE_JSON },
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 4 variáveis", () => {
    expect(result.length).toBe(4);
  });

  test("Nível parseado corretamente", () => {
    const item = result.find((x: any) => x.variable === "level");
    expect(item!.value).toBe(33);
  });
});

describe("SM-WU — JSON puro via HTTP POST direto", () => {
  let result: DataToSend[];

  beforeEach(() => {
    const payload: DataToSend[] = [
      { d: "241", nivel: "33", volume: "115" } as any,
    ];
    result = decoderRun(file_path, { payload });
  });

  test("Retorna 3 variáveis", () => {
    expect(result.length).toBe(3);
  });

  test("Distância parseada corretamente", () => {
    const item = result.find((x: any) => x.variable === "distance");
    expect(item!.value).toBe(241);
    expect(item!.unit).toBe("cm");
  });

  test("Volume parseado corretamente", () => {
    const item = result.find((x: any) => x.variable === "volume");
    expect(item!.value).toBe(115);
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