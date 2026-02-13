import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/milesight/am308/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex }];
  payload = decoderRun(file_path, { payload });

  const battery = payload.find((item) => item.variable === "battery");
  const temperature = payload.find((item) => item.variable === "temperature");
  const humidity = payload.find((item) => item.variable === "humidity");
  const pir = payload.find((item) => item.variable === "pir");
  const light_level = payload.find((item) => item.variable === "light_level");
  const co2 = payload.find((item) => item.variable === "co2");
  const tvoc = payload.find((item) => item.variable === "tvoc");
  const pressure = payload.find((item) => item.variable === "pressure");
  const pm2_5 = payload.find((item) => item.variable === "pm2_5");
  const pm10 = payload.find((item) => item.variable === "pm10");
  const buzzer_status = payload.find((item) => item.variable === "buzzer_status");
  const ipso_version = payload.find((item) => item.variable === "ipso_version");
  const hardware_version = payload.find((item) => item.variable === "hardware_version");
  const firmware_version = payload.find((item) => item.variable === "firmware_version");
  const device_status = payload.find((item) => item.variable === "device_status");
  const lorawan_class = payload.find((item) => item.variable === "lorawan_class");
  const sn = payload.find((item) => item.variable === "sn");

  return {
    payload,
    battery,
    temperature,
    humidity,
    pir,
    light_level,
    co2,
    tvoc,
    pressure,
    pm2_5,
    pm10,
    buzzer_status,
    ipso_version,
    hardware_version,
    firmware_version,
    device_status,
    lorawan_class,
    sn,
  };
}

describe("AM308 - Real Payload Example", () => {
  // 0367EE00 04687C 050001 06CB02 077DA803 087D2500 09736627 0B7D2000 0C7D3000
  const payloadHex = "0367EE0004687C05000106CB02077DA803087D250009736627 0B7D20000C7D3000".replace(/\s/g, "");
  const result = preparePayload(payloadHex);

  test("Temperature", () => {
    expect(result.temperature?.value).toBe(23.8);
  });

  test("Humidity", () => {
    expect(result.humidity?.value).toBe(62);
  });

  test("PIR status", () => {
    expect(result.pir?.value).toBe("trigger");
  });

  test("Light level", () => {
    expect(result.light_level?.value).toBe(2);
  });

  test("CO2", () => {
    expect(result.co2?.value).toBe(936);
  });

  test("TVOC", () => {
    expect(result.tvoc?.value).toBe(0.37);
  });

  test("Pressure", () => {
    expect(result.pressure?.value).toBe(1008.6);
  });

  test("PM2.5", () => {
    expect(result.pm2_5?.value).toBe(32);
  });

  test("PM10", () => {
    expect(result.pm10?.value).toBe(48);
  });
});

describe("AM308 - Basic Sensor Data", () => {
  // Battery: 01 75 64 (100%)
  // Temperature: 03 67 FF 00 (25.5°C = 255/10)
  // Humidity: 04 68 64 (50% = 100/2)
  // PIR: 05 00 00 (idle)
  // Light: 06 CB 03 (level 3)
  // CO2: 07 7D 20 03 (800 ppm)
  // TVOC: 08 7D 96 00 (1.5 iaq = 150/100)
  // Pressure: 09 73 94 27 (1013.2 hPa = 10132/10)
  // PM2.5: 0B 7D 23 00 (35 µg/m³)
  // PM10: 0C 7D 2D 00 (45 µg/m³)
  const payloadHex = "0175640367FF00046864050000 06CB03077D2003087D9600097394270B7D23000C7D2D00".replace(/\s/g, "");
  const result = preparePayload(payloadHex);

  test("Battery", () => {
    expect(result.battery?.value).toBe(100);
  });

  test("Temperature", () => {
    expect(result.temperature?.value).toBe(25.5);
  });

  test("Humidity", () => {
    expect(result.humidity?.value).toBe(50);
  });

  test("PIR status", () => {
    expect(result.pir?.value).toBe("idle");
  });

  test("Light level", () => {
    expect(result.light_level?.value).toBe(3);
  });

  test("CO2", () => {
    expect(result.co2?.value).toBe(800);
  });

  test("TVOC", () => {
    expect(result.tvoc?.value).toBe(1.5);
  });

  test("Pressure", () => {
    expect(result.pressure?.value).toBe(1013.2);
  });

  test("PM2.5", () => {
    expect(result.pm2_5?.value).toBe(35);
  });

  test("PM10", () => {
    expect(result.pm10?.value).toBe(45);
  });
});

describe("AM308 - PIR Trigger", () => {
  // PIR: 05 00 01 (trigger)
  const payloadHex = "050001";
  const result = preparePayload(payloadHex);

  test("PIR trigger", () => {
    expect(result.pir?.value).toBe("trigger");
  });
});

describe("AM308 - Buzzer Status", () => {
  // Buzzer on: 0E 01 01
  const payloadHex = "0E0101";
  const result = preparePayload(payloadHex);

  test("Buzzer on", () => {
    expect(result.buzzer_status?.value).toBe("on");
  });
});

describe("AM308 - Buzzer Off", () => {
  // Buzzer off: 0E 01 00
  const payloadHex = "0E0100";
  const result = preparePayload(payloadHex);

  test("Buzzer off", () => {
    expect(result.buzzer_status?.value).toBe("off");
  });
});

describe("AM308 - Negative Temperature", () => {
  // Temperature: 03 67 EC FF (-2.0°C = -20 in int16 LE = 0xFFEC)
  const payloadHex = "0367ECFF";
  const result = preparePayload(payloadHex);

  test("Negative temperature", () => {
    expect(result.temperature?.value).toBe(-2);
  });
});

describe("AM308 - Device Info", () => {
  // IPSO version: FF 01 10 (v1.0)
  // Hardware version: FF 09 10 20 (v10.2)
  // Firmware version: FF 0A 01 02 (v1.2)
  // Device status: FF 0B 01 (on)
  // LoRaWAN class: FF 0F 00 (Class A)
  const payloadHex = "FF0110FF091020FF0A0102FF0B01FF0F00";
  const result = preparePayload(payloadHex);

  test("IPSO version", () => {
    expect(result.ipso_version?.value).toBe("v1.0");
  });

  test("Hardware version", () => {
    expect(result.hardware_version?.value).toBe("v10.2");
  });

  test("Firmware version", () => {
    expect(result.firmware_version?.value).toBe("v1.2");
  });

  test("Device status", () => {
    expect(result.device_status?.value).toBe("on");
  });

  test("LoRaWAN class", () => {
    expect(result.lorawan_class?.value).toBe("Class A");
  });
});

describe("AM308 - Serial Number", () => {
  // Serial number: FF 16 + 8 bytes
  const payloadHex = "FF160102030405060708";
  const result = preparePayload(payloadHex);

  test("Serial number", () => {
    expect(result.sn?.value).toBe("0102030405060708");
  });
});

describe("AM308 - TVOC µg/m³ Unit", () => {
  // TVOC µg/m³: 08 E6 C8 00 (200 µg/m³)
  const payloadHex = "08E6C800";
  const result = preparePayload(payloadHex);

  test("TVOC in µg/m³", () => {
    expect(result.tvoc?.value).toBe(200);
  });
});

describe("AM308 - Shall not be parsed", () => {
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
