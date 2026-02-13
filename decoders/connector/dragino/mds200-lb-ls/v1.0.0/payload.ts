/* eslint-disable no-bitwise */

/**
 * Dragino MDS200-LB/LS - TagoIO Decoder
 * Dual Ultrasonic Distance Sensor
 */

// Only include these variables in output (empty array = keep all)
const keep_vars: string[] = [];

function getzf(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

function getMyDate(timestamp: number): string {
  const c_Date = timestamp > 9999999999 ? new Date(timestamp) : new Date(timestamp * 1000);
  const c_Year = c_Date.getFullYear();
  const c_Month = c_Date.getMonth() + 1;
  const c_Day = c_Date.getDate();
  const c_Hour = c_Date.getHours();
  const c_Min = c_Date.getMinutes();
  const c_Sen = c_Date.getSeconds();
  return `${c_Year}-${getzf(c_Month)}-${getzf(c_Day)} ${getzf(c_Hour)}:${getzf(c_Min)}:${getzf(c_Sen)}`;
}

function datalogEntry(i: number, bytes: Buffer): string {
  const bat = ((bytes[0 + i] << 8) | bytes[1 + i]) / 1000;
  const distance_1 = (bytes[2 + i] << 8) | bytes[3 + i];
  const distance_2 = (bytes[4 + i] << 8) | bytes[5 + i];
  const interrupt_alarm = bytes[6 + i] & 0x01 ? "YES" : "NO";
  const distance_alarm = (bytes[6 + i] >> 1) & 0x01 ? "TRUE" : "FALSE";
  const flag3 = bytes[6 + i] & 0x40 ? "1" : "0";
  const timestamp = (bytes[7 + i] << 24) | (bytes[8 + i] << 16) | (bytes[9 + i] << 8) | bytes[10 + i];
  const time = getMyDate(timestamp);

  return `[${bat},${distance_1},${distance_2},${interrupt_alarm},${distance_alarm},${flag3},${time}],`;
}

function Decoder(bytes: Buffer, port: number): Data[] | null {
  const decoded: Data[] = [];
  const group = String(new Date().getTime());

  // fPort 2 - Sensor data (7 bytes, first byte not 0x2B)
  if (port === 2 && bytes.length === 7 && bytes[0] !== 0x2b) {
    const bat_v = ((bytes[0] << 8) | bytes[1]) / 1000;
    const distance_1 = (bytes[2] << 8) | bytes[3];
    const distance_2 = (bytes[4] << 8) | bytes[5];

    const dalarm_count = (bytes[6] >> 2) & 0x3f;
    const distance_alarm = (bytes[6] >> 1) & 0x01;
    const interrupt_alarm = bytes[6] & 0x01;

    decoded.push({ variable: "bat_v", value: bat_v, unit: "V", group });
    decoded.push({ variable: "distance_1", value: distance_1, unit: "mm", group });
    decoded.push({ variable: "distance_2", value: distance_2, unit: "mm", group });
    decoded.push({ variable: "dalarm_count", value: dalarm_count, group });
    decoded.push({ variable: "distance_alarm", value: distance_alarm, group });
    decoded.push({ variable: "interrupt_alarm", value: interrupt_alarm, group });

    return decoded;
  }

  // fPort 3 - Datalog (11 bytes per entry)
  if (port === 3 && bytes.length >= 11 && bytes.length % 11 === 0) {
    const pnackmd = (bytes[0] >> 7) & 0x01 ? "True" : "False";
    let datalog = "";
    for (let i = 0; i < bytes.length; i += 11) {
      datalog += datalogEntry(i, bytes);
    }

    decoded.push({ variable: "pnackmd", value: pnackmd, group });
    decoded.push({ variable: "datalog", value: datalog, group });

    return decoded;
  }

  // fPort 4 - Configuration (8 or 9 bytes)
  if (port === 4 && (bytes.length === 8 || bytes.length === 9)) {
    const tdc = (bytes[0] << 16) | (bytes[1] << 8) | bytes[2];
    const atdc = bytes[3];
    const alarm_min = (bytes[4] << 8) | bytes[5];
    const alarm_max = (bytes[6] << 8) | bytes[7];

    decoded.push({ variable: "tdc", value: tdc, group });
    decoded.push({ variable: "atdc", value: atdc, group });
    decoded.push({ variable: "alarm_min", value: alarm_min, group });
    decoded.push({ variable: "alarm_max", value: alarm_max, group });

    if (bytes.length === 9) {
      decoded.push({ variable: "interrupt", value: bytes[8], group });
    }

    return decoded;
  }

  // fPort 5 - Device info (7 bytes)
  if (port === 5 && bytes.length === 7) {
    let sensor_model;
    if (bytes[0] === 0x2b) sensor_model = "MDS200-LB";

    const freq_bands: { [key: number]: string } = {
      0x01: "EU868", 0x02: "US915", 0x03: "IN865", 0x04: "AU915",
      0x05: "KZ865", 0x06: "RU864", 0x07: "AS923", 0x08: "AS923-1",
      0x09: "AS923-2", 0x0a: "AS923-3", 0x0b: "CN470", 0x0c: "EU433",
      0x0d: "KR920", 0x0e: "MA869",
    };
    const versionHex = ((bytes[1] << 8) | bytes[2]).toString(16);
    const firmware_version = parseInt(versionHex, 10);
    const frequency_band = freq_bands[bytes[3]] || "Unknown";
    const sub_band = bytes[4];
    const bat_v = ((bytes[5] << 8) | bytes[6]) / 1000;

    decoded.push({ variable: "sensor_model", value: sensor_model, group });
    decoded.push({ variable: "firmware_version", value: firmware_version, group });
    decoded.push({ variable: "frequency_band", value: frequency_band, group });
    decoded.push({ variable: "sub_band", value: sub_band, group });
    decoded.push({ variable: "bat_v", value: bat_v, unit: "V", group });

    return decoded;
  }

  return null;
}

const payload_raw = payload.find(
  (x) =>
    x.variable === "payload_raw" ||
    x.variable === "payload" ||
    x.variable === "data" ||
    x.variable === "payload_hex"
);

const portEntry = payload.find((x) => x.variable === "port" || x.variable === "fport" || x.variable === "FPort" || x.variable === "fPort");
const port = portEntry ? parseInt(portEntry.value as string, 10) : null;

if (payload_raw && port) {
  try {
    const buffer = Buffer.from(payload_raw.value as string, "hex");
    const decoded = Decoder(buffer, port);
    if (decoded) {
      const filtered = keep_vars.length ? decoded.filter((d) => keep_vars.includes(d.variable)) : decoded;
      payload = filtered;
    } else {
      payload = [];
    }
  } catch (e: unknown) {
    console.error(e);
    payload = [{ variable: "parse_error", value: e instanceof Error ? e.message : String(e) }];
  }
}
