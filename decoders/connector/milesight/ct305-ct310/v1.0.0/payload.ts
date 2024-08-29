// Helper functions for decoding
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

function readTslVersion(bytes: Buffer): string {
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

function readLoRaWANType(type: number): string {
  switch (type) {
    case 0x00:
      return "ClassA";
    case 0x01:
      return "ClassB";
    case 0x02:
      return "ClassC";
    case 0x03:
      return "ClassCtoB";
    default:
      return "Unknown";
  }
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

function readTemperatureAlarm(type: number): string {
  switch (type) {
    case 0x00:
      return "threshold alarm release";
    case 0x01:
      return "threshold alarm";
    default:
      return "unknown";
  }
}

function includes(items: number[], value: number): boolean {
  const size = items.length;
  for (let i = 0; i < size; i++) {
    if (items[i] == value) {
      return true;
    }
  }
  return false;
}

interface DecodedData {
  [key: string]: number | string;
}

function mileSightDeviceDecode(bytes: Buffer): DecodedData {
  const decoded: DecodedData = {};

  if (bytes.length < 2) {
    throw new Error("Invalid payload size");
  }

  const current_total_chns = [0x03, 0x05, 0x07];
  const current_chns = [0x04, 0x06, 0x08];
  const current_alarm_chns = [0x84, 0x86, 0x88];

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];

    // POWER STATE
    if (channel_id === 0xff && channel_type === 0x0b) {
      decoded.power_status = "on";
      i += 1;
    }
    // IPSO VERSION
    else if (channel_id === 0xff && channel_type === 0x01) {
      decoded.ipso_version = readProtocolVersion(bytes[i]);
      i += 1;
    }
    // PRODUCT SERIAL NUMBER
    else if (channel_id === 0xff && channel_type === 0x16) {
      decoded.sn = readSerialNumber(bytes.slice(i, i + 8));
      i += 8;
    }
    // HARDWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x09) {
      decoded.hardware_version = readHardwareVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // FIRMWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x0a) {
      decoded.firmware_version = readFirmwareVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // LORAWAN CLASS TYPE
    else if (channel_id === 0xff && channel_type === 0x0f) {
      decoded.lorawan_class = readLoRaWANType(bytes[i]);
      i += 1;
    }
    // TSL VERSION
    else if (channel_id === 0xff && channel_type === 0xff) {
      decoded.tsl_version = readTslVersion(bytes.slice(i, i + 2));
      i += 2;
    }
    // TEMPERATURE
    else if (channel_id === 0x09 && channel_type === 0x67) {
      const temperature_value = readUInt16LE(bytes.slice(i, i + 2));
      if (temperature_value === 0xfffd) {
        decoded.temperature_exception = "over range alarm";
      } else if (temperature_value === 0xffff) {
        decoded.temperature_exception = "read failed";
      } else {
        decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      }
      i += 2;
    }
    // TOTAL CURRENT
    else if (includes(current_total_chns, channel_id) && channel_type === 0x97) {
      const current_total_chn_name = "current_chn" + (current_total_chns.indexOf(channel_id) + 1) + "_total";
      decoded[current_total_chn_name] = readUInt32LE(bytes.slice(i, i + 4)) / 100;
      i += 4;
    }
    // CURRENT
    else if (includes(current_chns, channel_id) && channel_type === 0x99) {
      const current_chn_name = "current_chn" + (current_chns.indexOf(channel_id) + 1);
      const current_value = readUInt16LE(bytes.slice(i, i + 2));
      if (current_value === 0xffff) {
        decoded[current_chn_name + "_alarm"] = "read failed";
      } else {
        decoded[current_chn_name] = current_value / 1000;
      }
      i += 2;
    }
    // CURRENT ALARM
    else if (includes(current_alarm_chns, channel_id) && channel_type === 0x99) {
      const current_alarm_chn_name = "current_chn" + (current_alarm_chns.indexOf(channel_id) + 1);
      decoded[current_alarm_chn_name + "_max"] = readUInt16LE(bytes.slice(i, i + 2)) / 1000;
      decoded[current_alarm_chn_name + "_min"] = readUInt16LE(bytes.slice(i + 2, i + 4)) / 1000;
      decoded[current_alarm_chn_name] = readUInt16LE(bytes.slice(i + 4, i + 6)) / 1000;
      decoded[current_alarm_chn_name + "_alarm"] = readCurrentAlarm(bytes[i + 6]);
      i += 7;
    }
    // TEMPERATURE ALARM
    else if (channel_id === 0x89 && channel_type === 0x67) {
      decoded.temperature = readInt16LE(bytes.slice(i, i + 2)) / 10;
      decoded.temperature_alarm = readTemperatureAlarm(bytes[i + 2]);
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
    const decoded = mileSightDeviceDecode(buffer);

    const parsedTagoObj: Pick<Data, "variable" | "value" | "time" | "unit" | "group">[] = [];
    const time = payload_raw.time || new Date().toISOString();
    const group = payload_raw.group || `${new Date().getTime()}-${Math.random().toString(36).substring(2, 5)}`;

    for (const [key, value] of Object.entries(decoded)) {
      let unit;
      if (key.includes("temperature")) {
        unit = "°C";
      } else if (key.includes("current")) {
        unit = key.includes("total") ? "Ah" : "A";
      }

      parsedTagoObj.push({
        variable: key,
        value: value,
        unit: unit,
        group: group,
        time: new Date(time),
      });
    }

    payload = payload.concat(parsedTagoObj);
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
