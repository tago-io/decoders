/* eslint-disable unicorn/numeric-separators-style */
import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path =
  "decoders/connector/dragino/cs01lb/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: Buffer, port: number) {
  let payload = [
    { variable: "payload", value: payloadHex },
    { variable: "fport", value: port },
  ];
  payload = decoderRun(file_path, { payload });

  const DATALOG = payload.find((item) => item.variable === "datalog");
  const EXTI_Trigger = payload.find((item) => item.variable === "exti_trigger");
  const BAT = payload.find((item) => item.variable === "bat");
  const KEEP_STATUS = payload.find((item) => item.variable === "keep_status");
  const Current1_A = payload.find((item) => item.variable === "current1_a");
  const Current2_A = payload.find((item) => item.variable === "current2_a");
  const Current3_A = payload.find((item) => item.variable === "current3_a");
  const Current4_A = payload.find((item) => item.variable === "current4_a");
  const Cur1L_status = payload.find((item) => item.variable === "cur1l_status");
  const Cur1H_status = payload.find((item) => item.variable === "cur1h_status");
  const Cur2L_status = payload.find((item) => item.variable === "cur2l_status");
  const Cur2H_status = payload.find((item) => item.variable === "cur2h_status");
  const Cur3L_status = payload.find((item) => item.variable === "cur3l_status");
  const Cur3H_status = payload.find((item) => item.variable === "cur3h_status");
  const Cur4L_status = payload.find((item) => item.variable === "cur4l_status");
  const Cur4H_status = payload.find((item) => item.variable === "cur4h_status");
  const SENSOR_MODEL = payload.find((item) => item.variable === "sensor_model");
  const FIRMWARE_VERSION = payload.find(
    (item) => item.variable === "firmware_version"
  );
  const FREQUENCY_BAND = payload.find(
    (item) => item.variable === "frequency_band"
  );
  const SUB_BAND = payload.find((item) => item.variable === "sub_band");

  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    DATALOG,
    EXTI_Trigger,
    BAT,
    KEEP_STATUS,
    Current1_A,
    Current2_A,
    Current3_A,
    Current4_A,
    Cur1L_status,
    Cur1H_status,
    Cur2L_status,
    Cur2H_status,
    Cur3L_status,
    Cur3H_status,
    Cur4L_status,
    Cur4H_status,
    SENSOR_MODEL,
    FIRMWARE_VERSION,
    FREQUENCY_BAND,
    SUB_BAND,
    parse_error,
  };
}

describe("Port 2 unit tests", () => {
  const payloadHex = "220020002000020001";
  const port = 2;
  const result = preparePayload(payloadHex, port);

  test("Port 2 variable values", () => {
    expect(result.EXTI_Trigger?.value).toBe("FALSE");
    expect(result.BAT?.value).toBe(0.002);
    expect(result.KEEP_STATUS?.value).toBe("LOW");
    expect(result.Current1_A?.value).toBe(81.92);
    expect(result.Current2_A?.value).toBe(81.92);
    expect(result.Current3_A?.value).toBe(5.12);
    expect(result.Current4_A?.value).toBe(2.56);
    expect(result.Cur1L_status?.value).toBe("False");
    expect(result.Cur1H_status?.value).toBe("False");
    expect(result.Cur2L_status?.value).toBe("False");
    expect(result.Cur2H_status?.value).toBe("False");
    expect(result.Cur3L_status?.value).toBe("False");
    expect(result.Cur3H_status?.value).toBe("False");
    expect(result.Cur4L_status?.value).toBe("False");
    expect(result.Cur4H_status?.value).toBe("False");
  });
});

// removed because of time constraints
// describe("Port 3 unit tests", () => {
//   const payloadHex = "";
//   const port = 3;
//   const result = preparePayload(payloadHex, port);

//   test("Port 3 variable values", () => {
//     expect(result.datalog?.value).toBe("");
//   });
// });

describe("Port 5 unit tests", () => {
  const payloadHex = "33010001000B45";
  const port = 5;
  const result = preparePayload(payloadHex, port);

  test("Port 5 variable values", () => {
    expect(result.SENSOR_MODEL?.value).toBe("CS01-LB");
    expect(result.FIRMWARE_VERSION?.value).toBe("1.0.0");
    expect(result.FREQUENCY_BAND?.value).toBe("EU868");
    expect(result.SUB_BAND?.value).toBe(0);
    expect(result.BAT?.value).toBe(2.885);
  });
});

describe("Shall not be parsed", () => {
  let payload = [
    { variable: "shallnotpass", value: "04096113950292" },
    { variable: "fport", value: 9 },
  ];
  payload = decoderRun(file_path, { payload });
  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([
      { variable: "shallnotpass", value: "04096113950292" },
      { variable: "fport", value: 9 },
    ]);
  });
});
