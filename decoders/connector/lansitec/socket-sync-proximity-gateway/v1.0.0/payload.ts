/* Bluetooth Gateway - TagoIO MQTT Payload Parser TypeScript Version
 *
 * Supports:
 * 1. RAW hex string
 * 2. TagoIO payload array
 *
 * Expected MQTT payload:
 * Hex string
 */

interface TagoIOPayloadItem {
  variable: string;
  value: any;
  group?: string;
  metadata?: Record<string, any>;
  unit?: string;
  [key: string]: any;
}

interface DecodedPayload {
  [key: string]: any;
}

declare let payload: TagoIOPayloadItem[] | string;

let mqtt_payload: TagoIOPayloadItem | undefined;

// -----------------------------
// TagoIO input normalization
// -----------------------------

if (Array.isArray(payload)) {
  mqtt_payload = payload.find((data: TagoIOPayloadItem) => data.variable === "payload" || Boolean(data.metadata?.mqtt_topic));
} else if (typeof payload === "string") {
  mqtt_payload = {
    variable: "payload",
    value: payload,
    metadata: {},
  };

  payload = [mqtt_payload];
}

const group = String(Date.now());

if (mqtt_payload) {
  try {
    const hex = String(mqtt_payload.value).trim();

    if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
      throw new Error("Invalid hexadecimal payload");
    }

    const bytes = hexStringToByteArray(hex);

    if (!bytes || bytes.length === 0) {
      throw new Error("Empty payload");
    }

    const decoded = decodePayload(bytes);

    if (!decoded) {
      const uplinkType = (bytes[0] >> 4) & 0x0f;

      payload = (payload as TagoIOPayloadItem[]).concat([
        {
          variable: "unknown_uplink_type",
          value: `0x${uplinkType.toString(16).padStart(2, "0")}`,
          group,
          metadata: {
            original_payload: hex,
          },
        },
      ]);
    } else {
      const tagoData = objectToTagoIO(decoded, group);
      payload = (payload as TagoIOPayloadItem[]).concat(tagoData);
    }
  } catch (error: any) {
    payload = (payload as TagoIOPayloadItem[]).concat([
      {
        variable: "parser_error",
        value: error.message,
        group,
        metadata: {
          original_payload: mqtt_payload.value,
        },
      },
    ]);
  }
}

// -----------------------------
// TagoIO output helper
// -----------------------------

function objectToTagoIO(obj: DecodedPayload, group: string, prefix?: string): TagoIOPayloadItem[] {
  let result: TagoIOPayloadItem[] = [];

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const variable = prefix ? `${prefix}_${key}` : key;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          result = result.concat(objectToTagoIO(item, group, `${variable}_${index + 1}`));
        } else {
          result.push({
            variable: `${variable}_${index + 1}`,
            value: item,
            group,
          });
        }
      });
    } else if (typeof value === "object" && value !== null) {
      result = result.concat(objectToTagoIO(value, group, variable));
    } else {
      result.push({
        variable,
        value,
        group,
      });
    }
  });

  return result;
}

// -----------------------------
// Main decoder
// -----------------------------

function decodePayload(bytes: number[]): DecodedPayload | null {
  const uplinkType = (bytes[0] >> 4) & 0x0f;

  switch (uplinkType) {
    case 0x01:
      return decodeRegistration(bytes);

    case 0x02:
      return decodeHeartbeat(bytes);

    case 0x03:
      return decodeDeviceReportRule(bytes);

    case 0x04:
      return decodeGNSSPosition(bytes);

    case 0x05:
      return decodeWaterLevelDetection(bytes);

    case 0x08:
      return decodeDeviceType1(bytes);

    case 0x09:
      return decodeDeviceType2(bytes);

    case 0x0a:
      return decodeDeviceType3(bytes);

    case 0x0e:
      return decodeMultiDeviceTypeMessage(bytes);

    case 0x0f:
      return decodeAcknowledgment(bytes);

    default:
      return null;
  }
}

// -----------------------------
// type: 0x1 Registration
// -----------------------------

