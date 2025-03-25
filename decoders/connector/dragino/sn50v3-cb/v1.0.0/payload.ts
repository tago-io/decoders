/* eslint-disable no-plusplus */
// @ts-nocheck

/**
 * Parses the JSON format payload and returns an array of data objects.
 */
function parseJsonPayload(payload: object) {
  const unitMap = {
    battery: "mV",
    signal: "dBm",
    ds18b20_temp: "°C",
  };

  const result = [];

  for (const [key, value] of Object.entries(payload)) {
    const variableName = key.toLowerCase();

    const entry = {
      variable: variableName,
      value: typeof value === "object" ? JSON.stringify(value) : value,
    };

    if (unitMap[variableName]) {
      entry.unit = unitMap[variableName];
    }

    result.push(entry);
  }

  return result;
}

/**
 * Parses the HEX format payload (CFGMOD=1) and returns an array of data objects.
 */
function parseHexPayload(hexString: string) {
  /* Helper functions to convert hex to decimal and parse timestamps */
  const hexToDecimal = (hex) => parseInt(hex, 16);
  const parseTimestamp = (hex) => new Date(hexToDecimal(hex) * 1000).toISOString();

  const buffer = Buffer.from(hexString, "hex");
  const data = [];

  // Device ID (IMEI)
  const imeiHex = buffer.slice(0, 8).toString("hex");
  const imei = imeiHex.startsWith("f") ? imeiHex.substring(1) : imeiHex; // Remove the leading 'f' if it exists and keep as hex string
  data.push({ variable: "device_id", value: imei });

  // SIM Card ID (IMSI)
  const imsiHex = buffer.slice(8, 16).toString("hex");
  const imsi = imsiHex.startsWith("f") ? imsiHex.substring(1) : imsiHex; // Remove the leading 'f' if it exists and keep as hex string
  data.push({ variable: "sim_card_id", value: imsi });

  // Version
  const version = buffer[16];
  data.push({ variable: "version", value: `SN50v3-CB, ${version}=1.1.0` });

  // Battery
  const battery = buffer.readUInt16BE(18);
  data.push({ variable: "battery", value: battery / 1000, unit: "V" });

  // Signal
  const signal = buffer[20];
  data.push({ variable: "signal", value: signal });

  // Model
  const model = buffer[21];
  data.push({ variable: "model", value: model });

  // Temperature by DS18b20
  const tempDS18b20 = buffer.readUInt16BE(22);
  const tempDS18b20Value = tempDS18b20 === 0xffff ? null : tempDS18b20 / 10;
  data.push({ variable: "temperature", value: tempDS18b20Value, unit: "°C" });

  // PA4 Level
  const pa4Level = buffer[24];
  data.push({ variable: "pa4_level", value: pa4Level });

  // Interrupt
  const interrupt = buffer[25];
  data.push({ variable: "interrupt", value: interrupt });

  // Interrupt Level
  const interruptLevel = buffer[26];
  data.push({ variable: "interrupt_level", value: interruptLevel });

  // ADC
  const adc = buffer.readUInt16BE(27);
  data.push({ variable: "adc", value: adc });

  // Temperature by SHT20/SHT31
  const tempSHT = buffer.readUInt16BE(29);
  data.push({ variable: "temperature_sht", value: tempSHT / 10, unit: "°C" });

  // Humidity by SHT20/SHT31
  const humiditySHT = buffer.readUInt16BE(31);
  data.push({ variable: "humidity_sht", value: humiditySHT / 10, unit: "%rh" });

  // Timestamp
  const timestamp = buffer.slice(33, 37).toString("hex");
  data.push({ variable: "timestamp", value: parseTimestamp(timestamp) });

  // Latitude
  const latitude = buffer.readInt32BE(37);
  const latitudeValue = latitude === 0 ? null : latitude / 1000000;
  data.push({ variable: "latitude", value: latitudeValue });

  // Longitude
  const longitude = buffer.readInt32BE(41);
  const longitudeValue = longitude === 0 ? null : longitude / 1000000;
  data.push({ variable: "longitude", value: longitudeValue });

  // GPS Timestamp
  const gpsTimestamp = buffer.slice(45, 49).toString("hex");
  const gpsTimestampValue = gpsTimestamp === "00000000" ? null : parseTimestamp(gpsTimestamp);
  data.push({ variable: "gps_timestamp", value: gpsTimestampValue });

  return data;
}

let payloadData = null;
let originalPayload = payload;

payloadData = payload.find((x) => ["payload_raw", "payload", "data"].includes(x.variable))?.value;

if (!payloadData && Array.isArray(payload)) {
  const isMqtt = (obj) => obj && typeof obj === "object" && obj.IMEI && (obj.Model || obj.IMSI);

  if (Array.isArray(payload[0]) && payload[0].length > 0) {
    const potentialDevice = payload[0][0];
    if (isMqtt(potentialDevice)) {
      payloadData = potentialDevice;
    }
  } else if (isMqtt(payload[0])) {
    payloadData = payload[0];
  }
}

if (payloadData) {
  let parsedData = [];

  try {
    if (typeof payloadData === "string") {
      if (payloadData.includes("IMEI")) {
        // Try to parse JSON string with IMEI
        const jsonPayload = JSON.parse(payloadData);
        parsedData = parseJsonPayload(jsonPayload);
      } else {
        // Assume it's a hex payload
        parsedData = parseHexPayload(payloadData);
      }
    } else if (typeof payloadData === "object" && payloadData.IMEI) {
      // Already parsed object with IMEI
      parsedData = parseJsonPayload(payloadData);
    }
  } catch (error) {
    console.error(error);
    payload = [{ variable: "parse_error", value: error.message }];
  }

  payload = parsedData;
}
