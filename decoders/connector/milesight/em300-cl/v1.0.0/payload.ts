/* eslint-disable no-bitwise */

/**
 * Milesight EM300-CL - TagoIO Decoder
 * Capacitive Liquid Level Sensor
 *
 * Based on official Milesight decoder
 * @product EM300-CL
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

function readResetEvent(status: number): string {
  return getValue({ 0: "normal", 1: "reset" }, status);
}

function readDeviceStatus(status: number): string {
  return getValue({ 0: "off", 1: "on" }, status);
}

function readEnableStatus(status: number): string {
  return getValue({ 0: "disable", 1: "enable" }, status);
}

function readYesNoStatus(status: number): string {
  return getValue({ 0: "no", 1: "yes" }, status);
}

function readLiquidStatus(type: number): string {
  return getValue({ 0: "uncalibrated", 1: "full", 2: "critical liquid level alert", 255: "error" }, type);
}

function readAlarmType(type: number): string {
  return getValue({ 0: "critical liquid level alarm release", 1: "critical liquid level alarm" }, type);
}

function readCalibrationResult(type: number): string {
  return getValue({ 0: "failed", 1: "success" }, type);
}

interface DecodedData {
  [key: string]: string | number | Record<string, unknown> | undefined;
}

function handleDownlinkResponse(
  channel_type: number,
  bytes: Buffer,
  offset: number
): { data: DecodedData; offset: number } {
  const decoded: DecodedData = {};

  switch (channel_type) {
    case 0x10:
      decoded.reboot = readYesNoStatus(1);
      offset += 1;
      break;
    case 0x28:
      decoded.report_status = readYesNoStatus(1);
      offset += 1;
      break;
    case 0x62:
      decoded.calibrate = readYesNoStatus(1);
      offset += 1;
      break;
    case 0x7e:
      decoded.alarm_config_enable = readEnableStatus(bytes[offset] & 0x01);
      decoded.alarm_config_alarm_release_enable = readEnableStatus((bytes[offset] >> 7) & 0x01);
      decoded.alarm_config_alarm_interval = readUInt16LE(bytes.subarray(offset + 1, offset + 3));
      decoded.alarm_config_alarm_counts = readUInt16LE(bytes.subarray(offset + 3, offset + 5));
      offset += 5;
      break;
    case 0x8e:
      // ignore first byte
      decoded.report_interval = readUInt16LE(bytes.subarray(offset + 1, offset + 3));
      offset += 3;
      break;
    case 0xbb:
      // ignore first byte
      decoded.collection_interval = readUInt16LE(bytes.subarray(offset + 1, offset + 3));
      offset += 3;
      break;
    case 0xbe: {
      const data = bytes[offset];
      if (data === 0x00) {
        decoded.query_capacitor_calibration_value = readYesNoStatus(1);
      } else if (data === 0x01) {
        decoded.query_capacitor_value = readYesNoStatus(1);
      } else if (data === 0x02) {
        decoded.query_capacitor_judge_value = readYesNoStatus(1);
      }
      offset += 1;
      break;
    }
    case 0xbf: {
      const dataType = bytes[offset];
      if (dataType === 0x00) {
        decoded.capacitor_config_c1 = readUInt16LE(bytes.subarray(offset + 1, offset + 3)) / 100;
        decoded.capacitor_config_c2 = readUInt16LE(bytes.subarray(offset + 3, offset + 5)) / 100;
        decoded.capacitor_config_delta = readUInt16LE(bytes.subarray(offset + 5, offset + 7)) / 100;
      } else if (dataType === 0x01) {
        decoded.capacitor_judge_config_c1 = readUInt16LE(bytes.subarray(offset + 1, offset + 3)) / 100;
        decoded.capacitor_judge_config_c2 = readUInt16LE(bytes.subarray(offset + 3, offset + 5)) / 100;
        decoded.capacitor_judge_config_delta = readUInt16LE(bytes.subarray(offset + 5, offset + 7)) / 100;
      }
      offset += 9;
      break;
    }
    case 0xc0:
      decoded.calibrate_delay_time = readUInt16LE(bytes.subarray(offset, offset + 2));
      offset += 2;
      break;
    default:
      break;
  }

  return { data: decoded, offset };
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
    // TSL VERSION
    else if (channel_id === 0xff && channel_type === 0xff) {
      decoded.tsl_version = readTslVersion(bytes.subarray(i, i + 2));
      i += 2;
    }
    // SERIAL NUMBER
    else if (channel_id === 0xff && channel_type === 0x16) {
      decoded.sn = readSerialNumber(bytes.subarray(i, i + 8));
      i += 8;
    }
    // LORAWAN CLASS TYPE
    else if (channel_id === 0xff && channel_type === 0x0f) {
      decoded.lorawan_class = readLoRaWANClass(bytes[i]);
      i += 1;
    }
    // RESET EVENT
    else if (channel_id === 0xff && channel_type === 0xfe) {
      decoded.reset_event = readResetEvent(1);
      i += 1;
    }
    // DEVICE STATUS
    else if (channel_id === 0xff && channel_type === 0x0b) {
      decoded.device_status = readDeviceStatus(1);
      i += 1;
    }
    // BATTERY
    else if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.battery = readUInt8(bytes[i]);
      i += 1;
    }
    // LIQUID
    else if (channel_id === 0x03 && channel_type === 0xed) {
      decoded.liquid = readLiquidStatus(bytes[i]);
      i += 1;
    }
    // CALIBRATION RESULT
    else if (channel_id === 0x04 && channel_type === 0xee) {
      decoded.calibration_result = readCalibrationResult(bytes[i]);
      i += 1;
    }
    // LIQUID ALARM
    else if (channel_id === 0x83 && channel_type === 0xed) {
      decoded.liquid = readLiquidStatus(bytes[i]);
      decoded.liquid_alarm = readAlarmType(bytes[i + 1]);
      i += 2;
    }
    // DOWNLINK RESPONSE
    else if (channel_id === 0xfe || channel_id === 0xff) {
      const result = handleDownlinkResponse(channel_type, bytes, i);
      Object.assign(decoded, result.data);
      i = result.offset;
    } else {
      break;
    }
  }

  return decoded;
}

function toTagoFormat(decoded: DecodedData, group: string): Data[] {
  const result: Data[] = [];

  for (const key in decoded) {
    if (typeof decoded[key] === "object" && decoded[key] !== null) {
      const nested = decoded[key] as Record<string, unknown>;
      for (const nestedKey in nested) {
        result.push({
          variable: `${key}_${nestedKey}`,
          value: nested[nestedKey] as string | number | boolean,
          group,
        });
      }
    } else if (decoded[key] !== undefined) {
      result.push({
        variable: key,
        value: decoded[key] as string | number | boolean,
        group,
      });
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