function decodeRegistration(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {};

  data.type = "Registration";

  data.adr = ((bytes[0] >> 3) & 0x1) === 0 ? "OFF" : "ON";
  data.mode = bytes[0] & 0x07;

  const loRaWANBandValue = bytes[1];

  if (loRaWANBandValue === 0x00) {
    data.loRaWANBand = "KR920";
  } else if (loRaWANBandValue === 0x01) {
    data.loRaWANBand = "AU915";
  } else if (loRaWANBandValue === 0x04) {
    data.loRaWANBand = "CN470";
  } else if (loRaWANBandValue === 0x08) {
    data.loRaWANBand = "AS923";
  } else if (loRaWANBandValue === 0x10) {
    data.loRaWANBand = "EU433";
  } else if (loRaWANBandValue === 0x20) {
    data.loRaWANBand = "EU868";
  } else if (loRaWANBandValue === 0x40) {
    data.loRaWANBand = "US915";
  }

  data.power = `${(bytes[2] >> 3) & 0x1f}dBm`;

  data.continuousBleReceiveEnable = ((bytes[2] >> 1) & 0x1) === 0 ? "Disable" : "Enable";

  data.dr = (bytes[3] >> 4) & 0x0f;

  data.positionReportInterval = `${(((bytes[4] << 8) & 0xff00) | (bytes[5] & 0xff)) * 5}s`;

  data.heartbeatInterval = `${bytes[6] * 30}s`;
  data.bleReceivingDuration = `${bytes[7]}s`;
  data.networkReconnectionInterval = `${bytes[8] * 5}min`;

  return data;
}

// -----------------------------
// type: 0x2 Heartbeat
// -----------------------------

function decodeHeartbeat(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {};

  data.type = "Heartbeat";

  const batteryValue = bytes[1];

  if (batteryValue > 100) {
    data.battery = `${bytes[1] / 100 + 1.5}V`;
  } else {
    data.battery = `${bytes[1]}%`;
  }

  data.rssi = `${bytes[2] * -1}dBm`;

  data.snr = `${(((bytes[3] << 8) & 0xff00) | (bytes[4] & 0xff)) / 100}dB`;

  data.version = ((bytes[5] << 8) & 0xff00) | (bytes[6] & 0xff);

  const chargeStateValue = bytes[7] & 0xff;

  if (chargeStateValue === 0x00) {
    data.chargeState = "Not charging";
  } else if (chargeStateValue === 0x50) {
    data.chargeState = "Charging";
  } else if (chargeStateValue === 0x60) {
    data.chargeState = "Charging completed";
  }

  return data;
}

// -----------------------------
// type: 0x3 DeviceReportRule
// -----------------------------

function decodeDeviceReportRule(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {};

  data.type = "DeviceReportRule";
  data.deviceTypeQuantity = bytes[1] & 0xff;
  data.deviceTypeId = (bytes[2] >> 4) & 0x0f;
  data.filterAndDataBlockQuantity = bytes[2] & 0x0f;

  const filterBlock: DecodedPayload[] = [];
  const dataBlock: DecodedPayload[] = [];
  const macBlock: DecodedPayload[] = [];

  let index = 3;

  for (let i = 0; i < data.filterAndDataBlockQuantity; i++) {
    const ruleType = bytes[index++] & 0xff;
    const startAddress = bytes[index++] & 0xff;
    const endAddress = bytes[index++] & 0xff;

    const filter: DecodedPayload = {};

    if (ruleType === 1) {
      filter.ruleType = "FilterBlock";
      filter.startAddress = byteToHex(startAddress);
      filter.endAddress = byteToHex(endAddress);

      const len = endAddress - startAddress;
      let filterValue = "";

      for (let j = 0; j < len + 1; j++) {
        filterValue += byteToHex(bytes[index + j]);
      }

      filter.value = filterValue;
      index = index + (endAddress - startAddress + 1);
      filterBlock.push(filter);
    } else if (ruleType === 2) {
      filter.ruleType = "DataBlock";
      filter.startAddress = byteToHex(startAddress);
      filter.endAddress = byteToHex(endAddress);
      dataBlock.push(filter);
    } else if (ruleType === 3) {
      filter.ruleType = "MACBlock";
      filter.startAddress = byteToHex(startAddress);
      filter.endAddress = byteToHex(endAddress);
      macBlock.push(filter);
    }
  }

  data.filterBlock = filterBlock;
  data.dataBlock = dataBlock;
  data.macBlock = macBlock;

  return data;
}

// -----------------------------
// type: 0x04 GNSS Position
// -----------------------------

function decodeGNSSPosition(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {};

  data.type = "GNSSPosition";

  data.gnssState = (bytes[0] & 0x01) === 0 ? "Success" : "Fail";

  const longitude = (bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4];

  data.longitude = hex2float(longitude);

  const latitude = (bytes[5] << 24) | (bytes[6] << 16) | (bytes[7] << 8) | bytes[8];

  data.latitude = hex2float(latitude);

  data.location = `${data.latitude},${data.longitude}`;

  const time = (bytes[9] << 24) | (bytes[10] << 16) | (bytes[11] << 8) | bytes[12];

  data.time = timestampToTime((time + 8 * 60 * 60) * 1000);

  return data;
}

// -----------------------------
// type: 0x5 Water Level Detection
// -----------------------------

function decodeWaterLevelDetection(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {};

  data.type = "WaterLevelDetection";
  data.waterLevel = `${((bytes[1] << 8) & 0xff00) | (bytes[2] & 0xff)}mm`;

  return data;
}

