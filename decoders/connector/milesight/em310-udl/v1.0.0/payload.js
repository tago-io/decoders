/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
/* eslint-disable no-use-before-define */
/**
 * @product EM310-UDL
 */
function Decoder(bytes, port) {
  const decoded = {};

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];
    // BATTERY
    if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.battery = bytes[i];
      i += 1;
    }
    // DISTANCE
    else if (channel_id === 0x03 && channel_type === 0x82) {
      decoded.distance = readUInt16LE(bytes.slice(i, i + 2));
      i += 2;
    }
    // POSITION
    else if (channel_id === 0x04 && channel_type === 0x00) {
      decoded.position = bytes[i] === 0 ? "normal" : "tilt";
      i += 1;
    } else {
      break;
    }
  }

  return decoded;
}

function readUInt16LE(bytes) {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes) {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
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
