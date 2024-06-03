/* eslint-disable unicorn/numeric-separators-style */
// added to redo github actions
import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/dragino/trackerd/v1.0.0/payload.ts" as const;

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
  let payload = [
    { variable: "payload", value: payloadHex },
    { variable: "fport", value: port },
  ];
  payload = decoderRun(file_path, { payload });
  //port 8
  const service_set_identifier = payload.find((item) => item.variable === "service_set_identifier");
  // port 6
  const universally_unique_identifier = payload.find((item) => item.variable === "universally_unique_identifier");
  const ibeacon_major = payload.find((item) => item.variable === "ibeacon_major");
  const ibeacon_minor = payload.find((item) => item.variable === "ibeacon_minor");
  const ibeacon_power = payload.find((item) => item.variable === "ibeacon_power");
  // port 5
  const sensor_model = payload.find((item) => item.variable === "sensor_model");
  const firmware_version = payload.find((item) => item.variable === "firmware_version");
  const frequency_band = payload.find((item) => item.variable === "frequency_band");
  const sub_band = payload.find((item) => item.variable === "sub_band");
  const battery: generalType = payload.find((item) => item.variable === "battery");
  const sensor_mode = payload.find((item) => item.variable === "sensor_mode");
  const ack_mode = payload.find((item) => item.variable === "ack_mode");
  const transport_mode = payload.find((item) => item.variable === "transport_mode");
  // Post 4
  const date = payload.find((item) => item.variable === "date");
  const time = payload.find((item) => item.variable === "time");
  // port 3
  // port 2
  const humidity = payload.find((item) => item.variable === "humidity");
  const temperature = payload.find((item) => item.variable === "temperature");
  // repeats in multiple ports
  const location: locationType = payload.find((item) => item.variable === "location"); // lat, led_activity 4 byte each
  const received_signal_strength_indication = payload.find((item) => item.variable === "received_signal_strength_indication");
  const alarm = payload.find((item) => item.variable === "alarm");
  const mode_type = payload.find((item) => item.variable === "mode_type");
  const led_activity = payload.find((item) => item.variable === "led_activity");
  // Error parsing
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    // port 8
    service_set_identifier,
    // port 6
    universally_unique_identifier,
    ibeacon_major,
    ibeacon_minor,
    ibeacon_power,
    // port 5
    sensor_model,
    firmware_version,
    frequency_band,
    sub_band,
    battery,
    sensor_mode,
    ack_mode,
    transport_mode,
    // port 4
    date,
    time,
    //port 3
    // port 2
    humidity,
    temperature,
    // repeats in multiple ports
    location,
    received_signal_strength_indication,
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
    expect(result.firmware_version?.value).toBe("1.4.0");
    expect(result.frequency_band?.value).toBe("EU868");
    expect(result.sub_band?.value).toBe("NULL");
    expect(result.battery?.value).toBe(4002);
    expect(result.sensor_mode?.value).toBe("GPS");
    expect(result.ack_mode?.value).toBe(0);
    expect(result.led_activity?.value).toBe("ON");
    expect(result.transport_mode?.value).toBe(0);
  });

  test("Port 5 variable units", () => {
    expect(result.battery?.unit).toBe("mV");
  });
});

describe("Port 8 unit tests", () => {
  const payloadHex = "747261636b0a67872398234512";
  const port = 8;
  const result = preparePayload(payloadHex, port);

  test("Port 8 variable values", () => {
    expect(result.service_set_identifier?.value).toBe("747261636b0a"); // 747261636B0A
    expect(result.received_signal_strength_indication?.value).toBe(103);
    expect(result.alarm?.value).toBe(false);
    expect(result.mode_type?.value).toBe(2);
    expect(result.led_activity?.value).toBe("OFF");
  });

  test("Port 8 variable units", () => {
    expect(result.battery?.unit).toBe("mV");
  });
});

describe("Port 6 unit tests", () => {
  const payloadHex = "d1dd1dd6a34211eda8fc0242ac1200022EF648622EF50FE2302349739802153801";
  const port = 6;
  const result = preparePayload(payloadHex, port);

  test("Port 6 variable values", () => {
    expect(result.universally_unique_identifier?.value).toBe("d1dd1dd6a34211eda8fc0242ac120002");
    expect(result.ibeacon_major?.value).toBe(787892322);
    expect(result.ibeacon_minor?.value).toBe(787812322);
    expect(result.ibeacon_power?.value).toBe(12323);
    expect(result.received_signal_strength_indication?.value).toBe(1232312322);
    expect(result.battery?.value).toBe(5432);
    expect(result.alarm?.value).toBe(false);
    expect(result.mode_type?.value).toBe(0);
    expect(result.led_activity?.value).toBe("OFF");
  });
  // universally_unique_identifier example value
  // d1dd1dd6-a342-11ed-a8fc-0242ac120002

  test("Port 6 variable units", () => {
    expect(result.battery?.unit).toBe("mV");
  });
});

describe("Port 4 unit tests", () => {
  const payloadHex = "0158c436020ECEF707E70101010101";
  const port = 4;
  const result = preparePayload(payloadHex, port);

  test("Port 4 variable values", () => {
    expect(result.date?.value).toBe("01:01:2023");
    expect(result.time?.value).toBe("01:01:01");
    expect(result.location?.value).toBe("22.594614,34.524919");
    expect(result.location?.location?.lat).toBe("22.594614");
    expect(result.location?.location?.lng).toBe("34.524919");
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
