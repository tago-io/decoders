import { describe, expect, test } from "vitest";

import { decoderRun } from "../../../../../src/functions/decoder-run";

const file_path = "decoders/connector/milesight/ft101/v1.0.0/payload.ts" as const;

function preparePayload(payloadHex: string) {
  let payload = [{ variable: "payload", value: payloadHex }];
  payload = decoderRun(file_path, { payload });

  const longitude = payload.find((item) => item.variable === "longitude");
  const latitude = payload.find((item) => item.variable === "latitude");
  const rssi = payload.find((item) => item.variable === "rssi");
  const snr = payload.find((item) => item.variable === "snr");
  const sf = payload.find((item) => item.variable === "sf");
  const tx_power = payload.find((item) => item.variable === "tx_power");
  const ipso_version = payload.find((item) => item.variable === "ipso_version");
  const hardware_version = payload.find((item) => item.variable === "hardware_version");
  const firmware_version = payload.find((item) => item.variable === "firmware_version");
  const device_status = payload.find((item) => item.variable === "device_status");
  const lorawan_class = payload.find((item) => item.variable === "lorawan_class");
  const sn = payload.find((item) => item.variable === "sn");
  const tsl_version = payload.find((item) => item.variable === "tsl_version");

  return {
    payload,
    longitude,
    latitude,
    rssi,
    snr,
    sf,
    tx_power,
    ipso_version,
    hardware_version,
    firmware_version,
    device_status,
    lorawan_class,
    sn,
    tsl_version,
  };
}

describe("FT101 - Location Data", () => {
  // Location: 03 A1 + 8 bytes (longitude 4 bytes LE, latitude 4 bytes LE)
  // longitude = 116.500722, latitude = 40.000738
  const payloadHex = "03A1F2A8F106E25C6202";
  const result = preparePayload(payloadHex);

  test("Longitude", () => {
    expect(result.longitude?.value).toBeCloseTo(116.500722, 5);
  });

  test("Latitude", () => {
    expect(result.latitude?.value).toBeCloseTo(40.000738, 5);
  });

  test("Has location field", () => {
    expect(result.longitude?.location).toEqual({ lat: 40.000738, lng: 116.500722 });
  });
});

describe("FT101 - Signal Strength", () => {
  // RSSI: 04 A2 + 4 bytes (rssi 2 bytes LE, snr 2 bytes LE)
  // Example: rssi = -85.0 dBm (-850 = 0xFCAE), snr = 7.5 dB (75 = 0x004B)
  // Little endian: AEFC 4B00
  const payloadHex = "04A2AEFC4B00";
  const result = preparePayload(payloadHex);

  test("RSSI", () => {
    expect(result.rssi?.value).toBe(-85);
  });

  test("SNR", () => {
    expect(result.snr?.value).toBe(7.5);
  });
});

describe("FT101 - Spreading Factor", () => {
  // SF: 05 A3 + 1 byte
  // Example: SF = 7
  const payloadHex = "05A307";
  const result = preparePayload(payloadHex);

  test("SF", () => {
    expect(result.sf?.value).toBe(7);
  });
});

describe("FT101 - TX Power", () => {
  // TX Power: 06 A4 + 2 bytes LE (value / 100)
  // Example: 14.0 dBm (1400 = 0x0578)
  // Little endian: 7805
  const payloadHex = "06A47805";
  const result = preparePayload(payloadHex);

  test("TX Power", () => {
    expect(result.tx_power?.value).toBe(14);
  });
});

describe("FT101 - Full Payload", () => {
  // Location + Signal + SF + TX Power
  // Location: 03 A1 F2A8F106 E25C6202 (116.500722, 40.000738)
  // Signal: 04 A2 AEFC 4B00 (-85 dBm, 7.5 dB)
  // SF: 05 A3 07 (SF7)
  // TX Power: 06 A4 7805 (14 dBm)
  const payloadHex = "03A1F2A8F106E25C620204A2AEFC4B0005A30706A47805";
  const result = preparePayload(payloadHex);

  test("Longitude", () => {
    expect(result.longitude?.value).toBeCloseTo(116.500722, 5);
  });

  test("Latitude", () => {
    expect(result.latitude?.value).toBeCloseTo(40.000738, 5);
  });

  test("RSSI", () => {
    expect(result.rssi?.value).toBe(-85);
  });

  test("SNR", () => {
    expect(result.snr?.value).toBe(7.5);
  });

  test("SF", () => {
    expect(result.sf?.value).toBe(7);
  });

  test("TX Power", () => {
    expect(result.tx_power?.value).toBe(14);
  });

  test("All variables have location", () => {
    expect(result.rssi?.location).toEqual({ lat: 40.000738, lng: 116.500722 });
    expect(result.snr?.location).toEqual({ lat: 40.000738, lng: 116.500722 });
    expect(result.sf?.location).toEqual({ lat: 40.000738, lng: 116.500722 });
    expect(result.tx_power?.location).toEqual({ lat: 40.000738, lng: 116.500722 });
  });
});

describe("FT101 - Device Info", () => {
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

describe("FT101 - Serial Number", () => {
  // Serial number: FF 16 + 8 bytes
  const payloadHex = "FF160102030405060708";
  const result = preparePayload(payloadHex);

  test("Serial number", () => {
    expect(result.sn?.value).toBe("0102030405060708");
  });
});

describe("FT101 - TSL Version", () => {
  // TSL version: FF FF 01 02 (v1.2)
  const payloadHex = "FFFF0102";
  const result = preparePayload(payloadHex);

  test("TSL version", () => {
    expect(result.tsl_version?.value).toBe("v1.2");
  });
});

describe("FT101 - Negative Coordinates", () => {
  // Location with negative longitude (Western hemisphere)
  // longitude = -122.346714, latitude = 37.792337
  const payloadHex = "03A12623B5F851AA4002";
  const result = preparePayload(payloadHex);

  test("Negative longitude", () => {
    expect(result.longitude?.value).toBeCloseTo(-122.346714, 5);
  });

  test("Positive latitude", () => {
    expect(result.latitude?.value).toBeCloseTo(37.792337, 5);
  });
});

describe("FT101 - Shall not be parsed", () => {
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
