/* eslint-disable no-bitwise */

/**
 * Dragino MDS120-LB/LS - TagoIO Decoder
 * Ultrasonic Distance Sensor
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
  const distance = (bytes[2 + i] << 8) | bytes[3 + i];
  const value3 = (bytes[4 + i] << 8) | bytes[5 + i];
  const flag1 = (bytes[6 + i] >> 1) & 0x01 ? "TRUE" : "FALSE";
  const flag2 = bytes[6 + i] & 0x40 ? "1" : "0";
  const timestamp = (bytes[7 + i] << 24) | (bytes[8 + i] << 16) | (bytes[9 + i] << 8) | bytes[10 + i];
  const time = getMyDate(timestamp);

  return `[${bat},${distance},${value3},${flag1},${flag2},${time}],`;
}

function Decoder(bytes: Buffer, port: number): Data[] | null {
  const decoded: Data[] = [];
  const group = String(new Date().getTime());

  // fPort 2 - Sensor data (8 bytes)
  if (port === 2 && bytes.length === 8) {
    const batValue = ((bytes[0] << 8) | bytes[1]) & 0x3fff;
    const bat_v = batValue / 1000;

    const distValue = (bytes[2] << 8) | bytes[3];
    const distance = distValue === 0x3fff ? "Invalid Reading" : distValue;

    const interrupt_flag = bytes[4] & 0x01;

    let tempValue = (bytes[5] << 8) | bytes[6];
    if (bytes[5] & 0x80) {
      tempValue |= 0xffff0000;
    }
    const temp_ds18b20 = Number((tempValue / 10).toFixed(2));

    const sensor_flag = bytes[7] & 0x01;

    decoded.push({ variable: "bat_v", value: bat_v, unit: "V", group });
    decoded.push({ variable: "distance", value: distance, unit: "mm", group });
    decoded.push({ variable: "temp_ds18b20", value: temp_ds18b20, unit: "°C", group });
    decoded.push({ variable: "interrupt_flag", value: interrupt_flag, group });
    decoded.push({ variable: "sensor_flag", value: sensor_flag, group });

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

  // fPort 5 - Device info (7 bytes)
  if (port === 5 && bytes.length === 7) {
    let sensor_model;
    if (bytes[0] === 0x2a) sensor_model = "MDS120-LB";

    const freq_bands: { [key: number]: string } = {
      0x01: "EU868", 0x02: "US915", 0x03: "IN865", 0x04: "AU915",
      0x05: "KZ865", 0x06: "RU864", 0x07: "AS923", 0x08: "AS923_1",
      0x09: "AS923_2", 0x0a: "AS923_3", 0x0b: "CN470", 0x0c: "EU433",
      0x0d: "KR920", 0x0e: "MA869",
    };
    const firmware_version = `${bytes[1] & 0x0f}.${(bytes[2] >> 4) & 0x0f}.${bytes[2] & 0x0f}`;
    const frequency_band = freq_bands[bytes[3]] || "Unknown";
    const sub_band = bytes[4] === 0xff ? "NULL" : bytes[4];
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
