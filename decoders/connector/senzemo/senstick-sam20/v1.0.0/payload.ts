interface DecodedData extends Pick<Data, "variable" | "value" | "time" | "unit" | "group"> {}

// Reads a big-endian uint16 starting at `offset`
function readUInt16BE(bytes: Buffer, offset: number): number {
  return (bytes[offset] << 8) + bytes[offset + 1];
}

// Reads a big-endian int16 (sign-extended) starting at `offset`
function readInt16BE(bytes: Buffer, offset: number): number {
  const raw = readUInt16BE(bytes, offset);
  return raw > 32767 ? raw - 65536 : raw;
}

// Port 1: alert packet
function decodeAlertPacket(bytes: Buffer, group: string, time: Date): DecodedData[] {
  if (bytes.length !== 1) {
    throw new Error("Invalid alert packet size");
  }

  return [
    { variable: "alert", value: bytes[0], unit: "", group, time },
    { variable: "move_detected", value: bytes[0] === 0x01, unit: "", group, time },
  ];
}

// Port 2 (release firmware) or 4 (debug firmware): sensor data packet, with an optional trailing 12-byte logging record
function decodeDataPacket(bytes: Buffer, port: number, group: string, time: Date): DecodedData[] {
  let status: number;
  let temperatureRaw: number;
  let humidityRaw: number;
  let airPressureRaw: number;
  let batteryLevel: number;
  let logOffset: number;

  if (bytes.length === 8 || bytes.length === 20) {
    status = 0;
    temperatureRaw = readInt16BE(bytes, 0);
    humidityRaw = readUInt16BE(bytes, 2);
    airPressureRaw = readUInt16BE(bytes, 4);
    batteryLevel = readUInt16BE(bytes, 6);
    logOffset = 8;
  } else if (bytes.length === 9 || bytes.length === 21) {
    status = bytes[0];
    temperatureRaw = readInt16BE(bytes, 1);
    humidityRaw = readUInt16BE(bytes, 3);
    airPressureRaw = readUInt16BE(bytes, 5);
    batteryLevel = readUInt16BE(bytes, 7);
    logOffset = 9;
  } else {
    throw new Error("Invalid data packet size");
  }

  const result: DecodedData[] = [
    { variable: "status", value: status, unit: "", group, time },
    { variable: "temperature", value: temperatureRaw / 100, unit: "°C", group, time },
    { variable: "humidity", value: humidityRaw / 100, unit: "%RH", group, time },
    { variable: "air_pressure", value: airPressureRaw / 10, unit: "hPa", group, time },
    { variable: "battery_level", value: batteryLevel, unit: "mV", group, time },
    { variable: "debug_firmware", value: port === 4, unit: "", group, time },
  ];

  if (bytes.length === 20 || bytes.length === 21) {
    const logFcnt = (bytes[logOffset] << 16) + (bytes[logOffset + 1] << 8) + bytes[logOffset + 2];
    const logStatus = bytes[logOffset + 3];
    const logTemperatureRaw = readInt16BE(bytes, logOffset + 4);
    const logHumidityRaw = readUInt16BE(bytes, logOffset + 6);
    const logAirPressureRaw = readUInt16BE(bytes, logOffset + 8);
    const logBatteryLevel = readUInt16BE(bytes, logOffset + 10);

    result.push(
      { variable: "log_fcnt", value: logFcnt, unit: "", group, time },
      { variable: "log_status", value: logStatus, unit: "", group, time },
      { variable: "log_temperature", value: logTemperatureRaw / 100, unit: "°C", group, time },
      { variable: "log_humidity", value: logHumidityRaw / 100, unit: "%RH", group, time },
      { variable: "log_air_pressure", value: logAirPressureRaw / 10, unit: "hPa", group, time },
      { variable: "log_battery_level", value: logBatteryLevel, unit: "mV", group, time },
    );
  }

  return result;
}

