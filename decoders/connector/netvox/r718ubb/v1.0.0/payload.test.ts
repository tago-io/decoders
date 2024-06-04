/* eslint-disable unicorn/numeric-separators-style */
import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/netvox/r718ubb/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex, port) {
  let payload = [
    { variable: "payload", value: payloadHex, unit: "" },
    { variable: "fport", value: port, unit: "" },
  ];
  payload = decoderRun(file_path, { payload });

  const parse_error = payload.find((item) => item.variable === "parse_error");
  const battery = payload.find((item) => item.variable === "battery");
  const sensitivity = payload.find((item) => item.variable === "sensitivity");
  const cmd = payload.find((item) => item.variable === "cmd");
  const status = payload.find((item) => item.variable === "status");
  const min_time = payload.find((item) => item.variable === "min_time");
  const max_time = payload.find((item) => item.variable === "max_time");
  const shock_event = payload.find((item) => item.variable === "shock_event");
  const temperature = payload.find((item) => item.variable === "temperature");
  const humidity = payload.find((item) => item.variable === "humidity");
  const co2 = payload.find((item) => item.variable === "co2");
  const air_pressure = payload.find((item) => item.variable === "air_pressure");
  const illuminance = payload.find((item) => item.variable === "illuminance");
  const multipler = payload.find((item) => item.variable === "multipler");
  const divisor = payload.find((item) => item.variable === "divisor");
  const delta_value = payload.find((item) => item.variable === "delta_value");
  const channel = payload.find((item) => item.variable === "channel");
  const failure = payload.find((item) => item.variable === "failure");
  const sensor_type = payload.find((item) => item.variable === "sensor_type");

  return {
    payload,
    battery,
    sensitivity,
    cmd,
    status,
    min_time,
    max_time,
    shock_event,
    temperature,
    humidity,
    co2,
    air_pressure,
    illuminance,
    multipler,
    divisor,
    delta_value,
    channel,
    failure,
    sensor_type,
    parse_error,
  };
}

describe("Port 6, 0x01, unit tests", () => {
  const payloadHex = "01BB0124097A151F020C01";
  const port = 6;
  const result = preparePayload(payloadHex, port);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.battery?.value).toBe(3.6);
    expect(result.temperature?.value).toBe(24.26);
    expect(result.humidity?.value).toBe(54.07);
    expect(result.co2?.value).toBe(524);
    expect(result.shock_event?.value).toBe("shock");
  });
});

describe("Port 6, 0x02, unit tests", () => {
  const payloadHex = "01BB02240001870F000032";
  const port = 6;
  const result = preparePayload(payloadHex, port);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check variable values", () => {
    expect(result.battery?.value).toBe(3.6);
    expect(result.air_pressure?.value).toBe(1001.11);
    expect(result.illuminance?.value).toBe(50);
  });
});

describe("Port 7, 0x81, unit tests", () => {
  const payloadHex = "81BB010000000000000000";
  const port = 7;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("config_report_rsp");
    expect(result.status?.value).toBe("failure");
  });
});

describe("Port 7, 0x82, unit tests", () => {
  const payloadHex = "82BB012C03840000000000";
  const port = 7;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("read_config_report_rsp");
    expect(result.min_time?.value).toBe(300);
    expect(result.max_time?.value).toBe(900);
  });
});

describe("Port 7, 0x83, unit tests", () => {
  const payloadHex = "83BB000000000000000000";
  const port = 7;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("calibrate_co2_rsp");
    expect(result.status?.value).toBe("success");
  });
});

describe("Port 7, 0x84, unit tests", () => {
  const payloadHex = "84BB000000000000000000";
  const port = 7;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("set_shock_sensor_sensitivity_rsp");
    expect(result.status?.value).toBe("success");
  });
});

describe("Port 7, 0x85, unit tests", () => {
  const payloadHex = "85BB0A0000000000000000";
  const port = 7;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("get_shock_sensor_sensitivity_rsp");
    expect(result.sensitivity?.value).toBe(10);
  });
});

describe("Port 14, 0x81, unit tests", () => {
  const payloadHex = "8106000000000000000000";
  const port = 14;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("set_global_calibrate_rsp");
    expect(result.channel?.value).toBe(0);
    expect(result.sensor_type?.value).toBe("co2");
    expect(result.status?.value).toBe("success");
  });
});

describe("Port 14, 0x82, unit tests", () => {
  const payloadHex = "8206000001000100640000";
  const port = 14;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("get_global_calibrate_rsp");
    expect(result.sensor_type?.value).toBe("co2");
    expect(result.channel?.value).toBe(0);
    expect(result.multipler?.value).toBe(1);
    expect(result.divisor?.value).toBe(1);
    expect(result.delta_value?.value).toBe(100);
  });
});

describe("Port 14, 0x83, unit tests", () => {
  const payloadHex = "8300000000000000000000";
  const port = 14;
  const result = preparePayload(payloadHex, port);

  test("Output Result", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("results", () => {
    expect(result.cmd?.value).toBe("clear_global_calibrate_rsp");
    expect(result.status?.value).toBe("success");
  });
});
