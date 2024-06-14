function EM400tldReadUInt16LE(bytes) {
  const value = (bytes[1] << 8) + Number(bytes[0]);
  return value & 0xffff;
}

function EM400tldreadInt16LE(bytes) {
  const ref = EM400tldReadUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function DecoderEm400tld(bytes) {
  const decoded: any = [];

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];
    // BATTERY
    if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.push({ variable: "battery_level", value: bytes[i], unit: "%" });
      i += 1;
    }
    // TEMPERATURE
    else if (channel_id === 0x03 && channel_type === 0x67) {
      decoded.push({ variable: "temperature", value: EM400tldreadInt16LE(bytes.slice(i, i + 2)) / 10, unit: "°C" });
      i += 2;
    }
    // DISTANCE
    else if (channel_id === 0x04 && channel_type === 0x82) {
      decoded.push({ variable: "distance", value: EM400tldReadUInt16LE(bytes.slice(i, i + 2)), unit: "mm" });
      i += 2;
    }
    // POSITION
    else if (channel_id === 0x05 && channel_type === 0x00) {
      decoded.push({ variable: "position", value: bytes[i] === 0 ? "normal" : "tilt" });
      i += 1;
    }
    // TEMPERATURE WITH ABNORMAL
    else if (channel_id === 0x83 && channel_type === 0x67) {
      decoded.push({ variable: "temperature", value: EM400tldreadInt16LE(bytes.slice(i, i + 2)) / 10, unit: "°C" });
      decoded.push({ variable: "temperature_abnormal", value: bytes[i + 2] == 0 ? false : true, unit: "°C" });
      i += 3;
    }
    // DISTANCE WITH ALARMING
    else if (channel_id === 0x84 && channel_type === 0x82) {
      decoded.push({ variable: "distance", value: EM400tldReadUInt16LE(bytes.slice(i, i + 2)), unit: "mm" });
      decoded.push({ variable: "distance_alarming", value: bytes[i + 2] == 0 ? false : true });
      i += 3;
    } else {
      break;
    }
  }

  return decoded;
}

const Em400tldPayloadData = payload.find((x) => x.variable === "payload_raw" || x.variable === "payload" || x.variable === "data");

if (Em400tldPayloadData) {
  try {
    // Convert the data from Hex to Javascript Buffer.
    const buffer = Buffer.from(Em400tldPayloadData?.value, "hex");
    const decodedEm400tldPayload = DecoderEm400tld(buffer);
    const time = Date.now();
    payload = decodedEm400tldPayload?.map((x) => ({ ...x, time })) ?? [];
  } catch (error: any) {
    // Print the error to the Live Inspector.
    console.error(error);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: error.message }];
  }
}