// Port 3: config packet
function decodeConfigPacket(bytes: Buffer, group: string, time: Date): DecodedData[] {
  if (bytes.length !== 9) {
    throw new Error("Invalid config packet size");
  }

  const dataRatePlusAdr = bytes[4];
  const adrOn = (dataRatePlusAdr & 0x80) !== 0;
  const dataRate = dataRatePlusAdr & 0x7f;

  return [
    { variable: "status", value: bytes[0], unit: "", group, time },
    { variable: "send_period", value: bytes[1], unit: "s", group, time },
    { variable: "movement_threshold", value: bytes[2], unit: "", group, time },
    { variable: "packet_confirm", value: bytes[3], unit: "", group, time },
    { variable: "data_rate", value: dataRate, unit: "", group, time },
    { variable: "adr_on", value: adrOn, unit: "", group, time },
    { variable: "family_id", value: bytes[5], unit: "", group, time },
    { variable: "product_id", value: bytes[6], unit: "", group, time },
    { variable: "hw_version", value: bytes[7] / 10, unit: "", group, time },
    { variable: "fw_version", value: bytes[8] / 10, unit: "", group, time },
  ];
}

function sam20Decode(bytes: Buffer, port: number, group: string, time: Date): DecodedData[] {
  if (port === 1) {
    return decodeAlertPacket(bytes, group, time);
  }
  if (port === 2 || port === 4) {
    return decodeDataPacket(bytes, port, group, time);
  }
  if (port === 3) {
    return decodeConfigPacket(bytes, group, time);
  }
  throw new Error(`Unsupported FPort: ${port}`);
}

// Valid SAM20 frame sizes: alert (1), data (8/9), data + logging record (20/21), config (9).
const VALID_FRAME_SIZES = [1, 8, 9, 20, 21];

// Raw frame arrives hex-encoded in `payload`/`payload_raw`/`frm_payload`, or base64 in
// `data`/`dataFrame`, and the port under four different spellings, depending on network.
const RAW_VARIABLES = ["payload_raw", "payload", "frm_payload", "data", "dataframe"];
const BASE64_VARIABLES = ["data", "dataframe"];
const PORT_VARIABLES = ["port", "fport", "f_port"];

// Buffer.from() silently drops characters it cannot parse, so the guess is confirmed by
// re-encoding; a string valid as both hex and base64 is settled by which length is a frame size.
function decodeRawFrame(value: string, variable: string): Buffer {
  const encodings: BufferEncoding[] = BASE64_VARIABLES.includes(variable.toLowerCase())
    ? ["base64", "hex"]
    : ["hex"];

  let fallback: Buffer | undefined;
  for (const encoding of encodings) {
    const bytes = Buffer.from(value, encoding);
    const canonical = encoding === "hex" ? value.toLowerCase() : value;
    if (!bytes.length || bytes.toString(encoding) !== canonical) {
      continue;
    }
    if (VALID_FRAME_SIZES.includes(bytes.length)) {
      return bytes;
    }
    fallback = fallback ?? bytes;
  }

  if (!fallback) {
    throw new Error(`Could not decode "${variable}" as ${encodings.join(" or ")}`);
  }
  return fallback;
}

const payload_raw = payload.find(
  (x) => RAW_VARIABLES.includes(String(x.variable).toLowerCase()) && typeof x.value === "string",
);
const port_variable = payload.find((x) => PORT_VARIABLES.includes(String(x.variable).toLowerCase()));

if (payload_raw) {
  try {
    const bytes = decodeRawFrame(payload_raw.value as string, payload_raw.variable as string);
    const port = port_variable ? Number(port_variable.value) : 0;
    const group = payload_raw.group || payload_raw.serie || `${new Date().getTime()}-${Math.random().toString(36).substring(2, 5)}`;
    const time = payload_raw.time ? new Date(payload_raw.time) : new Date();

    const parsed = sam20Decode(bytes, port, group, time);
    payload = payload.concat(parsed);
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(e);
    payload = [{ variable: "parse_error", value: errorMessage }];
  }
}