// -----------------------------
// type: 0x8 DeviceType1
// -----------------------------

function decodeDeviceType1(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {
    type: "DeviceType1",
    number: bytes[0] & 0x0f,
  };

  let index = 1;

  for (let i = 0; i < data.number; i++) {
    const major = ((bytes[index] << 8) | bytes[index + 1]).toString(16).toUpperCase().padStart(4, "0");

    const minor = ((bytes[index + 2] << 8) | bytes[index + 3]).toString(16).toUpperCase().padStart(4, "0");

    const rssi = `${bytes[index + 4] - 256}dBm`;

    data[`beacon${i + 1}`] = major + minor;
    data[`rssi${i + 1}`] = rssi;

    index = index + 5;
  }

  return data;
}

// -----------------------------
// type: 0x9 DeviceType2
// -----------------------------

function decodeDeviceType2(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {
    type: "DeviceType2",
    number: bytes[0] & 0x0f,
  };

  let index = 1;

  for (let i = 0; i < data.number; i++) {
    const major = ((bytes[index] << 8) | bytes[index + 1]).toString(16).toUpperCase().padStart(4, "0");

    const minor = ((bytes[index + 2] << 8) | bytes[index + 3]).toString(16).toUpperCase().padStart(4, "0");

    const rssi = `${bytes[index + 4] - 256}dBm`;

    data[`beacon${i + 1}`] = major + minor;
    data[`rssi${i + 1}`] = rssi;

    index = index + 5;
  }

  return data;
}

// -----------------------------
// type: 0xa DeviceType3
// -----------------------------

function decodeDeviceType3(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {
    type: "DeviceType3",
    number: bytes[0] & 0x0f,
  };

  let index = 1;

  for (let i = 0; i < data.number; i++) {
    const major = ((bytes[index] << 8) | bytes[index + 1]).toString(16).toUpperCase().padStart(4, "0");

    const minor = ((bytes[index + 2] << 8) | bytes[index + 3]).toString(16).toUpperCase().padStart(4, "0");

    const rssi = `${bytes[index + 4] - 256}dBm`;

    data[`beacon${i + 1}`] = major + minor;
    data[`rssi${i + 1}`] = rssi;

    index = index + 5;
  }

  return data;
}

// -----------------------------
// type: 0xe Multi Device Type Message
// -----------------------------

function decodeMultiDeviceTypeMessage(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {
    type: "MultiDeviceTypeMessage",
    number: bytes[0] & 0x0f,
  };

  for (let i = 0; i < data.number; i++) {
    const index = 1 + 6 * i;

    const deviceTypeId = bytes[index];

    const major = ((bytes[index + 1] << 8) | bytes[index + 2]).toString(16).toUpperCase().padStart(4, "0");

    const minor = ((bytes[index + 3] << 8) | bytes[index + 4]).toString(16).toUpperCase().padStart(4, "0");

    const rssi = `${bytes[index + 5] - 256}dBm`;

    data[`deviceTypeId${i + 1}`] = deviceTypeId;
    data[`beacon${i + 1}`] = major + minor;
    data[`rssi${i + 1}`] = rssi;
  }

  return data;
}

// -----------------------------
// type: 0xf Acknowledgment
// -----------------------------

function decodeAcknowledgment(bytes: number[]): DecodedPayload {
  const data: DecodedPayload = {};

  data.type = "Acknowledgment";
  data.result = (bytes[0] & 0x0f) === 0 ? "Success" : "Failure";
  data.msgId = (bytes[1] & 0xff).toString(16).toUpperCase();

  return data;
}

// -----------------------------
// Common helpers
// -----------------------------

function byteToHex(value: number): string {
  return value.toString(16).toUpperCase().padStart(2, "0");
}

function hex2float(num: number): number {
  const normalizedNum = num >>> 0;

  const sign = normalizedNum & 0x80000000 ? -1 : 1;
  const exponent = (normalizedNum >>> 23) & 0xff;
  const fraction = normalizedNum & 0x7fffff;

  if (exponent === 0xff) {
    return fraction === 0 ? sign * Number.POSITIVE_INFINITY : Number.NaN;
  }

  if (exponent === 0) {
    return fraction === 0 ? sign * 0 : sign * 2 ** -126 * (fraction / 0x800000);
  }

  return sign * 2 ** (exponent - 127) * (1 + fraction / 0x800000);
}

function hexStringToByteArray(hexString: string): number[] {
  const byteArray: number[] = [];

  for (let i = 0; i < hexString.length; i += 2) {
    byteArray.push(Number.parseInt(hexString.substr(i, 2), 16));
  }

  return byteArray;
}

function timestampToTime(timestamp: number): string {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");
  const second = date.getSeconds().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
