function readUInt16LE(bytes: Buffer): number {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes: Buffer): number {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

interface DecodedData extends Pick<Data, "variable" | "value" | "time" | "unit" | "group"> {}

function mileSightDeviceDecode(bytes: Buffer): DecodedData[] {
  const decoded: DecodedData[] = [];

  if (bytes.length < 2) {
    throw new Error("Invalid payload size");
  }

  const group = `${new Date().getTime()}-${Math.random().toString(36).substring(2, 5)}`;
  const time = new Date();

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];
    // BATTERY
    if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.push({ variable: "battery", value: bytes[i], unit: "%", group, time });
      i += 1;
    }
    // TEMPERATURE
    else if (channel_id === 0x03 && channel_type === 0x67) {
      const temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      decoded.push({ variable: "temperature", value: temperature, unit: "°C", group, time });
      i += 2;
    }
    // DISTANCE
    else if (channel_id === 0x04 && channel_type === 0x82) {
      const distance = readUInt16LE(bytes.slice(i, i + 2));
      decoded.push({ variable: "distance", value: distance, unit: "mm", group, time });
      i += 2;
    }
    // POSITION
    else if (channel_id === 0x05 && channel_type === 0x00) {
      const position = bytes[i] === 0 ? "normal" : "tilt";
      decoded.push({ variable: "position", value: position, group, time });
      i += 1;
    }
    // TEMPERATURE WITH ABNORMAL
    else if (channel_id === 0x83 && channel_type === 0x67) {
      const temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      const temperature_abnormal = bytes[i + 2] !== 0;
      decoded.push({ variable: "temperature", value: temperature, unit: "°C", group, time });
      decoded.push({ variable: "temperature_abnormal", value: temperature_abnormal, group, time });
      i += 3;
    }
    // DISTANCE WITH ALARMING
    else if (channel_id === 0x84 && channel_type === 0x82) {
      const distance = readUInt16LE(bytes.slice(i, i + 2));
      const distance_alarming = bytes[i + 2] !== 0;
      decoded.push({ variable: "distance", value: distance, unit: "mm", group, time });
      decoded.push({ variable: "distance_alarming", value: distance_alarming, group, time });
      i += 3;
    } else {
      break;
    }
  }

  return decoded;
}

const payload_raw = payload.find((x) => ["payload_raw", "payload", "data"].includes(x.variable));

if (payload_raw) {
  try {
    const buffer = Buffer.from(payload_raw.value as string, "hex");
    const parsedTagoObj = mileSightDeviceDecode(buffer);

    payload = payload.concat(parsedTagoObj);
  } catch (e) {
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
