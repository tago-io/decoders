import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/tektelic/seal/v1.0.0/payload.js";

function preparePayload(payloadHex: string, payloadPort: number) {
  let payload = [
    { variable: "payload", value: payloadHex },
    { variable: "port", value: payloadPort },
  ];
  payload = decoderRun(file_path, { payload });
  const port = payload.find((item) => item.variable === "port");
  // port 10
  const atmospheric_pressure = payload.find(
    (item) => item.variable === "barometric_pressure"
  );
  const acceleration_x = payload.find(
    (item) => item.variable === "acceleration_vector_acceleration_x"
  );
  const acceleration_y = payload.find(
    (item) => item.variable === "acceleration_vector_acceleration_y"
  );
  const acceleration_z = payload.find(
    (item) => item.variable === "acceleration_vector_acceleration_z"
  );
  const temperature = payload.find((item) => item.variable === "temperature");

  // port 16
  const num_satellites = payload.find(
    (item) => item.variable === "num_satellites"
  );
  const avg_satellite_snr = payload.find(
    (item) => item.variable === "avg_satellite_snr"
  );
  const fix_type = payload.find((item) => item.variable === "fix_type");
  const time_to_fix = payload.find((item) => item.variable === "time_to_fix");
  const gnss_vertical_accuracy = payload.find(
    (item) => item.variable === "fix_accuracy_gnss_vertical_accuracy"
  );
  const gnss_horizontal_accuracy = payload.find(
    (item) => item.variable === "fix_accuracy_gnss_horizontal_accuracy"
  );
  const ground_speed_accuracy = payload.find(
    (item) => item.variable === "ground_speed_accuracy"
  );
  const num_of_fixes = payload.find((item) => item.variable === "num_of_fixes");
  const log_num = payload.find((item) => item.variable === "log_num");
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    port,
    num_satellites,
    avg_satellite_snr,
    fix_type,
    time_to_fix,
    gnss_vertical_accuracy,
    gnss_horizontal_accuracy,
    ground_speed_accuracy,
    num_of_fixes,
    log_num,
    atmospheric_pressure,
    acceleration_x,
    acceleration_y,
    acceleration_z,
    temperature,
    parse_error,
  };
}

describe("Port 16 decode", () => {
  test("Should decode the payload correctly", () => {
    const payloadHex =
      "0D3C080D6401830D95030D9600080D97001E00110D980000033F0D99020D0F052F";
    const payloadPort = 16;

    const result = preparePayload(payloadHex, payloadPort);

    expect(result.port?.value).toBe(16);
    expect(result.num_satellites?.value).toBe(8);
    expect(result.avg_satellite_snr?.value).toBe(38.7);
    expect(result.fix_type?.value).toBe("3D Fix");
    expect(result.time_to_fix?.value).toBe(8);
    expect(result.gnss_vertical_accuracy?.value).toBe("30.00");
    expect(result.gnss_horizontal_accuracy?.value).toBe("17.00");
    expect(result.ground_speed_accuracy?.value).toBe("0.831");
    expect(result.num_of_fixes?.value).toBe(2);
    expect(result.log_num?.value).toBe(1327);
  });
});

describe("Port 10 decode", () => {
  test("Should decode the payload correctly", () => {
    const payloadHex = "0073235600710101010101010067012A";
    const payloadPort = 10;

    const result = preparePayload(payloadHex, payloadPort);

    expect(result.port?.value).toBe(10);
    expect(result.atmospheric_pressure?.value).toBe("904.6");
    expect(result.acceleration_x?.value).toBe("0.257");
    expect(result.acceleration_y?.value).toBe("0.257");
    expect(result.acceleration_z?.value).toBe("0.257");
    expect(result.temperature?.value).toBe("29.8");
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
