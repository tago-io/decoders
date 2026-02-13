/* eslint-disable no-bitwise */

/**
 * Milesight AM308 - TagoIO Decoder
 * Indoor Ambience Monitoring Sensor
 *
 * Based on official Milesight decoder
 * @product AM308(v2)
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

function readDeviceStatus(type: number): string {
  return getValue({ 0: "off", 1: "on" }, type);
}

function readLoRaWANClass(type: number): string {
  return getValue({ 0: "Class A", 1: "Class B", 2: "Class C", 3: "Class CtoB" }, type);
}

function readPIRStatus(type: number): string {
  return getValue({ 0: "idle", 1: "trigger" }, type);
}

function readBuzzerStatus(type: number): string {
  return getValue({ 0: "off", 1: "on" }, type);
}

function readEnableStatus(status: number): string {
  return getValue({ 0: "disable", 1: "enable" }, status);
}

function readYesNoStatus(status: number): string {
  return getValue({ 0: "no", 1: "yes" }, status);
}

function readTimeZone(time_zone: number): string {
  const timezone_map: Record<string, string> = {
    "-120": "UTC-12", "-110": "UTC-11", "-100": "UTC-10", "-95": "UTC-9:30", "-90": "UTC-9",
    "-80": "UTC-8", "-70": "UTC-7", "-60": "UTC-6", "-50": "UTC-5", "-40": "UTC-4",
    "-35": "UTC-3:30", "-30": "UTC-3", "-20": "UTC-2", "-10": "UTC-1", "0": "UTC",
    "10": "UTC+1", "20": "UTC+2", "30": "UTC+3", "35": "UTC+3:30", "40": "UTC+4",
    "45": "UTC+4:30", "50": "UTC+5", "55": "UTC+5:30", "57": "UTC+5:45", "60": "UTC+6",
    "65": "UTC+6:30", "70": "UTC+7", "80": "UTC+8", "90": "UTC+9", "95": "UTC+9:30",
    "100": "UTC+10", "105": "UTC+10:30", "110": "UTC+11", "120": "UTC+12",
    "127": "UTC+12:45", "130": "UTC+13", "140": "UTC+14",
  };
  return getValue(timezone_map, String(time_zone));
}

function readTVOCUnit(status: number): string {
  return getValue({ 0: "iaq", 1: "µg/m³" }, status);
}

function readCalibrationMode(status: number): string {
  return getValue({ 0: "factory", 1: "abc", 2: "manual", 3: "background", 4: "zero" }, status);
}

function readLedIndicatorMode(status: number): string {
  return getValue({ 0: "off", 1: "on", 2: "blink" }, status);
}

function readScreenDisplayElementSettings(bytes: Buffer | number[]): Record<string, string> {
  const mask = readUInt16LE([bytes[0], bytes[1]]);
  const data = readUInt16LE([bytes[2], bytes[3]]);

  const settings: Record<string, string> = {};
  const sensor_bit_offset: Record<string, number> = {
    temperature: 0, humidity: 1, co2: 2, light: 3, tvoc: 4,
    smile: 5, letter: 6, pm2_5: 7, pm10: 8,
  };

  for (const key in sensor_bit_offset) {
    if ((mask >>> sensor_bit_offset[key]) & 0x01) {
      settings[key] = readEnableStatus((data >> sensor_bit_offset[key]) & 0x01);
    }
  }
  return settings;
}

function readChildLockSettings(data: number): Record<string, string> {
  const button_bit_offset: Record<string, number> = { off_button: 0, on_button: 1, collection_button: 2 };
  const settings: Record<string, string> = {};
  for (const key in button_bit_offset) {
    settings[key] = readEnableStatus((data >> button_bit_offset[key]) & 0x01);
  }
  return settings;
}

interface DecodedData {
  [key: string]: string | number | Record<string, unknown> | Array<Record<string, unknown>> | undefined;
  history?: Array<Record<string, unknown>>;
}

function handleDownlinkResponse(
  channel_type: number,
  bytes: Buffer,
  offset: number
): { data: DecodedData; offset: number } {
  const decoded: DecodedData = {};

  switch (channel_type) {
    case 0x03:
      decoded.report_interval = readUInt16LE(bytes.subarray(offset, offset + 2));
      offset += 2;
      break;
    case 0x10:
      decoded.reboot = readYesNoStatus(1);
      offset += 1;
      break;
    case 0x17:
      decoded.time_zone = readTimeZone(readInt16LE(bytes.subarray(offset, offset + 2)));
      offset += 2;
      break;
    case 0x1a: {
      const mode_value = readUInt8(bytes[offset]);
      decoded.co2_calibration_mode = readCalibrationMode(mode_value);
      if (mode_value === 2) {
        decoded.co2_calibration_value = readUInt16LE(bytes.subarray(offset + 1, offset + 3));
        offset += 3;
      } else {
        offset += 1;
      }
      break;
    }
    case 0x25:
      decoded.child_lock_settings = readChildLockSettings(bytes[offset]);
      offset += 1;
      break;
    case 0x27:
      decoded.clear_history = readYesNoStatus(1);
      offset += 1;
      break;
    case 0x2c:
      decoded.query_status = readYesNoStatus(1);
      offset += 1;
      break;
    case 0x2d:
      decoded.screen_display_enable = readEnableStatus(bytes[offset]);
      offset += 1;
      break;
    case 0x2e:
      decoded.led_indicator_mode = readLedIndicatorMode(bytes[offset]);
      offset += 1;
      break;
    case 0xeb:
      decoded.tvoc_unit = readTVOCUnit(bytes[offset]);
      offset += 1;
      break;
    case 0x39:
      decoded.co2_abc_calibration_enable = readEnableStatus(bytes[offset]);
      offset += 5;
      break;
    case 0x3a:
      decoded.report_interval = readUInt16LE(bytes.subarray(offset, offset + 2));
      offset += 2;
      break;
    case 0x3b:
      decoded.time_sync_enable = readEnableStatus(bytes[offset]);
      offset += 1;
      break;
    case 0x3c:
      decoded.screen_display_pattern = bytes[offset];
      offset += 1;
      break;
    case 0x3d:
      decoded.stop_buzzer = readYesNoStatus(1);
      offset += 1;
      break;
    case 0x3e:
      decoded.buzzer_enable = readEnableStatus(bytes[offset]);
      offset += 1;
      break;
    case 0x65:
      decoded.pm2_5_collection_interval = readUInt16LE(bytes.subarray(offset, offset + 2));
      offset += 2;
      break;
    case 0x66:
      decoded.screen_display_alarm_enable = readEnableStatus(bytes[offset]);
      offset += 1;
      break;
    case 0x68:
      decoded.history_enable = readEnableStatus(bytes[offset]);
      offset += 1;
      break;
    case 0x69:
      decoded.retransmit_enable = readEnableStatus(bytes[offset]);
      offset += 1;
      break;
    case 0x6a: {
      const interval_type = readUInt8(bytes[offset]);
      if (interval_type === 0) {
        decoded.retransmit_interval = readUInt16LE(bytes.subarray(offset + 1, offset + 3));
      } else if (interval_type === 1) {
        decoded.resend_interval = readUInt16LE(bytes.subarray(offset + 1, offset + 3));
      }
      offset += 3;
      break;
    }
    case 0x6d:
      decoded.stop_transmit = readYesNoStatus(1);
      offset += 1;
      break;
    case 0xf0:
      decoded.screen_display_element_settings = readScreenDisplayElementSettings(bytes.subarray(offset, offset + 4));
      offset += 4;
      break;
    case 0xf4:
      decoded.co2_calibration_enable = readEnableStatus(bytes[offset]);
      offset += 1;
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
    // DEVICE STATUS
    else if (channel_id === 0xff && channel_type === 0x0b) {
      decoded.device_status = readDeviceStatus(bytes[i]);
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
    // BATTERY
    else if (channel_id === 0x01 && channel_type === 0x75) {
      decoded.battery = readUInt8(bytes[i]);
      i += 1;
    }
    // TEMPERATURE
    else if (channel_id === 0x03 && channel_type === 0x67) {
      decoded.temperature = readInt16LE(bytes.subarray(i, i + 2)) / 10;
      i += 2;
    }
    // HUMIDITY
    else if (channel_id === 0x04 && channel_type === 0x68) {
      decoded.humidity = readUInt8(bytes[i]) / 2;
      i += 1;
    }
    // PIR
    else if (channel_id === 0x05 && channel_type === 0x00) {
      decoded.pir = readPIRStatus(bytes[i]);
      i += 1;
    }
    // LIGHT
    else if (channel_id === 0x06 && channel_type === 0xcb) {
      decoded.light_level = readUInt8(bytes[i]);
      i += 1;
    }
    // CO2
    else if (channel_id === 0x07 && channel_type === 0x7d) {
      decoded.co2 = readUInt16LE(bytes.subarray(i, i + 2));
      i += 2;
    }
    // TVOC (iaq)
    else if (channel_id === 0x08 && channel_type === 0x7d) {
      decoded.tvoc = readUInt16LE(bytes.subarray(i, i + 2)) / 100;
      i += 2;
    }
    // TVOC (µg/m³)
    else if (channel_id === 0x08 && channel_type === 0xe6) {
      decoded.tvoc = readUInt16LE(bytes.subarray(i, i + 2));
      i += 2;
    }
    // PRESSURE
    else if (channel_id === 0x09 && channel_type === 0x73) {
      decoded.pressure = readUInt16LE(bytes.subarray(i, i + 2)) / 10;
      i += 2;
    }
    // PM2.5
    else if (channel_id === 0x0b && channel_type === 0x7d) {
      decoded.pm2_5 = readUInt16LE(bytes.subarray(i, i + 2));
      i += 2;
    }
    // PM10
    else if (channel_id === 0x0c && channel_type === 0x7d) {
      decoded.pm10 = readUInt16LE(bytes.subarray(i, i + 2));
      i += 2;
    }
    // BEEP
    else if (channel_id === 0x0e && channel_type === 0x01) {
      decoded.buzzer_status = readBuzzerStatus(bytes[i]);
      i += 1;
    }
    // HISTORY DATA (AM308) with tvoc unit: iaq
    else if (channel_id === 0x20 && channel_type === 0xce) {
      const data: Record<string, unknown> = {};
      data.timestamp = readUInt32LE(bytes.subarray(i, i + 4));
      data.temperature = readInt16LE(bytes.subarray(i + 4, i + 6)) / 10;
      data.humidity = readUInt16LE(bytes.subarray(i + 6, i + 8)) / 2;
      data.pir = readPIRStatus(bytes[i + 8]);
      data.light_level = readUInt8(bytes[i + 9]);
      data.co2 = readUInt16LE(bytes.subarray(i + 10, i + 12));
      data.tvoc = readUInt16LE(bytes.subarray(i + 12, i + 14)) / 100;
      data.pressure = readUInt16LE(bytes.subarray(i + 14, i + 16)) / 10;
      data.pm2_5 = readUInt16LE(bytes.subarray(i + 16, i + 18));
      data.pm10 = readUInt16LE(bytes.subarray(i + 18, i + 20));
      i += 20;

      decoded.history = decoded.history || [];
      decoded.history.push(data);
    }
    // HISTORY DATA (AM308) with tvoc unit: µg/m³
    else if (channel_id === 0x21 && channel_type === 0xce) {
      const data: Record<string, unknown> = {};
      data.timestamp = readUInt32LE(bytes.subarray(i, i + 4));
      data.temperature = readInt16LE(bytes.subarray(i + 4, i + 6)) / 10;
      data.humidity = readUInt16LE(bytes.subarray(i + 6, i + 8)) / 2;
      data.pir = readPIRStatus(bytes[i + 8]);
      data.light_level = readUInt8(bytes[i + 9]);
      data.co2 = readUInt16LE(bytes.subarray(i + 10, i + 12));
      data.tvoc = readUInt16LE(bytes.subarray(i + 12, i + 14));
      data.pressure = readUInt16LE(bytes.subarray(i + 14, i + 16)) / 10;
      data.pm2_5 = readUInt16LE(bytes.subarray(i + 16, i + 18));
      data.pm10 = readUInt16LE(bytes.subarray(i + 18, i + 20));
      i += 20;

      decoded.history = decoded.history || [];
      decoded.history.push(data);
    }
    // RESPONSE DATA
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
    if (key === "history" && Array.isArray(decoded.history)) {
      for (let idx = 0; idx < decoded.history.length; idx++) {
        const historyItem = decoded.history[idx];
        const historyGroup = historyItem.timestamp ? String(historyItem.timestamp) : `${group}_${idx}`;
        for (const histKey in historyItem) {
          if (histKey === "timestamp") continue;
          result.push({
            variable: histKey,
            value: historyItem[histKey] as string | number | boolean,
            group: historyGroup,
          });
        }
      }
    } else if (typeof decoded[key] === "object" && decoded[key] !== null) {
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
