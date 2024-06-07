/* eslint-disable no-plusplus */
/**
 * Payload Decoder for The Things Network
 *
 * Copyright 2021 Milesight IoT
 *
 * @product AM307 / AM319
 */

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}
function Decoder(bytes) {
  const decoded = {};

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];
    // BATTERY
    if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.battery = bytes[i];
      i += 1;
    }
    // TEMPERATURE
    else if (channel_id === 0x03 && channel_type === 0x67) {
      // ℃
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;

      // ℉
      // decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10 * 1.8 + 32;
      // i +=2;
    }
    // HUMIDITY
    else if (channel_id === 0x04 && channel_type === 0x68) {
      decoded.humidity = bytes[i] / 2;
      i += 1;
    }
    // PIR
    else if (channel_id === 0x05 && channel_type === 0x00) {
      decoded.pir = bytes[i] === 1 ? "trigger" : "idle";
      i += 1;
    }
    // LIGHT
    else if (channel_id === 0x06 && channel_type === 0xcb) {
      decoded.light_level = bytes[i];
      i += 1;
    }
    // CO2
    else if (channel_id === 0x07 && channel_type === 0x7d) {
      decoded.co2 = readUInt16LE(bytes.slice(i, i + 2));
      i += 2;
    }
    // TVOC
    else if (channel_id === 0x08 && channel_type === 0x7d) {
      decoded.tvoc = readUInt16LE(bytes.slice(i, i + 2));
      i += 2;
    }
    // PRESSURE
    else if (channel_id === 0x09 && channel_type === 0x73) {
      decoded.pressure = readUInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;
    }
    // HCHO
    else if (channel_id === 0x0a && channel_type === 0x7d) {
      decoded.hcho = readUInt16LE(bytes.slice(i, i + 2)) / 100;
      i += 2;
    }
    // PM2.5
    else if (channel_id === 0x0b && channel_type === 0x7d) {
      decoded.pm2_5 = readUInt16LE(bytes.slice(i, i + 2));
      i += 2;
    }
    // PM10
    else if (channel_id === 0x0c && channel_type === 0x7d) {
      decoded.pm10 = readUInt16LE(bytes.slice(i, i + 2));
      i += 2;
    }
    // O3
    else if (channel_id === 0x0d && channel_type === 0x7d) {
      decoded.o3 = readUInt16LE(bytes.slice(i, i + 2)) / 100;
      i += 2;
    }
    // BEEP
    else if (channel_id === 0x0e && channel_type === 0x01) {
      decoded.beep = bytes[i] === 1 ? "yes" : "no";
      i += 1;
    } else {
      break;
    }
  }

  return decoded;
}

const ignore_vars = ["metadata", "downlink_url", "fcnt", "port", "raw_packet"];

function toTagoFormat(object_item, serie, prefix = "") {
  const result = [];
  for (const key in object_item) {
    if (ignore_vars.includes(key)) continue;

    if (typeof object_item[key] === "object") {
      result.push({
        variable: object_item[key].variable || `${prefix}${key}`,
        value: object_item[key].value,
        serie: object_item[key].serie || serie,
        metadata: object_item[key].metadata,
        location: object_item[key].location,
        unit: object_item[key].unit,
      });
    } else {
      result.push({
        variable: `${prefix}${key}`,
        value: object_item[key],
        serie,
      });
    }
  }

  return result;
}
const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data" || x.variable === "payload_hex");

if (payload_raw) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(payload_raw.value, "hex");
    const serie = new Date().getTime();
    let payload_aux = Decoder(buffer);
    payload_aux = toTagoFormat(payload_aux, serie);
    payload = payload.concat(payload_aux.map((x) => ({ ...x, serie })));
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
