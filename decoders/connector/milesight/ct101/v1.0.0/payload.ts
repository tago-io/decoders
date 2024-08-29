// Helper functions to read different data types from the payload
function readUInt16LE(bytes: Buffer): number {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes: Buffer): number {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes: Buffer): number {
  const value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
}

function readProtocolVersion(bytes: number): string {
  const major = (bytes & 0xf0) >> 4;
  const minor = bytes & 0x0f;
  return "v" + major + "." + minor;
}

function readHardwareVersion(bytes: Buffer): string {
  const major = bytes[0] & 0xff;
  const minor = (bytes[1] & 0xff) >> 4;
  return "v" + major + "." + minor;
}

function readFirmwareVersion(bytes: Buffer): string {
  const major = bytes[0] & 0xff;
  const minor = bytes[1] & 0xff;
  return "v" + major + "." + minor;
}

function readSerialNumber(bytes: Buffer): string {
  const temp: string[] = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
  }
  return temp.join("");
}

function readCurrentAlarm(type: number): string {
  const alarm: string[] = [];
  if ((type >> 0) & 0x01) {
    alarm.push("threshold alarm");
  }
  if ((type >> 1) & 0x01) {
    alarm.push("threshold alarm release");
  }
  if ((type >> 2) & 0x01) {
    alarm.push("over range alarm");
  }
  if ((type >> 3) & 0x01) {
    alarm.push("over range alarm release");
  }
  return alarm.join(", ");
}

interface DecodedData extends Pick<Data, "variable" | "value" | "time" | "unit" | "group"> {}

// Main decoding function
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

    // POWER STATE
    if (channel_id === 0xff && channel_type === 0x0b) {
      decoded.push({ variable: "power", value: "on", group, time });
      i += 1;
    }
    // IPSO VERSION
    else if (channel_id === 0xff && channel_type === 0x01) {
      decoded.push({ variable: "ipso_version", value: readProtocolVersion(bytes[i]), group, time });
      i += 1;
    }
    // PRODUCT SERIAL NUMBER
    else if (channel_id === 0xff && channel_type === 0x16) {
      decoded.push({ variable: "sn", value: readSerialNumber(bytes.slice(i, i + 8)), group, time });
      i += 8;
    }
    // HARDWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x09) {
      decoded.push({ variable: "hardware_version", value: readHardwareVersion(bytes.slice(i, i + 2)), group, time });
      i += 2;
    }
    // FIRMWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x0a) {
      decoded.push({ variable: "firmware_version", value: readFirmwareVersion(bytes.slice(i, i + 2)), group, time });
      i += 2;
    }
    // TOTAL CURRENT
    else if (channel_id === 0x03 && channel_type === 0x97) {
      decoded.push({ variable: "total_current", value: readUInt32LE(bytes.slice(i, i + 4)) / 100, unit: "Ah", group, time });
      i += 4;
    }
    // CURRENT
    else if (channel_id === 0x04 && channel_type === 0x98) {
      const value = readUInt16LE(bytes.slice(i, i + 2));
      if (value === 0xffff) {
        decoded.push({ variable: "alarm", value: "read failed", group, time });
      } else {
        decoded.push({ variable: "current", value: value / 100, unit: "A", group, time });
      }
      i += 2;
    }
    // TEMPERATURE
    else if (channel_id === 0x09 && channel_type === 0x67) {
      const temperature_value = readUInt16LE(bytes.slice(i, i + 2));
      if (temperature_value === 0xfffd) {
        decoded.push({ variable: "temperature_exception", value: "over range alarm", group, time });
      } else if (temperature_value === 0xffff) {
        decoded.push({ variable: "temperature_exception", value: "read failed", group, time });
      } else {
        decoded.push({ variable: "temperature", value: readInt16LE(bytes.slice(i, i + 2)) / 10, unit: "°C", group, time });
      }
      i += 2;
    }
    // CURRENT ALARM
    else if (channel_id === 0x84 && channel_type === 0x98) {
      decoded.push({ variable: "current_max", value: readUInt16LE(bytes.slice(i, i + 2)) / 100, unit: "A", group, time });
      decoded.push({ variable: "current_min", value: readUInt16LE(bytes.slice(i + 2, i + 4)) / 100, unit: "A", group, time });
      decoded.push({ variable: "current", value: readUInt16LE(bytes.slice(i + 4, i + 6)) / 100, unit: "A", group, time });
      decoded.push({ variable: "alarm", value: readCurrentAlarm(bytes[i + 6]), group, time });
      i += 7;
    }
    // TEMPERATURE ALARM
    else if (channel_id === 0x89 && channel_type === 0x67) {
      decoded.push({ variable: "temperature", value: readInt16LE(bytes.slice(i, i + 2)) / 10, unit: "°C", group, time });
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
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
