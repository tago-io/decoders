/* eslint-disable unicorn/number-literal-case */

// Helper functions to read different types of data from buffer
function readdUInt16LE(bytes) {
  const value = (bytes[1] << 8) + Number(bytes[0]);
  return value & 0xffff;
}

function readdInt16LE(bytes) {
  const ref = readdUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

// Main decoder function that decodes the payload
function am104decoder(bytes) {
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
    // PIR
    else if (channel_id === 0x05 && channel_type === 0x6a) {
      decoded.push({ variable: "motion_detection", value: readdUInt16LE(bytes.slice(i, i + 2)) });
      i += 2;
    }
    // LIGHT
    else if (channel_id === 0x06 && channel_type === 0x65) {
      decoded.push({
        variable: "illumination",
        value: readdUInt16LE(bytes.slice(i, i + 2)),
        unit: "lux",
        metadata: { infrared_and_visible: readdUInt16LE(bytes.slice(i + 2, i + 4)), infrared: readdUInt16LE(bytes.slice(i + 4, i + 6)) },
      });
      i += 6;
    } else {
      break;
    }
  }

  return decoded;
}

const am104PayloadData = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

if (am104PayloadData) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(am104PayloadData?.value, "hex");
    const time = Date.now();
    const decodedam104Payload = am104decoder(buffer);
    payload = decodedam104Payload?.map((x) => ({ ...x, time })) ?? [];
  } catch (error: any) {
    // Print the error to the Live Inspector.
    console.error(error);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
