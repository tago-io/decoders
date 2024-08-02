/**
 * Payload Decoder for The Things Network
 *
 * Copyright 2024 Atomsenses
 *
 * @product AS201
 */

function readdUInt16LE(bytes) {
  const value = (bytes[1] << 8) + Number(bytes[0]);
  return value & 0xffff;
}

function readdInt16LE(bytes) {
  const ref = readdUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

// Main decoder function that decodes the payload
function as201decoder(bytes) {
  const decoded = [] as any;

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];
    // BATTERY
    if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.push({ variable: "battery", value: bytes[i], unit: "%" });
      i += 1;
    }
    // TEMPERATURE
    else if (channel_id === 0x03 && channel_type === 0x67) {
      // ℃
      decoded.push({ variable: "temperature", value: readdInt16LE(bytes.slice(i, i + 2)) / 10, unit: "°C" });
      i += 2;
    }
    // HUMIDITY
    else if (channel_id === 0x04 && channel_type === 0x68) {
      decoded.push({ variable: "humidity", value: bytes[i] / 2, unit: "%RH" });
      i += 1;
    }
    // CO2
    else if (channel_id === 0x07 && channel_type === 0x7d) {
      decoded.push({ variable: "co2", value: readdUInt16LE(bytes.slice(i, i + 2)), unit: "ppm" });
      i += 2;
    } else {
      break;
    }
  }

  return decoded;
}

const as201PayloadData = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

if (as201PayloadData) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(as201PayloadData?.value, "hex");
    const time = Date.now();
    const decodedas201Payload = as201decoder(buffer);
    payload = decodedas201Payload?.map((x) => ({ ...x, time })) ?? [];
  } catch (error: any) {
    // Print the error to the Live Inspector.
    console.error(error);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
