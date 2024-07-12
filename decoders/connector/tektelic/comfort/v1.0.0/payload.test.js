import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/tektelic/comfort/v1.0.0/payload.js";

function preparePayload(payloadHex, payloadPort) {
  let payload = [
    { variable: "payload", value: payloadHex },
    { variable: "port", value: payloadPort },
  ];
  payload = decoderRun(file_path, { payload });

  const ambient_temperature = payload.find(
    (item) => item.variable === "ambient_temperature"
  );
  const relative_humidity = payload.find(
    (item) => item.variable === "relative_humidity"
  );
  const hall_effect_state = payload.find(
    (item) => item.variable === "hall_effect_state"
  );
  const hall_effect_count = payload.find(
    (item) => item.variable === "hall_effect_count"
  );
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    ambient_temperature,
    relative_humidity,
    hall_effect_state,
    hall_effect_count,
    parse_error,
  };
}

describe("Temperature and Humidity", () => {
  test("Should decode the payload correctly", () => {
    const payloadHex = "0367000A046828";
    const payloadPort = 10;

    const result = preparePayload(payloadHex, payloadPort);

    expect(result.parse_error).toBe(undefined);
    expect(result.ambient_temperature?.value).toBe("1.0");
    expect(result.relative_humidity?.value).toBe("20.0");
  });
});

describe("Temperature, Humidity, and Hall effect", () => {
  test("Should decode the payload correctly", () => {
    const payloadHex = "0468140100FF08040005";
    const payloadPort = 10;

    const result = preparePayload(payloadHex, payloadPort);

    expect(result.parse_error).toBe(undefined);
    expect(result.relative_humidity?.value).toBe("10.0");
    expect(result.hall_effect_state?.value).toBe("Magnet Absent");
    expect(result.hall_effect_count?.value).toBe(5);
  });
});

describe("Shall not be parsed", () => {
  let payload = [{ variable: "shallnotpass", value: "04096113950292" }];
  payload = decoderRun(file_path, { payload });

  test("Output Result", () => {
    expect(Array.isArray(payload)).toBe(true);
  });

  test("Not parsed Result", () => {
    expect(payload).toEqual([
      { variable: "shallnotpass", value: "04096113950292" },
    ]);
  });
});
