function readUInt16LE(bytes: Buffer): number {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readUInt32LE(bytes: Buffer): number {
  const value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return value & 0xffffffff;
}

interface DecodedData {
  [key: string]: number | string;
}

function mileSightDeviceDecode(bytes: Buffer): DecodedData {
  const decoded: DecodedData = {};

  if (bytes.length < 2) {
    throw new Error("Invalid payload size");
  }

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];

    // VOLTAGE
    if (channel_id === 0x03 && channel_type === 0x74) {
      decoded.voltage = readUInt16LE(bytes.slice(i, i + 2)) / 10;
      i += 2;
    }
    // ACTIVE POWER
    else if (channel_id === 0x04 && channel_type === 0x80) {
      decoded.active_power = readUInt32LE(bytes.slice(i, i + 4));
      i += 4;
    }
    // POWER FACTOR
    else if (channel_id === 0x05 && channel_type === 0x81) {
      decoded.power_factor = bytes[i];
      i += 1;
    }
    // POWER CONSUMPTION
    else if (channel_id === 0x06 && channel_type === 0x83) {
      decoded.power_consumption = readUInt32LE(bytes.slice(i, i + 4));
      i += 4;
    }
    // TOTAL CURRENT
    else if (channel_id === 0x07 && channel_type === 0xc9) {
      decoded.total_current = readUInt16LE(bytes.slice(i, i + 2));
      i += 2;
    }
    // SWITCH STATUS
    else if (channel_id === 0x08 && channel_type === 0x31) {
      const switchFlags = bytes[i + 1];

      // output all switch status
      for (let idx = 0; idx < 8; idx++) {
        const switchTag = "switch_" + (idx + 1);
        decoded[switchTag] = (switchFlags >> idx) & 1 ? "on" : "off";
      }

      i += 2;
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

    const time = payload_raw.time || new Date().toISOString();
    const group = payload_raw.group || `${new Date().getTime()}-${Math.random().toString(36).substring(2, 5)}`;

    const parsedTagoObj = [
      { variable: "voltage", value: decoded.voltage, unit: "V", group, time },
      { variable: "active_power", value: decoded.active_power, unit: "W", group, time },
      { variable: "power_factor", value: decoded.power_factor, unit: "%", group, time },
      { variable: "total_current", value: decoded.total_current, unit: "mA", group, time },
      { variable: "power_consumption", value: decoded.power_consumption, unit: "W*h", group, time },
    ];

    for (let i = 1; i <= 8; i++) {
      parsedTagoObj.push({ variable: `switch_${i}`, value: decoded[`switch_${i}`], unit: "", group, time });
    }

    payload = payload.concat(parsedTagoObj);
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
