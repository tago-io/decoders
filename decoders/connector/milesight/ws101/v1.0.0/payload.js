/* eslint-disable no-plusplus */
/**
 * Payload Decoder for The Things Network
 *
 * Copyright 2020 Milesight IoT
 *
 * @product VS121
 */

// bytes to number
function readUInt16BE(bytes) {
  const value = (bytes[0] << 8) + bytes[1];
  return value & 0xffff;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

// bytes to version
function readVersion(bytes) {
  const temp = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push((bytes[idx] & 0xff).toString(10));
  }
  return temp.join(".");
}

// bytes to string
function readString(bytes) {
  const temp = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push(`0${(bytes[idx] & 0xff).toString(16)}`.slice(-2));
  }
  return temp.join("");
}

function Decoder(bytes) {
  const decoded = {};

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];

    // PROTOCOL VESION
    if (channel_id === 0xff && channel_type === 0x01) {
      decoded.protocol_version = bytes[i];
      i += 1;
    }
    // SERIAL NUMBER
    else if (channel_id === 0xff && channel_type === 0x08) {
      decoded.sn = readString(bytes.slice(i, i + 6));
      i += 6;
    }
    // HARDWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x09) {
      decoded.hardware_version = readVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // FIRMWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x0a) {
      decoded.firmware_version = readVersion(bytes.slice(i, i + 4));
      i += 4;
    }
    // PEOPLE COUNTER
    else if (channel_id === 0x04 && channel_type === 0xc9) {
      decoded.people_counter_all = bytes[i];
      decoded.region_count = bytes[i + 1];
      const region = readUInt16BE(bytes.slice(i + 2, i + 4));
      for (let idx = 0; idx < decoded.region_count; idx++) {
        const tmp = `region_${idx}`;
        decoded[tmp] = (region > idx) & 1;
      }
      i += 4;
    }
    // PEOPLE IN/OUT
    else if (channel_id === 0x05 && channel_type === 0xcc) {
      decoded.in = readInt16LE(bytes.slice(i, i + 2));
      decoded.out = readInt16LE(bytes.slice(i + 2, i + 4));
      i += 4;
    }
    // PEOPLE MAX
    else if (channel_id === 0x06 && channel_type === 0xcd) {
      decoded.people_max = bytes[i];
      i += 1;
    } else {
      break;
    }
  }

  return decoded;
}

const ignore_vars = [];

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

const payload_raw = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

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

