/* eslint-disable no-bitwise */

/**
 * Milesight FT101 - TagoIO Decoder
 * LoRaWAN Field Tester
 *
 * Based on official Milesight decoder
 * @product FT101
 */

// Only include these variables in output (empty array = keep all)
const keep_vars: string[] = [];

const RAW_VALUE = 0x00;

function readUInt8(bytes: number): number {
  return bytes & 0xff;
}

function readUInt16LE(bytes: Buffer | number[]): number {
  const value = (bytes[1] << 8) + bytes[0];
  return value & 0xffff;
}

function readInt16LE(bytes: Buffer | number[]): number {
  const ref = readUInt16LE(bytes);
  return ref > 0x7fff ? ref - 0x10000 : ref;
}

function readUInt32LE(bytes: Buffer | number[]): number {
  const value = (bytes[3] << 24) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
  return (value & 0xffffffff) >>> 0;
}

function readInt32LE(bytes: Buffer | number[]): number {
  const ref = readUInt32LE(bytes);
  return ref > 0x7fffffff ? ref - 0x100000000 : ref;
}

function getValue(map: Record<number | string, string>, key: number | string): string {
  if (RAW_VALUE) return String(key);
  return map[key] || "unknown";
}

function readProtocolVersion(bytes: number): string {
  const major = (bytes & 0xf0) >> 4;
  const minor = bytes & 0x0f;
  return `v${major}.${minor}`;
}

function readHardwareVersion(bytes: Buffer | number[]): string {
  const major = (bytes[0] & 0xff).toString(16);
  const minor = (bytes[1] & 0xff) >> 4;
  return `v${major}.${minor}`;
}

function readFirmwareVersion(bytes: Buffer | number[]): string {
  const major = (bytes[0] & 0xff).toString(16);
  const minor = (bytes[1] & 0xff).toString(16);
  return `v${major}.${minor}`;
}

function readTslVersion(bytes: Buffer | number[]): string {
  const major = bytes[0] & 0xff;
  const minor = bytes[1] & 0xff;
  return `v${major}.${minor}`;
}

function readSerialNumber(bytes: Buffer | number[]): string {
  const temp: string[] = [];
  for (let idx = 0; idx < bytes.length; idx++) {
    temp.push(("0" + (bytes[idx] & 0xff).toString(16)).slice(-2));
  }
  return temp.join("");
}

function readLoRaWANClass(type: number): string {
  return getValue({ 0: "Class A", 1: "Class B", 2: "Class C", 3: "Class CtoB" }, type);
}

function readDeviceStatus(status: number): string {
  return getValue({ 0: "off", 1: "on" }, status);
}

// Convert NMEA format (DDDMM.MMMM) to decimal degrees
function convertFromNMEA(nmea: number): number {
  const sign = nmea >= 0 ? 1 : -1;
  const absolute = Math.abs(nmea);
  const degrees = Math.floor(absolute / 100);
  const minutes = absolute % 100;
  return sign * (degrees + minutes / 60);
}

interface DecodedData {
  [key: string]: string | number | undefined;
  longitude?: number;
  latitude?: number;
}

function milesightDeviceDecode(bytes: Buffer): DecodedData {
  const decoded: DecodedData = {};

  for (let i = 0; i < bytes.length; ) {
    const channel_id = bytes[i++];
    const channel_type = bytes[i++];

    // IPSO VERSION
    if (channel_id === 0xff && channel_type === 0x01) {
      decoded.ipso_version = readProtocolVersion(bytes[i]);
      i += 1;
    }
    // HARDWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x09) {
      decoded.hardware_version = readHardwareVersion(bytes.subarray(i, i + 2));
      i += 2;
    }
    // FIRMWARE VERSION
    else if (channel_id === 0xff && channel_type === 0x0a) {
      decoded.firmware_version = readFirmwareVersion(bytes.subarray(i, i + 2));
      i += 2;
    }
    // DEVICE STATUS
    else if (channel_id === 0xff && channel_type === 0x0b) {
      decoded.device_status = readDeviceStatus(1);
      i += 1;
    }
    // LORAWAN CLASS
    else if (channel_id === 0xff && channel_type === 0x0f) {
      decoded.lorawan_class = readLoRaWANClass(bytes[i]);
      i += 1;
    }
    // PRODUCT SERIAL NUMBER
    else if (channel_id === 0xff && channel_type === 0x16) {
      decoded.sn = readSerialNumber(bytes.subarray(i, i + 8));
      i += 8;
    }
    // TSL VERSION
    else if (channel_id === 0xff && channel_type === 0xff) {
      decoded.tsl_version = readTslVersion(bytes.subarray(i, i + 2));
      i += 2;
    }
    // LOCATION
    else if (channel_id === 0x03 && channel_type === 0xa1) {
      const rawLongitude = readInt32LE(bytes.subarray(i, i + 4)) / 1000000;
      const rawLatitude = readInt32LE(bytes.subarray(i + 4, i + 8)) / 1000000;

      // Check if values are in NMEA format (values typically over valid range)
      // and convert to decimal degrees if needed
      decoded.longitude = Math.abs(rawLongitude) > 180 ? convertFromNMEA(rawLongitude) : rawLongitude;
      decoded.latitude = Math.abs(rawLatitude) > 90 ? convertFromNMEA(rawLatitude) : rawLatitude;
      i += 8;
    }
    // SIGNAL STRENGTH
    else if (channel_id === 0x04 && channel_type === 0xa2) {
      decoded.rssi = readInt16LE(bytes.subarray(i, i + 2)) / 10;
      decoded.snr = readInt16LE(bytes.subarray(i + 2, i + 4)) / 10;
      i += 4;
    }
    // SF
    else if (channel_id === 0x05 && channel_type === 0xa3) {
      decoded.sf = readUInt8(bytes[i]);
      i += 1;
    }
    // TX POWER
    else if (channel_id === 0x06 && channel_type === 0xa4) {
      decoded.tx_power = readInt16LE(bytes.subarray(i, i + 2)) / 100;
      i += 2;
    } else {
      break;
    }
  }

  return decoded;
}

function toTagoFormat(decoded: DecodedData, group: string): Data[] {
  const result: Data[] = [];
  const location =
    decoded.latitude !== undefined && decoded.longitude !== undefined
      ? { lat: decoded.latitude, lng: decoded.longitude }
      : undefined;

  // Add location variable with both coordinates
  if (location) {
    result.push({
      variable: "location",
      value: { latitude: decoded.latitude, longitude: decoded.longitude },
      location,
      unit: "°",
      group,
    });
  }

  for (const key in decoded) {
    if (decoded[key] !== undefined) {
      const item: Data = {
        variable: key,
        value: decoded[key] as string | number | boolean,
        group,
      };
      // Add location to all variables if available
      if (location) {
        item.location = location;
      }
      result.push(item);
    }
  }

  return result;
}

const payload_raw = payload.find(
  (x) =>
    x.variable === "payload_raw" ||
    x.variable === "payload" ||
    x.variable === "data" ||
    x.variable === "payload_hex"
);

if (payload_raw) {
  try {
    const buffer = Buffer.from(payload_raw.value as string, "hex");
    const group = String(new Date().getTime());
    const decoded = milesightDeviceDecode(buffer);
    const tagoData = toTagoFormat(decoded, group);
    const filtered = keep_vars.length ? tagoData.filter((d) => keep_vars.includes(d.variable)) : tagoData;
    payload = filtered;
  } catch (e: unknown) {
    console.error(e);
    payload = [{ variable: "parse_error", value: e instanceof Error ? e.message : String(e) }];
  }
}
