interface DecodedData extends Pick<Data, "variable" | "value" | "time" | "unit" | "group"> {}

// Reads a big-endian uint16 starting at `offset`
function readUInt16BE(bytes: Buffer, offset: number): number {
  return (bytes[offset] << 8) + bytes[offset + 1];
}

// Converts the raw signed temperature integer (hundredths of a degree) to °C
function sintToDec(raw: number): number {
  if (raw > 32767) {
    return (raw - 65536) / 100;
  }
  return raw / 100;
}

// Device-specific battery percentage curve
function batteryPercent(normalizedLevel: number): number {
  return 62.5 * normalizedLevel - 100;
}

// Port 1 or 2: sensor data packet
function decodeDataPacket(bytes: Buffer, group: string, time: Date): DecodedData[] {
  if (bytes.length < 8) {
    throw new Error("Invalid data packet size");
  }

  const status = bytes[0];
  const temperatureRaw = readUInt16BE(bytes, 1);
  const humidityRaw = readUInt16BE(bytes, 3);
  const airPressureRaw = readUInt16BE(bytes, 5);
  const batteryLevel = bytes[7];
  const batteryLevelNormalized = (batteryLevel + 100) / 100;

  return [
    { variable: "status", value: status, group, time },
    { variable: "temperature", value: sintToDec(temperatureRaw), unit: "°C", group, time },
    { variable: "humidity", value: humidityRaw / 100, unit: "%RH", group, time },
    { variable: "air_pressure", value: airPressureRaw / 10, unit: "hPa", group, time },
    { variable: "battery_level", value: batteryLevelNormalized, unit: "V", group, time },
    { variable: "battery_percent", value: batteryPercent(batteryLevelNormalized), unit: "%", group, time },
  ];
}

// Any other port: configuration packet
function decodeConfigPacket(bytes: Buffer, group: string, time: Date): DecodedData[] {
  if (bytes.length < 9) {
    throw new Error("Invalid config packet size");
  }

  return [
    { variable: "status", value: bytes[0], group, time },
    { variable: "send_period", value: bytes[1], unit: "s", group, time },
    { variable: "movement_threshold", value: bytes[2], group, time },
    { variable: "packet_confirm", value: bytes[3], group, time },
    { variable: "data_rate", value: bytes[4], group, time },
    { variable: "family_id", value: bytes[5], group, time },
    { variable: "product_id", value: bytes[6], group, time },
    { variable: "hw_version", value: bytes[7] / 10, group, time },
    { variable: "fw_version", value: bytes[8] / 10, group, time },
  ];
}

function smc30Decode(bytes: Buffer, port: number, group: string, time: Date): DecodedData[] {
  if (port === 1 || port === 2) {
    return decodeDataPacket(bytes, group, time);
  }
  return decodeConfigPacket(bytes, group, time);
}

const payload_raw = payload.find((x) => ["payload_raw", "payload", "data"].includes(x.variable));
const port_variable = payload.find((x) => x.variable === "port");

if (payload_raw) {
  try {
    const bytes = Buffer.from(payload_raw.value as string, "hex");
    const port = port_variable ? Number(port_variable.value) : 0;
    const group = `${new Date().getTime()}-${Math.random().toString(36).substring(2, 5)}`;
    const time = new Date();

    const parsed = smc30Decode(bytes, port, group, time);
    payload = payload.concat(parsed);
 } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(e);
    payload = [{ variable: "parse_error", value: errorMessage }];
  }
}