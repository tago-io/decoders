import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/daytec/siglog/v1.0.0/payload.ts" as const;

//TEST1
function preparePayload(payloadstr: string) {
  let payload: {
    variable: string;
    value: string;
    metadata: {};
  }[] = [{ variable: "payload", value: payloadstr, metadata: {} }];
  payload = decoderRun(file_path, { payload });
  // decodeUplink variables
  const input1 = payload.find((item) => item.variable === "input1");
  const input10 = payload.find((item) => item.variable === "input10");
  const input32 = payload.find((item) => item.variable === "input32");
  const input43 = payload.find((item) => item.variable === "input43");

  return {
    input1,
    input10,
    input32,
    input43,
  };
}

describe("Siglog 32A2 Input Test", () => {
  const payloadstr = "1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,ERn1,0,0,0,1,ERR U,ERR U,13.789,17,V1.7,#0015,-26.12155,28.20558";
  const result = preparePayload(payloadstr);

  test("Check variable values", () => {
    expect(result.input1?.value).toBe("1");
    expect(result.input10?.value).toBe("1");
    expect(result.input32?.value).toBe("1");
    expect(result.input43?.value).toBe("#0015");
  });
});

//TEST2
describe("Shall not be parsed", () => {
  let payload = [
    { variable: "payload", value: "0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,ERn1,0,0,0,1,ERR U,ERR U,13.789,17,V1.7,#0015,-26.12155,28.20558" },
  ];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "parse_error", value: "String Not Valid" }]);
  });
});

//TEST3
describe("Shall not be parsed", () => {
  let payload = [{ variable: "payload", value: "1,0,ERn1,0,0,0,1,ERR U,ERR U,13.789,17,V1.7,#0015,-26.12155,28.20558" }];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "parse_error", value: "String Length Not Valid" }]);
  });
});

//TEST4
describe("Shall not be parsed", () => {
  let payload = [{ variable: "shallnotpass", value: "04096113950292" }];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([{ variable: "shallnotpass", value: "04096113950292" }]);
  });
});
