/* eslint-disable unicorn/numeric-separators-style */
import { describe, test, expect } from "vitest";
import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/dragino/wsc1-l/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex, port) {
  let payload = [
    { variable: "payload", value: payloadHex, unit: "" },
    { variable: "fport", value: port, unit: "" },
  ];
  payload = decoderRun(file_path, { payload });
  // port 5
  const sensor_model = payload.find((item) => item.variable === "sensor_model");
  const firmware_version = payload.find((item) => item.variable === "firmware_version");
  const frequency_band = payload.find((item) => item.variable === "frequency_band");
  const sub_band = payload.find((item) => item.variable === "sub_band");
  const battery = payload.find((item) => item.variable === "battery");
  const weather_sensor_types = payload.find((item) => item.variable === "weather_sensor_types");
  // port 2
  const wind_speed = payload.find((item) => item.variable === "wind_speed");
  const wind_direction = payload.find((item) => item.variable === "wind_direction");
  const wind_direction_angle = payload.find((item) => item.variable === "wind_direction_angle");
  const illumination = payload.find((item) => item.variable === "illumination");
  const rain_snow = payload.find((item) => item.variable === "rain_snow");
  const carbon_dioxide = payload.find((item) => item.variable === "carbon_dioxide");
  const temperature = payload.find((item) => item.variable === "temperature");
  const humidity = payload.find((item) => item.variable === "humidity");
  const pressure = payload.find((item) => item.variable === "pressure");
  const rain_gauge = payload.find((item) => item.variable === "rain_gauge");
  const pm2_5 = payload.find((item) => item.variable === "pm2_5");
  const pm10 = payload.find((item) => item.variable === "pm10");
  const par = payload.find((item) => item.variable === "par");
  const tsr = payload.find((item) => item.variable === "tsr");
  // Error parsing
  const parse_error = payload.find((item) => item.variable === "parse_error");
  return {
    payload,
    sensor_model,
    firmware_version,
    frequency_band,
    sub_band,
    battery,
    weather_sensor_types,
    wind_speed,
    wind_direction,
    wind_direction_angle,
    illumination,
    rain_snow,
    carbon_dioxide,
    temperature,
    humidity,
    pressure,
    rain_gauge,
    pm2_5,
    pm10,
    par,
    tsr,
    parse_error,
  };
}

describe("Port 5 unit tests", () => {
  const payloadHex = "0D010001000BD61000FE";
  const port = 5;
  const result = preparePayload(payloadHex, port);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check port 5, if variable exists", () => {
    expect(result.sensor_model).toBeTruthy();
    expect(result.firmware_version).toBeTruthy();
    expect(result.frequency_band).toBeTruthy();
    expect(result.sub_band).toBeTruthy();
    expect(result.battery).toBeTruthy();
    expect(result.weather_sensor_types).toBeTruthy();
  });

  test("Check port 5, variable values", () => {
    expect(result.sensor_model?.value).toBe("WSC1-L");
    expect(result.firmware_version?.value).toBe("1.0.0");
    expect(result.frequency_band?.value).toBe("EU868");
    expect(result.sub_band?.value).toBe(0);
    expect(result.battery?.value).toBe(3.03);
    expect(result.weather_sensor_types?.value).toBe("1000fe");
  });

  test("Check port 5, variable units", () => {
    expect(result.battery?.unit).toBe("V");
  });
});

describe("Port 2 unit tests", () => {
  const payloadHex = "0103001402020302C903030211900402000A0502021C060200FA0702026208022763090200000A0200230B02002D0C0200B30D020073";
  const port = 2;
  const result = preparePayload(payloadHex, port);

  test("Output result is type: array", () => {
    expect(Array.isArray(result.payload)).toBe(true);
  });

  test("Check port 2, if variable exists", () => {
    expect(result.wind_speed).toBeTruthy();
    expect(result.wind_direction_angle).toBeTruthy();
    expect(result.illumination).toBeTruthy();
    expect(result.rain_snow).toBeTruthy();
    expect(result.carbon_dioxide).toBeTruthy();
    expect(result.temperature).toBeTruthy();
    expect(result.humidity).toBeTruthy();
    expect(result.pressure).toBeTruthy();
    expect(result.rain_gauge).toBeTruthy();
    expect(result.pm2_5).toBeTruthy();
    expect(result.pm10).toBeTruthy();
    expect(result.par).toBeTruthy();
    expect(result.tsr).toBeTruthy();
  });

  test("Check port 2, variable values", () => {
    expect(result.wind_speed?.value).toBe(2);
    expect(result.wind_direction_angle?.value).toBe(71.3);
    expect(result.wind_direction?.value).toBe("ENE");
    expect(result.illumination?.value).toBe(44960);
    expect(result.rain_snow?.value).toBe(0);
    expect(result.carbon_dioxide?.value).toBe(540);
    expect(result.temperature?.value).toBe(25);
    expect(result.humidity?.value).toBe(61);
    expect(result.pressure?.value).toBe(1008.3);
    expect(result.rain_gauge?.value).toBe(0);
    expect(result.pm2_5?.value).toBe(35);
    expect(result.pm10?.value).toBe(45);
    expect(result.par?.value).toBe(179);
    expect(result.tsr?.value).toBe(11.5);
  });

  test("Check port 2, variable units", () => {
    expect(result.wind_speed?.unit).toBe("m/s");
    expect(result.wind_direction_angle?.unit).toBe("°");
    expect(result.illumination?.unit).toBe("lux");
    expect(result.carbon_dioxide?.unit).toBe("ppm");
    expect(result.temperature?.unit).toBe("°C");
    expect(result.humidity?.unit).toBe("%RH");
    expect(result.pressure?.unit).toBe("hPa");
    expect(result.rain_gauge?.unit).toBe("mm");
    expect(result.pm2_5?.unit).toBe("µg/m³");
    expect(result.pm10?.unit).toBe("µg/m³");
    expect(result.par?.unit).toBe("µmol/m²·s");
    expect(result.tsr?.unit).toBe("W/m²");
  });
});

describe("Error handling", () => {
  test("Output should be an error related to the port", () => {
    const payloadHexSoil = "621D8336A2378C";
    const port = 0;
    const result = preparePayload(payloadHexSoil, port);
    expect(result.parse_error?.value).toBe("Unknown port");
  });

  test("Output should be an error related to the payload length in port 5", () => {
    const payloadHexSoil = "123123";
    const port = 5;
    const result = preparePayload(payloadHexSoil, port);
    expect(result.parse_error?.value).toBe("Incorrect hexadecimal payload length");
  });

  test("Output should be an error related to the payload length in port 2", () => {
    const payloadHexSoil = "123123";
    const port = 2;
    const result = preparePayload(payloadHexSoil, port);
    expect(result.parse_error?.value).toBe("Incorrect hexadecimal payload length");
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
