/* ******************************************
 * bytes to number
 ********************************************/
function readUInt16LE(bytes: Buffer): number {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readUInt32LE(bytes: Buffer): number {
  const value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
}

interface DecodedData {
  voltage?: number;
  active_power?: number;
  power_factor?: number;
  power_consumption?: number;
  current?: number;
  socket_status?: string;
}

// Function to decode the payload
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
      decoded.power_factor = bytes[i] / 100;
      i += 1;
    }
    // POWER CONSUMPTION
    else if (channel_id === 0x06 && channel_type === 0x83) {
      decoded.power_consumption = readUInt32LE(bytes.slice(i, i + 4));
      i += 4;
    }
    // CURRENT
    else if (channel_id === 0x07 && channel_type === 0xc9) {
      decoded.current = readUInt16LE(bytes.slice(i, i + 2));
      i += 2;
    }
    // SOCKET STATUS
    else if (channel_id === 0x08 && channel_type === 0x70) {
      const data = bytes[i++];
      decoded.socket_status = (data & 0x01) === 0x01 ? "open" : "close";
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

    const parsedTagoObj: DataToSend[] = [];

    if (decoded.voltage !== undefined) {
      parsedTagoObj.push({ variable: "voltage", value: decoded.voltage, unit: "V", group, time });
    }
    if (decoded.active_power !== undefined) {
      parsedTagoObj.push({ variable: "active_power", value: decoded.active_power, unit: "W", group, time });
    }
    if (decoded.power_factor !== undefined) {
      parsedTagoObj.push({ variable: "power_factor", value: decoded.power_factor, group, time });
    }
    if (decoded.power_consumption !== undefined) {
      parsedTagoObj.push({ variable: "power_consumption", value: decoded.power_consumption, unit: "W*h", group, time });
    }
    if (decoded.current !== undefined) {
      parsedTagoObj.push({ variable: "current", value: decoded.current, unit: "mA", group, time });
    }
    if (decoded.socket_status !== undefined) {
      parsedTagoObj.push({ variable: "socket_status", value: decoded.socket_status, group, time });
    }

    payload = payload.concat(parsedTagoObj);
  } catch (e) {
    // Print the error to the Live Inspector.
    console.error(e);
    // Return the variable parse_error for debugging.
    payload = [{ variable: "parse_error", value: e.message }];
  }
}
