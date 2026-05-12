import { describe, expect, test } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/lansitec/valve-positioning-sensor/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload: {
    variable: string;
    value: string;
    unit?: string;
    metadata?: {};
  }[] = [{ variable: "payload", value: payloadHex }];

  payload = decoderRun(file_path, { payload });

  const type = payload.find((item) => item.variable === "type");
  const direction = payload.find((item) => item.variable === "direction");
  const vceState = payload.find((item) => item.variable === "vceState");

  return {
    payload,
    type,
    direction,
    vceState,
  };
}

describe("Valve positioning sensor VceState unit tests", () => {
  const payloadHex = "3000060022";
  const result = preparePayload(payloadHex);

  test("Check variable values", () => {
    expect(result.type?.value).toBe("VceState");
    expect(result.direction?.value).toBe("CW");
    expect(result.vceState?.value).toBe("Close");
  });
});

describe("Shall not be parsed", () => {
  let payload: {
    variable: string;
    value: string;
  }[] = [{ variable: "shallnotpass", value: "04096113950292" }];

  payload = decoderRun(file_path, { payload });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "shallnotpass", value: "04096113950292" }]);
  });
});
