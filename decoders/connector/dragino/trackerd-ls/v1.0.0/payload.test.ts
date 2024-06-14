/* eslint-disable unicorn/numeric-separators-style */
import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/dragino/trackerd-ls/v1.0.0/payload.ts" as const;

interface location {
  variable?: string;
  value?: string;
  location?: {
    lat?: string;
    lng?: string;
  };
}

type locationType = location | undefined;

interface general {
  variable?: string;
  value?: string;
  unit?: string;
}

type generalType = general | undefined;

function preparePayload(payloadHex, port) {
  let payload = [{ variable: "payload", value: payloadHex } as any, { variable: "fport", value: port }];
  payload = decoderRun(file_path, { payload });
  // port 5
  const sensor_model = payload.find((item) => item.variable === "sensor_model");
  const battery: generalType = payload.find((item) => item.variable === "battery");
  const sensor_mode = payload.find((item) => item.variable === "sensor_mode");
  // port 2
  const humidity = payload.find((item) => item.variable === "humidity");
  const temperature = payload.find((item) => item.variable === "temperature");
  // repeats in multiple ports
  const location: locationType = payload.find((item) => item.variable === "location"); // lat, led_activity 4 byte each
  const alarm = payload.find((item) => item.variable === "alarm");
  const mode_type = payload.find((item) => item.variable === "mode_type");
  const led_activity = payload.find((item) => item.variable === "led_activity");
  // Error parsing
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    // port 5
    sensor_model,
    battery,
    sensor_mode,
    //port 3
    humidity,
    temperature,
    // repeats in multiple ports
    location,
    alarm,
    mode_type,
    led_activity,
    // parse error
    parse_error,
  };
}

describe("Port 5 unit tests", () => {
  const payloadHex = "13014001FF0FA24002";
  const port = 5;
  const result = preparePayload(payloadHex, port);

  test("Port 5 variable values", () => {
    expect(result.sensor_model?.value).toBe("TrackerD");
    expect(result.sensor_model?.metadata?.firmware_version).toBe("1.4.0");
    expect(result.sensor_model?.metadata?.frequency_band).toBe("EU868");
    expect(result.sensor_model?.metadata?.sub_band).toBe("NULL");
    expect(result.battery?.value).toBe(4002);
    expect(result.sensor_mode?.value).toBe("GPS");
    expect(result.sensor_mode?.metadata?.gps_mode).toBe(0);
    expect(result.sensor_mode?.metadata?.ble_mod).toBe(0);
    expect(result.sensor_mode?.metadata?.ack_mode).toBe(0);
    expect(result.sensor_mode?.metadata?.transport_mode).toBe(0);
    expect(result.led_activity?.value).toBe("ON");
  });

  test("Port 5 variable units", () => {
    expect(result.battery?.unit).toBe("mV");
  });
});

describe("Port 3 unit tests", () => {
  const payloadHex = "0158C436020ECEF74B4060";
  const port = 3;
  const result = preparePayload(payloadHex, port);

  test("Port 3 variable values", () => {
    expect(result.location?.value).toBe("22.594614,34.524919");
    expect(result.location?.location?.lat).toBe("22.594614");
    expect(result.location?.location?.lng).toBe("34.524919");
    expect(result.alarm?.value).toBe(true);
    expect(result.battery?.value).toBe(2880);
    expect(result.mode_type?.value).toBe(1);
    expect(result.led_activity?.value).toBe("ON");
  });

  test("Port 3 variable units", () => {
    expect(result.battery?.unit).toBe("mV");
  });
});

describe("Port 2 unit tests", () => {
  const payloadHex = "02863D68FAC29BAF4B45600202011A";
  const port = 2;
  const result = preparePayload(payloadHex, port);

  test("Port 2 variable values", () => {
    expect(result.location?.value).toBe("42.351976,-87.909457");
    expect(result.location?.location?.lat).toBe("42.351976");
    expect(result.location?.location?.lng).toBe("-87.909457");
    expect(result.alarm?.value).toBe(false);
    expect(result.battery?.value).toBe(2885);
    expect(result.mode_type?.value).toBe(1);
    expect(result.led_activity?.value).toBe("ON");
    expect(result.humidity?.value).toBe(51.4);
    expect(result.temperature?.value).toBe(28.2);
  });

  test("Port 2 variable units", () => {
    expect(result.battery?.unit).toBe("mV");
  });
});

describe("Port 7 unit tests", () => {
  const payloadHex = "4FA220";
  const port = 7;
  const result = preparePayload(payloadHex, port);

  test("Port 7 variable values", () => {
    expect(result.alarm?.value).toBe(true);
    expect(result.battery?.value).toBe(4002);
    expect(result.mode_type?.value).toBe(0);
    expect(result.led_activity?.value).toBe("ON");
  });

  test("Port 7 variable units", () => {
    expect(result.battery?.unit).toBe("mV");
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
